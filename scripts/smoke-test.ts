import assert from "node:assert/strict";
import { extractSignal } from "@/lib/ai/extractSignal";
import { decideStatus, scoreAiNative, scoreConfidence } from "@/lib/ai/scoreSignal";
import { prefilterRawItem } from "@/lib/pipeline/prefilter";
import { hashRawItem } from "@/lib/pipeline/raw-items";
import { titleToSlug } from "@/lib/utils/text";
import type { RawCollectedItem } from "@/lib/sources/types";

const recruitingItem: RawCollectedItem = {
  sourceId: "source-1",
  sourceUrl: "https://example.com/ai-agent-job",
  sourceType: "official_site",
  title: "AI Agent 产品团队招聘全栈工程师",
  excerpt:
    "团队正在招聘熟悉 Next.js、Python、Agent 工具调用和工作流编排的工程师，base 上海，可混合办公。",
  content:
    "我们是 AI Agent 产品团队，招聘全栈工程师。需要 Next.js、TypeScript、Python、LLM、工具调用、工作流编排经验，base 上海，可混合办公。",
  metadata: {}
};

const nonRecruitingItem: RawCollectedItem = {
  sourceId: "source-2",
  sourceUrl: "https://example.com/ai-news",
  sourceType: "community",
  title: "一篇普通 AI 新闻",
  excerpt: "这篇文章讨论模型发布和产品更新。",
  content: "模型能力更新，介绍推理速度、上下文窗口和生态伙伴。",
  metadata: {}
};

async function main() {
  assert.equal(prefilterRawItem(recruitingItem).shouldProcess, true);
  assert.equal(prefilterRawItem(nonRecruitingItem).shouldProcess, false);

  const extracted = await extractSignal(recruitingItem);
  assert.equal(extracted.channel, "agent");
  assert.equal(extracted.city, "上海");
  assert.equal(extracted.remote_type, "hybrid");
  assert.ok(extracted.skill_tags.some((tag) => tag.name === "Next.js"));
  assert.ok(extracted.ai_native_score >= 70);

  assert.equal(scoreAiNative("Agent RAG LLM 工具调用 工作流 模型评测") >= 80, true);
  assert.equal(
    scoreConfidence({
      sourceType: "official_site",
      hasRecruitingIntent: true,
      hasTeamContext: true,
      hasSkillTags: true,
      hasLocation: true
    }) >= 80,
    true
  );

  assert.equal(decideStatus(88, "official_site", true, false), "published");
  assert.equal(decideStatus(72, "xiaohongshu_public_url", false, false), "needs_review");
  assert.equal(decideStatus(42, "official_site", true, false), "discarded");
  assert.equal(decideStatus(95, "official_site", true, true), "duplicate");

  assert.equal(titleToSlug("AI Agent 产品团队招聘全栈工程师").length > 0, true);
  assert.equal(hashRawItem(recruitingItem), hashRawItem(recruitingItem));

  console.log("Smoke tests passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
