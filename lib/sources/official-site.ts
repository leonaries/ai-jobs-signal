import { stripHtml, truncateText } from "@/lib/utils/text";
import type { RawCollectedItem, SourceAdapter } from "@/lib/sources/types";

export const officialSiteAdapter: SourceAdapter = {
  type: "official_site",
  async collect(source) {
    const response = await fetch(source.url, {
      headers: {
        "user-agent": "AIJobsSignalBot/0.1 (+https://github.com/leonaries/ai-jobs-signal)"
      },
      next: {
        revalidate: 0
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${source.url}: ${response.status}`);
    }

    const html = await response.text();
    const title = extractTitle(html) ?? source.name;
    const text = stripHtml(html);

    return [
      {
        sourceId: source.id,
        sourceUrl: source.url,
        sourceType: source.source_type,
        title,
        excerpt: truncateText(text, 420),
        content: truncateText(text, 6000),
        metadata: {
          adapter: "official_site",
          contentType: response.headers.get("content-type")
        }
      } satisfies RawCollectedItem
    ];
  }
};

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripHtml(match[1]) : null;
}
