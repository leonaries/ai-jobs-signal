export type SourceType = "xiaohongshu" | "wechat" | "website" | "community";

export type SignalChannel =
  | "ai_fullstack"
  | "agent"
  | "rag"
  | "ai_ide"
  | "multimodal"
  | "remote"
  | "early_team"
  | "other";

export type OpportunityType =
  | "formal_role"
  | "early_team"
  | "remote"
  | "freelance"
  | "internship"
  | "collaboration"
  | "unknown";

export type RemoteType = "onsite" | "hybrid" | "remote" | "unknown";

export type SignalStatus =
  | "published"
  | "needs_review"
  | "hidden"
  | "discarded"
  | "duplicate";

export type SkillTag = {
  name: string;
  weight?: number;
};

export type Signal = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  source_id: string | null;
  source_url: string;
  source_type: SourceType;
  company_name: string | null;
  team_name: string | null;
  channel: SignalChannel;
  opportunity_type: OpportunityType;
  city: string | null;
  remote_type: RemoteType;
  skill_tags: SkillTag[];
  ai_native_score: number;
  confidence_score: number;
  status: SignalStatus;
  published_at: string | null;
  collected_at: string;
  created_at: string;
  updated_at: string;
};

export type DailyReport = {
  id: string;
  report_date: string;
  title: string;
  summary: string;
  hot_tags: SkillTag[];
  rising_channels: SignalChannel[];
  published_signal_count: number;
  created_at: string;
};

export type SignalFilters = {
  channel?: SignalChannel;
  sourceType?: SourceType;
};

export const channelLabels: Record<SignalChannel, string> = {
  ai_fullstack: "AI 全栈",
  agent: "Agent",
  rag: "RAG",
  ai_ide: "AI IDE",
  multimodal: "多模态",
  remote: "远程",
  early_team: "早期团队",
  other: "其他"
};

export const sourceLabels: Record<SourceType, string> = {
  xiaohongshu: "小红书线索",
  wechat: "公众号",
  website: "官网",
  community: "社区"
};

export const opportunityLabels: Record<OpportunityType, string> = {
  formal_role: "正式岗位",
  early_team: "早期团队",
  remote: "远程机会",
  freelance: "项目合作",
  internship: "实习",
  collaboration: "协作招募",
  unknown: "待识别"
};

export const remoteLabels: Record<RemoteType, string> = {
  onsite: "到岗",
  hybrid: "混合",
  remote: "远程",
  unknown: "未说明"
};
