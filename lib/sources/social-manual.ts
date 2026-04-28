import { truncateText } from "@/lib/utils/text";
import type { RawCollectedItem, SourceAdapter } from "@/lib/sources/types";

export const socialManualAdapter: SourceAdapter = {
  type: "social_manual",
  async collect(source) {
    const content = source.notes?.trim();

    if (!content) {
      throw new Error("social_manual sources require notes containing the manually captured post text.");
    }

    return [
      {
        sourceId: source.id,
        sourceUrl: source.url,
        sourceType: "social_manual",
        title: source.name,
        excerpt: truncateText(content, 420),
        content: truncateText(content, 6000),
        metadata: {
          adapter: "social_manual",
          boundary:
            "Manual social source. The operator is responsible for adding only public, attribution-safe summaries or excerpts."
        }
      } satisfies RawCollectedItem
    ];
  }
};
