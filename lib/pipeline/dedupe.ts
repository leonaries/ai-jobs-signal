import type { SupabaseClient } from "@supabase/supabase-js";

export async function isDuplicateSignal(
  supabase: SupabaseClient,
  input: {
    sourceUrl: string;
    slug: string;
    title: string;
  }
) {
  const { data: byUrl, error: byUrlError } = await supabase
    .from("signals")
    .select("id,title,source_url,slug")
    .eq("source_url", input.sourceUrl)
    .limit(1);

  if (byUrlError) {
    throw byUrlError;
  }

  if (byUrl && byUrl.length > 0) {
    return true;
  }

  const { data: bySlug, error: bySlugError } = await supabase
    .from("signals")
    .select("id,title,source_url,slug")
    .eq("slug", input.slug)
    .limit(1);

  if (bySlugError) {
    throw bySlugError;
  }

  if (bySlug && bySlug.length > 0) {
    return true;
  }

  const { data: recent, error: recentError } = await supabase
    .from("signals")
    .select("title")
    .order("created_at", { ascending: false })
    .limit(50);

  if (recentError) {
    throw recentError;
  }

  return (recent ?? []).some((signal) => titleSimilarity(signal.title, input.title) >= 0.86);
}

function titleSimilarity(a: string, b: string) {
  const aTokens = new Set(tokenize(a));
  const bTokens = new Set(tokenize(b));
  if (aTokens.size === 0 || bTokens.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) {
      intersection += 1;
    }
  }

  return intersection / Math.max(aTokens.size, bTokens.size);
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}
