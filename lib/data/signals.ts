import { cache } from "react";
import { mockSignals } from "@/lib/mock-data";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { Signal, SignalFilters, SkillTag } from "@/types/signal";

const PAGE_SIZE = 24;

export const getPublishedSignals = cache(async (filters: SignalFilters = {}) => {
  if (!hasSupabaseConfig()) {
    return filterMockSignals(filters);
  }

  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("signals")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (filters.channel) {
    query = query.eq("channel", filters.channel);
  }

  if (filters.sourceType) {
    query = query.eq("source_type", filters.sourceType);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch signals", error);
    return filterMockSignals(filters);
  }

  return (data ?? []) as Signal[];
});

export const getSignalBySlug = cache(async (slug: string) => {
  if (!hasSupabaseConfig()) {
    return mockSignals.find((signal) => signal.slug === slug) ?? null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("signals")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch signal", error);
    return mockSignals.find((signal) => signal.slug === slug) ?? null;
  }

  return (data as Signal | null) ?? null;
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
