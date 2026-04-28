import { websiteAdapter } from "@/lib/sources/website";
import type { SourceAdapter } from "@/lib/sources/types";

export const wechatAdapter: SourceAdapter = {
  type: "wechat",
  async collect(source) {
    const items = await websiteAdapter.collect(source);
    return items.map((item) => ({
      ...item,
      sourceType: "wechat",
      metadata: {
        ...item.metadata,
        adapter: "wechat-public-url"
      }
    }));
  }
};
