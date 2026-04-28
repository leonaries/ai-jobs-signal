import type { SqlClient } from "@/lib/db/client";
import { decideStatus, type ExtractedSignal } from "@/lib/ai/scoreSignal";
import type { RawCollectedItem } from "@/lib/sources/types";
import { titleToSlug } from "@/lib/utils/text";

export async function publishSignal(
  sql: SqlClient,
  input: {
    rawItem: RawCollectedItem;
    extracted: ExtractedSignal;
    duplicate: boolean;
  }
) {
  const slug = await createUniqueSlug(sql, titleToSlug(input.extracted.title));
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

  const data = await sql<Array<{ status: string }>>`
    insert into signals (
      slug,
      title,
      summary,
      source_id,
      source_url,
      source_type,
      company_name,
      team_name,
      channel,
      opportunity_type,
      city,
      remote_type,
      skill_tags,
      ai_native_score,
      confidence_score,
      status,
      published_at
    ) values (
      ${slug},
      ${input.extracted.title},
      ${input.extracted.summary},
      ${input.rawItem.sourceId},
      ${input.rawItem.sourceUrl},
      ${input.rawItem.sourceType}::source_type,
      ${input.extracted.company_name},
      ${input.extracted.team_name},
      ${input.extracted.channel}::signal_channel,
      ${input.extracted.opportunity_type}::opportunity_type,
      ${input.extracted.city},
      ${input.extracted.remote_type}::remote_type,
      ${sql.json(input.extracted.skill_tags)},
      ${input.extracted.ai_native_score},
      ${input.extracted.confidence_score},
      ${status}::signal_status,
      ${status === "published" ? new Date().toISOString() : null}
    )
    returning status
  `;

  return data[0];
}

async function createUniqueSlug(sql: SqlClient, baseSlug: string) {
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const data = await sql<Array<{ id: string }>>`
      select id
      from signals
      where slug = ${slug}
      limit 1
    `;

    if (!data[0]) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}
