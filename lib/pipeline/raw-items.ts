import type { SupabaseClient } from "@supabase/supabase-js";
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

export async function storeRawItem(supabase: SupabaseClient, item: RawCollectedItem) {
  const rawContentHash = hashRawItem(item);
  const { data: existing, error: existingError } = await supabase
    .from("raw_items")
    .select("*")
    .eq("raw_content_hash", rawContentHash)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (existing) {
    return { item: existing as StoredRawItem, created: false };
  }

  const { data, error } = await supabase
    .from("raw_items")
    .insert({
      source_id: item.sourceId,
      source_url: item.sourceUrl,
      source_type: item.sourceType,
      raw_title: item.title,
      raw_excerpt: item.excerpt,
      raw_content_hash: rawContentHash,
      raw_metadata: {
        ...item.metadata,
        contentLength: item.content.length
      }
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return { item: data as StoredRawItem, created: true };
}

export async function updateRawItemStatus(
  supabase: SupabaseClient,
  id: string,
  status: StoredRawItem["processing_status"],
  errorMessage?: string
) {
  const { error } = await supabase
    .from("raw_items")
    .update({
      processing_status: status,
      error_message: errorMessage ?? null
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}
