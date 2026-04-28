import type { SupabaseClient } from "@supabase/supabase-js";
import { decideStatus, type ExtractedSignal } from "@/lib/ai/scoreSignal";
import type { RawCollectedItem } from "@/lib/sources/types";
import { titleToSlug } from "@/lib/utils/text";

export async function publishSignal(
  supabase: SupabaseClient,
  input: {
    rawItem: RawCollectedItem;
    extracted: ExtractedSignal;
    duplicate: boolean;
  }
) {
  const slug = await createUniqueSlug(supabase, titleToSlug(input.extracted.title));
  const hasCompleteXiaohongshuContext =
    input.rawItem.sourceType !== "xiaohongshu" ||
    Boolean(input.extracted.team_name || input.extracted.company_name) ||
    input.extracted.skill_tags.length >= 2;
  const status = decideStatus(
    input.extracted.confidence_score,
    input.rawItem.sourceType,
    hasCompleteXiaohongshuContext,
    input.duplicate
  );

  const { data, error } = await supabase
    .from("signals")
    .insert({
      slug,
      title: input.extracted.title,
      summary: input.extracted.summary,
      source_id: input.rawItem.sourceId,
      source_url: input.rawItem.sourceUrl,
      source_type: input.rawItem.sourceType,
      company_name: input.extracted.company_name,
      team_name: input.extracted.team_name,
      channel: input.extracted.channel,
      opportunity_type: input.extracted.opportunity_type,
      city: input.extracted.city,
      remote_type: input.extracted.remote_type,
      skill_tags: input.extracted.skill_tags,
      ai_native_score: input.extracted.ai_native_score,
      confidence_score: input.extracted.confidence_score,
      status,
      published_at: status === "published" ? new Date().toISOString() : null
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function createUniqueSlug(supabase: SupabaseClient, baseSlug: string) {
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase.from("signals").select("id").eq("slug", slug).maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}
