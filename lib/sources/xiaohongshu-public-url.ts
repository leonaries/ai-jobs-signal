import { officialSiteAdapter } from "@/lib/sources/official-site";
import type { SourceAdapter } from "@/lib/sources/types";

const allowedHosts = new Set(["www.xiaohongshu.com", "xiaohongshu.com", "xhslink.com"]);

export const xiaohongshuPublicUrlAdapter: SourceAdapter = {
  type: "xiaohongshu_public_url",
  async collect(source) {
    const url = new URL(source.url);
    if (!allowedHosts.has(url.hostname)) {
      throw new Error(`Xiaohongshu public URL source must use an allowed host: ${source.url}`);
    }

    const items = await officialSiteAdapter.collect(source);
    return items.map((item) => ({
      ...item,
      sourceType: "xiaohongshu_public_url",
      metadata: {
        ...item.metadata,
        adapter: "xiaohongshu_public_url",
        boundary:
          "Only explicitly configured public note URLs are collected. Comments, private messages, login-gated content, and search-result crawling are excluded."
      }
    }));
  }
};
