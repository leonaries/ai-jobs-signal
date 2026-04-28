import type { SupabaseClient } from "@supabase/supabase-js";
import { extractSignal } from "@/lib/ai/extractSignal";
import { summarizeDaily } from "@/lib/ai/summarizeDaily";
import { prefilterRawItem } from "@/lib/pipeline/prefilter";
import { isDuplicateSignal } from "@/lib/pipeline/dedupe";
import { publishSignal } from "@/lib/pipeline/publish";
import { storeRawItem, updateRawItemStatus } from "@/lib/pipeline/raw-items";
import { getAdapterForSource } from "@/lib/sources";
import type { RawCollectedItem, SourceRecord } from "@/lib/sources/types";
import { titleToSlug } from "@/lib/utils/text";
import type { Signal } from "@/types/signal";

export type CollectSummary = {
  sources: number;
  collected: number;
  processed: number;
  published: number;
  review: number;
  discarded: number;
  duplicate: number;
  errors: number;
};

export async function collectSignals(supabase: SupabaseClient): Promise<CollectSummary> {
  const summary: CollectSummary = {
    sources: 0,
    collected: 0,
    processed: 0,
    published: 0,
    review: 0,
    discarded: 0,
    duplicate: 0,
    errors: 0
  };

  const sources = await loadEnabledSources(supabase);
  summary.sources = sources.length;

  for (const source of sources) {
    try {
      const adapter = getAdapterForSource(source.source_type);
      const items = await adapter.collect(source);
      summary.collected += items.length;

      for (const item of items) {
        await processRawCollectedItem(supabase, item, summary);
      }
    } catch (error) {
      summary.errors += 1;
      console.error(`Failed to collect source ${source.url}`, error);
    }
  }

  await updateDailyReport(supabase);
  return summary;
}

async function loadEnabledSources(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("sources").select("*").eq("enabled", true);

  if (error) {
    throw error;
  }

  return (data ?? []) as SourceRecord[];
}

async function processRawCollectedItem(
  supabase: SupabaseClient,
  item: RawCollectedItem,
  summary: CollectSummary
) {
  const stored = await storeRawItem(supabase, item);
  if (!stored.created) {
    summary.duplicate += 1;
    return;
  }

  const prefilter = prefilterRawItem(item);
  if (!prefilter.shouldProcess) {
    await updateRawItemStatus(supabase, stored.item.id, "discarded");
    summary.discarded += 1;
    return;
  }

  try {
    const extracted = await extractSignal(item);
    const duplicate = await isDuplicateSignal(supabase, {
      sourceUrl: item.sourceUrl,
      slug: titleToSlug(extracted.title),
      title: extracted.title
    });

    const signal = await publishSignal(supabase, {
      rawItem: item,
      extracted,
      duplicate
    });

    await updateRawItemStatus(supabase, stored.item.id, "processed");
    summary.processed += 1;

    if (signal.status === "published") summary.published += 1;
    if (signal.status === "needs_review") summary.review += 1;
    if (signal.status === "discarded") summary.discarded += 1;
    if (signal.status === "duplicate") summary.duplicate += 1;
  } catch (error) {
    await updateRawItemStatus(
      supabase,
      stored.item.id,
      "error",
      error instanceof Error ? error.message : "Unknown processing error"
    );
    summary.errors += 1;
  }
}

async function updateDailyReport(supabase: SupabaseClient) {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("signals")
    .select("*")
    .eq("status", "published")
    .gte("published_at", `${today}T00:00:00.000Z`)
    .order("published_at", { ascending: false });

  if (error) {
    throw error;
  }

  const report = summarizeDaily((data ?? []) as Signal[]);
  const { error: upsertError } = await supabase.from("daily_reports").upsert(
    {
      report_date: today,
      ...report
    },
    {
      onConflict: "report_date"
    }
  );

  if (upsertError) {
    throw upsertError;
  }
}
