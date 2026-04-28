import type { SqlClient } from "@/lib/db/client";

export async function isDuplicateSignal(
  sql: SqlClient,
  input: {
    sourceUrl: string;
    slug: string;
    title: string;
  }
) {
  const byUrl = await sql<Array<{ id: string }>>`
    select id
    from signals
    where source_url = ${input.sourceUrl}
    limit 1
  `;

  if (byUrl.length > 0) {
    return true;
  }

  const bySlug = await sql<Array<{ id: string }>>`
    select id
    from signals
    where slug = ${input.slug}
    limit 1
  `;

  if (bySlug.length > 0) {
    return true;
  }

  const recent = await sql<Array<{ title: string }>>`
    select title
    from signals
    order by created_at desc
    limit 50
  `;

  return recent.some((signal) => titleSimilarity(signal.title, input.title) >= 0.86);
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
