import type { SqlClient } from "@/lib/db/client";
import type { RawCollectedItem } from "@/lib/sources/types";
import { sha256 } from "@/lib/utils/hash";

export type StoredRawItem = {
  id: string;
  source_id: string | null;
  source_url: string;
  source_type: string;
  raw_title: string | null;
  raw_excerpt: string | null;
  raw_content_hash: string;
  raw_metadata: Record<string, unknown>;
  collected_at: string;
  processing_status: "pending" | "processed" | "discarded" | "error";
  error_message: string | null;
};

export function hashRawItem(item: RawCollectedItem) {
  return sha256(`${item.sourceUrl}\n${item.title}\n${item.content}`);
}

export async function storeRawItem(sql: SqlClient, item: RawCollectedItem) {
  const rawContentHash = hashRawItem(item);
  const existing = await sql<StoredRawItem[]>`
    select *
    from raw_items
    where raw_content_hash = ${rawContentHash}
    limit 1
  `;

  if (existing[0]) {
    return { item: existing[0], created: false };
  }

  const data = await sql<StoredRawItem[]>`
    insert into raw_items (
      source_id,
      source_url,
      source_type,
      raw_title,
      raw_excerpt,
      raw_content_hash,
      raw_metadata
    ) values (
      ${item.sourceId},
      ${item.sourceUrl},
      ${item.sourceType}::source_type,
      ${item.title},
      ${item.excerpt},
      ${rawContentHash},
      ${sql.json({
        ...item.metadata,
        contentLength: item.content.length
      })}
    )
    returning *
  `;

  return { item: data[0], created: true };
}

export async function updateRawItemStatus(
  sql: SqlClient,
  id: string,
  status: StoredRawItem["processing_status"],
  errorMessage?: string
) {
  await sql`
    update raw_items
    set processing_status = ${status}::raw_processing_status,
        error_message = ${errorMessage ?? null}
    where id = ${id}
  `;
}
