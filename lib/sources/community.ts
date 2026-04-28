import { websiteAdapter } from "@/lib/sources/website";
import type { SourceAdapter } from "@/lib/sources/types";

export const communityAdapter: SourceAdapter = {
  type: "community",
  async collect(source) {
    const items = await websiteAdapter.collect(source);
    return items.map((item) => ({
      ...item,
      sourceType: "community",
      metadata: {
        ...item.metadata,
        adapter: "community"
      }
    }));
  }
};
