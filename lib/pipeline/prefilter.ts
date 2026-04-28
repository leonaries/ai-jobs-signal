import type { RawCollectedItem } from "@/lib/sources/types";

const recruitingKeywords = [
  "招聘",
  "招募",
  "招人",
  "岗位",
  "内推",
  "加入我们",
  "远程",
  "实习",
  "兼职",
  "外包",
  "合伙人",
  "工程师",
  "developer",
  "engineer",
  "hiring"
];

const aiKeywords = [
  "ai",
  "AI",
  "大模型",
  "LLM",
  "llm",
  "Agent",
  "agent",
  "RAG",
  "rag",
  "MCP",
  "mcp",
  "多模态",
  "向量数据库",
  "知识库",
  "模型评测",
  "Prompt",
  "prompt",
  "Cursor",
  "Claude",
  "AI IDE",
  "workflow",
  "工作流"
];

export function prefilterRawItem(item: RawCollectedItem) {
  const text = `${item.title}\n${item.excerpt}\n${item.content}`;
  const hasRecruitingIntent = recruitingKeywords.some((keyword) => text.includes(keyword));
  const hasAiRelevance = aiKeywords.some((keyword) => text.includes(keyword));

  return {
    shouldProcess: hasRecruitingIntent && hasAiRelevance,
    hasRecruitingIntent,
    hasAiRelevance
  };
}
