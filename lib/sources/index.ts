import { communityAdapter } from "@/lib/sources/community";
import { wechatAdapter } from "@/lib/sources/wechat";
import { websiteAdapter } from "@/lib/sources/website";
import { xiaohongshuAdapter } from "@/lib/sources/xiaohongshu";
import type { SourceRecord } from "@/lib/sources/types";

const adapters = {
  community: communityAdapter,
  wechat: wechatAdapter,
  website: websiteAdapter,
  xiaohongshu: xiaohongshuAdapter
};

export function getAdapterForSource(sourceType: SourceRecord["source_type"]) {
  return adapters[sourceType];
}
