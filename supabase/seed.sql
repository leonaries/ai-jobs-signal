insert into sources (
  name,
  source_type,
  url,
  enabled,
  crawl_frequency,
  risk_level,
  notes
) values
(
  '示例官网招聘页',
  'website',
  'https://example.com/careers/rag-engineer',
  false,
  'daily',
  'low',
  '示例源，默认关闭。替换为真实公开招聘页后再启用。'
),
(
  '示例小红书公开笔记',
  'xiaohongshu',
  'https://example.com/signals/agent-fullstack',
  false,
  'daily',
  'medium',
  '示例源，默认关闭。小红书仅配置公开 URL，不采评论、私信或登录后内容。'
),
(
  '示例社区帖子',
  'community',
  'https://example.com/community/ai-ide',
  false,
  'daily',
  'medium',
  '示例源，默认关闭。'
)
on conflict do nothing;

insert into daily_reports (
  report_date,
  title,
  summary,
  hot_tags,
  rising_channels,
  published_signal_count
) values (
  '2026-04-28',
  '今日 AI 开发机会观察',
  '今天的公开信号继续指向 Agent、RAG 和 AI 开发者工具。全栈工程师的机会更强调端到端交付：不仅要会接模型 API，也要能把工作流、评测和产品体验做成稳定系统。',
  '[{"name":"Agent","weight":0.98},{"name":"RAG","weight":0.9},{"name":"Next.js","weight":0.84},{"name":"模型评测","weight":0.78},{"name":"AI IDE","weight":0.74}]'::jsonb,
  '["agent","rag","ai_ide"]'::jsonb,
  18
) on conflict (report_date) do update set
  title = excluded.title,
  summary = excluded.summary,
  hot_tags = excluded.hot_tags,
  rising_channels = excluded.rising_channels,
  published_signal_count = excluded.published_signal_count;

insert into signals (
  slug,
  title,
  summary,
  source_url,
  source_type,
  company_name,
  team_name,
  channel,
  opportunity_type,
  city,
  remote_type,
  skill_tags,
  ai_native_score,
  confidence_score,
  status,
  published_at
) values
(
  'agent-fullstack-workflow-team',
  '早期 AI Workflow 团队招募全栈工程师，强调 Agent 工具调用和交付闭环',
  '一个面向企业自动化场景的早期团队正在寻找能独立交付前后端与 LLM 调用链路的工程师。信号显示 Agent、工作流编排、工具调用和产品化能力被同时要求。',
  'https://example.com/signals/agent-fullstack',
  'xiaohongshu',
  null,
  'AI Workflow 早期团队',
  'agent',
  'early_team',
  '上海',
  'hybrid',
  '[{"name":"Agent","weight":0.98},{"name":"Next.js","weight":0.88},{"name":"Python","weight":0.84},{"name":"Tool Calling","weight":0.8}]'::jsonb,
  92,
  78,
  'published',
  '2026-04-28T02:30:00.000Z'
),
(
  'rag-knowledge-base-product-engineer',
  '企业知识库产品新增 RAG 应用工程方向，要求评测与数据治理经验',
  '官网招聘页出现 RAG 应用工程岗位，职责覆盖知识库接入、检索链路优化、回答质量评测和客户场景落地。相比泛泛的大模型岗位，这类需求更重工程稳定性。',
  'https://example.com/careers/rag-engineer',
  'website',
  '某企业 AI SaaS 公司',
  '知识库产品线',
  'rag',
  'formal_role',
  '北京',
  'onsite',
  '[{"name":"RAG","weight":0.96},{"name":"向量数据库","weight":0.82},{"name":"模型评测","weight":0.79},{"name":"FastAPI","weight":0.68}]'::jsonb,
  88,
  91,
  'published',
  '2026-04-28T01:20:00.000Z'
),
(
  'ai-ide-frontend-platform-signal',
  '开发者工具团队释放 AI IDE 前端平台机会，关注编辑器体验和工程效率',
  '社区帖中出现 AI IDE 方向的前端平台招募，重点在编辑器交互、插件化体验和代码生成工作流。该信号说明 AI 开发者工具仍在吸收强前端与全栈工程师。',
  'https://example.com/community/ai-ide',
  'community',
  null,
  '开发者工具团队',
  'ai_ide',
  'collaboration',
  '杭州',
  'remote',
  '[{"name":"AI IDE","weight":0.95},{"name":"TypeScript","weight":0.9},{"name":"编辑器插件","weight":0.78},{"name":"工程效率","weight":0.76}]'::jsonb,
  84,
  72,
  'published',
  '2026-04-27T13:45:00.000Z'
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  source_url = excluded.source_url,
  source_type = excluded.source_type,
  company_name = excluded.company_name,
  team_name = excluded.team_name,
  channel = excluded.channel,
  opportunity_type = excluded.opportunity_type,
  city = excluded.city,
  remote_type = excluded.remote_type,
  skill_tags = excluded.skill_tags,
  ai_native_score = excluded.ai_native_score,
  confidence_score = excluded.confidence_score,
  status = excluded.status,
  published_at = excluded.published_at,
  updated_at = now();
