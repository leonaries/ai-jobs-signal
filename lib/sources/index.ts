import { communityAdapter } from "@/lib/sources/community";
import { officialSiteAdapter } from "@/lib/sources/official-site";
import { socialManualAdapter } from "@/lib/sources/social-manual";
import { xiaohongshuPublicUrlAdapter } from "@/lib/sources/xiaohongshu-public-url";
import type { SourceRecord } from "@/lib/sources/types";

const adapters = {
  community: communityAdapter,
  official_site: officialSiteAdapter,
  social_manual: socialManualAdapter,
  xiaohongshu_public_url: xiaohongshuPublicUrlAdapter
};

export function getAdapterForSource(sourceType: SourceRecord["source_type"]) {
  return adapters[sourceType];
}
