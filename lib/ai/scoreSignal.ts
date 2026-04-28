import type {
  OpportunityType,
  RemoteType,
  SignalChannel,
  SourceType
} from "@/types/signal";

export type ExtractedSignal = {
  title: string;
  summary: string;
  company_name: string | null;
  team_name: string | null;
  channel: SignalChannel;
  opportunity_type: OpportunityType;
  city: string | null;
  remote_type: RemoteType;
  skill_tags: Array<{ name: string; weight?: number }>;
  ai_native_score: number;
  confidence_score: number;
};

const highSignalTerms = [
  "Agent",
  "agent",
  "RAG",
  "rag",
  "LLM",
  "大模型",
  "工具调用",
  "Tool Calling",
  "workflow",
  "工作流",
  "模型评测",
  "向量数据库",
  "知识库",
  "MCP",
  "AI IDE",
  "多模态"
];

export function scoreAiNative(text: string) {
  const hits = highSignalTerms.filter((term) => text.includes(term)).length;
  return clampScore(38 + hits * 8);
}

export function scoreConfidence({
  sourceType,
  hasRecruitingIntent,
  hasTeamContext,
  hasSkillTags,
  hasLocation
}: {
  sourceType: SourceType;
  hasRecruitingIntent: boolean;
  hasTeamContext: boolean;
  hasSkillTags: boolean;
  hasLocation: boolean;
}) {
  const sourceBase: Record<SourceType, number> = {
    website: 42,
    wechat: 36,
    community: 30,
    xiaohongshu: 24
  };

  return clampScore(
    sourceBase[sourceType] +
      (hasRecruitingIntent ? 20 : 0) +
      (hasTeamContext ? 16 : 0) +
      (hasSkillTags ? 14 : 0) +
      (hasLocation ? 8 : 0)
  );
}

export function decideStatus(
  confidenceScore: number,
  sourceType: SourceType,
  hasCompleteXiaohongshuContext: boolean,
  duplicate: boolean
) {
  if (duplicate) {
    return "duplicate" as const;
  }

  if (confidenceScore < 50) {
    return "discarded" as const;
  }

  if (sourceType === "xiaohongshu" && !hasCompleteXiaohongshuContext) {
    return "needs_review" as const;
  }

  if (confidenceScore >= 80) {
    return "published" as const;
  }

  return "needs_review" as const;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
