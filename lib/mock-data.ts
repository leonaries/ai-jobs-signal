import type { DailyReport, Signal } from "@/types/signal";

const now = "2026-04-28T02:30:00.000Z";

export const mockSignals: Signal[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "agent-fullstack-workflow-team",
    title: "早期 AI Workflow 团队招募全栈工程师，强调 Agent 工具调用和交付闭环",
    summary:
      "一个面向企业自动化场景的早期团队正在寻找能独立交付前后端与 LLM 调用链路的工程师。信号显示 Agent、工作流编排、工具调用和产品化能力被同时要求。",
    source_id: null,
    source_url: "https://example.com/signals/agent-fullstack",
    source_type: "xiaohongshu",
    company_name: null,
    team_name: "AI Workflow 早期团队",
    channel: "agent",
    opportunity_type: "early_team",
    city: "上海",
    remote_type: "hybrid",
    skill_tags: [
      { name: "Agent", weight: 0.98 },
      { name: "Next.js", weight: 0.88 },
      { name: "Python", weight: 0.84 },
      { name: "Tool Calling", weight: 0.8 }
    ],
    ai_native_score: 92,
    confidence_score: 78,
    status: "published",
    published_at: now,
    collected_at: now,
    created_at: now,
    updated_at: now
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "rag-knowledge-base-product-engineer",
    title: "企业知识库产品新增 RAG 应用工程方向，要求评测与数据治理经验",
    summary:
      "官网招聘页出现 RAG 应用工程岗位，职责覆盖知识库接入、检索链路优化、回答质量评测和客户场景落地。相比泛泛的大模型岗位，这类需求更重工程稳定性。",
    source_id: null,
    source_url: "https://example.com/careers/rag-engineer",
    source_type: "website",
    company_name: "某企业 AI SaaS 公司",
    team_name: "知识库产品线",
    channel: "rag",
    opportunity_type: "formal_role",
    city: "北京",
    remote_type: "onsite",
    skill_tags: [
      { name: "RAG", weight: 0.96 },
      { name: "向量数据库", weight: 0.82 },
      { name: "模型评测", weight: 0.79 },
      { name: "FastAPI", weight: 0.68 }
    ],
    ai_native_score: 88,
    confidence_score: 91,
    status: "published",
    published_at: "2026-04-28T01:20:00.000Z",
    collected_at: "2026-04-28T01:10:00.000Z",
    created_at: "2026-04-28T01:15:00.000Z",
    updated_at: "2026-04-28T01:20:00.000Z"
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    slug: "ai-ide-frontend-platform-signal",
    title: "开发者工具团队释放 AI IDE 前端平台机会，关注编辑器体验和工程效率",
    summary:
      "社区帖中出现 AI IDE 方向的前端平台招募，重点在编辑器交互、插件化体验和代码生成工作流。该信号说明 AI 开发者工具仍在吸收强前端与全栈工程师。",
    source_id: null,
    source_url: "https://example.com/community/ai-ide",
    source_type: "community",
    company_name: null,
    team_name: "开发者工具团队",
    channel: "ai_ide",
    opportunity_type: "collaboration",
    city: "杭州",
    remote_type: "remote",
    skill_tags: [
      { name: "AI IDE", weight: 0.95 },
      { name: "TypeScript", weight: 0.9 },
      { name: "编辑器插件", weight: 0.78 },
      { name: "工程效率", weight: 0.76 }
    ],
    ai_native_score: 84,
    confidence_score: 72,
    status: "published",
    published_at: "2026-04-27T13:45:00.000Z",
    collected_at: "2026-04-27T13:30:00.000Z",
    created_at: "2026-04-27T13:40:00.000Z",
    updated_at: "2026-04-27T13:45:00.000Z"
  }
];

export const mockDailyReport: DailyReport = {
  id: "10000000-0000-0000-0000-000000000001",
  report_date: "2026-04-28",
  title: "今日 AI 开发机会观察",
  summary:
    "今天的公开信号继续指向 Agent、RAG 和 AI 开发者工具。全栈工程师的机会更强调端到端交付：不仅要会接模型 API，也要能把工作流、评测和产品体验做成稳定系统。",
  hot_tags: [
    { name: "Agent", weight: 0.98 },
    { name: "RAG", weight: 0.9 },
    { name: "Next.js", weight: 0.84 },
    { name: "模型评测", weight: 0.78 },
    { name: "AI IDE", weight: 0.74 }
  ],
  rising_channels: ["agent", "rag", "ai_ide"],
  published_signal_count: 18,
  created_at: now
};
