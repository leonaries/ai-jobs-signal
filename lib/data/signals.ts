import { cache } from "react";
import { mockSignals } from "@/lib/mock-data";
import { getSql, hasDatabaseConfig } from "@/lib/db/client";
import type { Signal, SignalFilters, SkillTag } from "@/types/signal";

const PAGE_SIZE = 24;

export const getPublishedSignals = cache(async (filters: SignalFilters = {}) => {
  if (!hasDatabaseConfig()) {
    return filterMockSignals(filters);
  }

  const sql = getSql();

  try {
    const data = await sql<Signal[]>`
      select *
      from signals
      where status = 'published'
        and (${filters.channel ?? null}::signal_channel is null or channel = ${filters.channel ?? null}::signal_channel)
        and (${filters.sourceType ?? null}::source_type is null or source_type = ${filters.sourceType ?? null}::source_type)
      order by published_at desc nulls last
      limit ${PAGE_SIZE}
    `;
    return data.map(normalizeSignal);
  } catch (error) {
    console.error("Failed to fetch signals", error);
    return filterMockSignals(filters);
  }
});

export const getSignalBySlug = cache(async (slug: string) => {
  if (!hasDatabaseConfig()) {
    return mockSignals.find((signal) => signal.slug === slug) ?? null;
  }

  const sql = getSql();

  try {
    const data = await sql<Signal[]>`
      select *
      from signals
      where slug = ${slug}
        and status = 'published'
      limit 1
    `;
    return data[0] ? normalizeSignal(data[0]) : null;
  } catch (error) {
    console.error("Failed to fetch signal", error);
    return mockSignals.find((signal) => signal.slug === slug) ?? null;
  }
});

export const getHotTags = cache(async () => {
  const signals = await getPublishedSignals();
  const tagScores = new Map<string, number>();

  for (const signal of signals) {
    for (const tag of signal.skill_tags) {
      tagScores.set(tag.name, (tagScores.get(tag.name) ?? 0) + (tag.weight ?? 1));
    }
  }

  return [...tagScores.entries()]
    .map(([name, weight]) => ({ name, weight }) satisfies SkillTag)
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
    .slice(0, 10);
});

function filterMockSignals(filters: SignalFilters) {
  return mockSignals.filter((signal) => {
    if (filters.channel && signal.channel !== filters.channel) {
      return false;
    }

    if (filters.sourceType && signal.source_type !== filters.sourceType) {
      return false;
    }

    return true;
  });
}

function normalizeSignal(signal: Signal) {
  return {
    ...signal,
    published_at: normalizeNullableDate(signal.published_at),
    collected_at: normalizeDate(signal.collected_at),
    created_at: normalizeDate(signal.created_at),
    updated_at: normalizeDate(signal.updated_at)
  } satisfies Signal;
}

function normalizeDate(value: string | Date) {
  return value instanceof Date ? value.toISOString() : value;
}

function normalizeNullableDate(value: string | Date | null) {
  if (!value) {
    return null;
  }

  return normalizeDate(value);
}
