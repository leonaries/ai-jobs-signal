import type { SqlClient } from "@/lib/db/client";
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

export async function collectSignals(sql: SqlClient): Promise<CollectSummary> {
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

  const sources = await loadEnabledSources(sql);
  summary.sources = sources.length;

  for (const source of sources) {
    try {
      const adapter = getAdapterForSource(source.source_type);
      const items = await adapter.collect(source);
      summary.collected += items.length;

      for (const item of items) {
        await processRawCollectedItem(sql, item, summary);
      }
    } catch (error) {
      summary.errors += 1;
      console.error(`Failed to collect source ${source.url}`, error);
    }
  }

  await updateDailyReport(sql);
  return summary;
}

async function loadEnabledSources(sql: SqlClient) {
  return sql<SourceRecord[]>`
    select *
    from sources
    where enabled = true
  `;
}

async function processRawCollectedItem(sql: SqlClient, item: RawCollectedItem, summary: CollectSummary) {
  const stored = await storeRawItem(sql, item);
  if (!stored.created) {
    summary.duplicate += 1;
    return;
  }

  const prefilter = prefilterRawItem(item);
  if (!prefilter.shouldProcess) {
    await updateRawItemStatus(sql, stored.item.id, "discarded");
    summary.discarded += 1;
    return;
  }

  try {
    const extracted = await extractSignal(item);
    const duplicate = await isDuplicateSignal(sql, {
      sourceUrl: item.sourceUrl,
      slug: titleToSlug(extracted.title),
      title: extracted.title
    });

    const signal = await publishSignal(sql, {
      rawItem: item,
      extracted,
      duplicate
    });

    await updateRawItemStatus(sql, stored.item.id, "processed");
    summary.processed += 1;

    if (signal.status === "published") summary.published += 1;
    if (signal.status === "needs_review") summary.review += 1;
    if (signal.status === "discarded") summary.discarded += 1;
    if (signal.status === "duplicate") summary.duplicate += 1;
  } catch (error) {
    await updateRawItemStatus(
      sql,
      stored.item.id,
      "error",
      error instanceof Error ? error.message : "Unknown processing error"
    );
    summary.errors += 1;
  }
}

async function updateDailyReport(sql: SqlClient) {
  const today = new Date().toISOString().slice(0, 10);
  const data = await sql<Signal[]>`
    select *
    from signals
    where status = 'published'
      and published_at >= ${`${today}T00:00:00.000Z`}
    order by published_at desc
  `;

  const report = summarizeDaily(data);
  await sql`
    insert into daily_reports (
      report_date,
      title,
      summary,
      hot_tags,
      rising_channels,
      published_signal_count
    ) values (
      ${today},
      ${report.title},
      ${report.summary},
      ${sql.json(report.hot_tags)},
      ${sql.json(report.rising_channels)},
      ${report.published_signal_count}
    )
    on conflict (report_date) do update set
      title = excluded.title,
      summary = excluded.summary,
      hot_tags = excluded.hot_tags,
      rising_channels = excluded.rising_channels,
      published_signal_count = excluded.published_signal_count
  `;
}
