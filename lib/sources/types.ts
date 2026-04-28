import type { SourceType } from "@/types/signal";

export type SourceRecord = {
  id: string;
  name: string;
  source_type: SourceType;
  url: string;
  enabled: boolean;
  crawl_frequency: string;
  risk_level: string;
  notes: string | null;
};

export type RawCollectedItem = {
  sourceId: string | null;
  sourceUrl: string;
  sourceType: SourceType;
  title: string;
  excerpt: string;
  content: string;
  metadata: Record<string, unknown>;
};

export type SourceAdapter = {
  type: SourceType;
  collect(source: SourceRecord): Promise<RawCollectedItem[]>;
};
