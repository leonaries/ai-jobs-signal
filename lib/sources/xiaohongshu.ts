import { websiteAdapter } from "@/lib/sources/website";
import type { SourceAdapter } from "@/lib/sources/types";

export const xiaohongshuAdapter: SourceAdapter = {
  type: "xiaohongshu",
  async collect(source) {
    const items = await websiteAdapter.collect(source);
    return items.map((item) => ({
      ...item,
      sourceType: "xiaohongshu",
      metadata: {
        ...item.metadata,
        adapter: "xiaohongshu-public-url",
        boundary:
          "Only explicitly configured public note URLs are collected. Comments, private messages, and login-gated content are excluded."
      }
    }));
  }
};
