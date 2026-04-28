import { truncateText } from "@/lib/utils/text";
import type { RawCollectedItem } from "@/lib/sources/types";
import type { OpportunityType, RemoteType, SignalChannel } from "@/types/signal";
import { scoreAiNative, scoreConfidence, type ExtractedSignal } from "@/lib/ai/scoreSignal";

const skillPatterns = [
  "Agent",
  "RAG",
  "LLM",
  "大模型",
  "Next.js",
  "React",
  "TypeScript",
  "Python",
  "FastAPI",
  "向量数据库",
  "模型评测",
  "MCP",
  "AI IDE",
  "多模态",
  "Vercel AI SDK",
  "OpenAI",
  "Anthropic",
  "function calling",
  "structured outputs",
  "embedding",
  "Prompt",
  "工作流",
  "工具调用",
  "Cursor",
  "Claude Code"
];

export async function extractSignal(item: RawCollectedItem): Promise<ExtractedSignal> {
  if (process.env.OPENAI_API_KEY) {
    const llmResult = await tryExtractWithOpenAI(item);
    if (llmResult) {
      return llmResult;
    }
  }

  return extractWithRules(item);
}

function extractWithRules(item: RawCollectedItem): ExtractedSignal {
  const text = `${item.title}\n${item.excerpt}\n${item.content}`;
  const skillTags = skillPatterns
    .filter((skill) => text.includes(skill))
    .slice(0, 10)
    .map((name) => ({ name, weight: 0.75 }));
  const channel = inferChannel(text);
  const opportunityType = inferOpportunityType(text);
  const remoteType = inferRemoteType(text);
  const city = inferCity(text);
  const hasTeamContext = Boolean(inferCompanyOrTeam(text));
  const hasRecruitingIntent = /招聘|招募|招人|岗位|内推|加入我们|hiring|engineer|developer/i.test(text);

  return {
    title: truncateText(item.title, 96),
    summary: truncateText(item.excerpt || item.content, 220),
    company_name: null,
    team_name: inferCompanyOrTeam(text),
    channel,
    opportunity_type: opportunityType,
    city,
    remote_type: remoteType,
    skill_tags: skillTags,
    ai_native_score: scoreAiNative(text),
    confidence_score: scoreConfidence({
      sourceType: item.sourceType,
      hasRecruitingIntent,
      hasTeamContext,
      hasSkillTags: skillTags.length > 0,
      hasLocation: Boolean(city) || remoteType !== "unknown"
    })
  };
}

async function tryExtractWithOpenAI(item: RawCollectedItem): Promise<ExtractedSignal | null> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Extract a domestic AI developer opportunity signal from public source text. Return compact JSON only. Paraphrase summaries; do not copy full source content."
          },
          {
            role: "user",
            content: JSON.stringify({
              sourceType: item.sourceType,
              title: item.title,
              excerpt: item.excerpt,
              content: item.content.slice(0, 5000),
              schema: {
                title: "string",
                summary: "string",
                company_name: "string|null",
                team_name: "string|null",
                channel:
                  "ai_fullstack|agent|rag|ai_ide|multimodal|remote|early_team|other",
                opportunity_type:
                  "formal_role|early_team|remote|freelance|internship|collaboration|unknown",
                city: "string|null",
                remote_type: "onsite|hybrid|remote|unknown",
                skill_tags: [{ name: "string", weight: "number 0-1" }],
                ai_native_score: "integer 0-100",
                confidence_score: "integer 0-100"
              }
            })
          }
        ]
      })
    });

    if (!response.ok) {
      console.error("OpenAI extraction failed", await response.text());
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }

    return normalizeExtractedSignal(JSON.parse(content), item);
  } catch (error) {
    console.error("OpenAI extraction error", error);
    return null;
  }
}

function normalizeExtractedSignal(value: Partial<ExtractedSignal>, item: RawCollectedItem) {
  const fallback = extractWithRules(item);
  return {
    ...fallback,
    ...value,
    title: truncateText(value.title ?? fallback.title, 96),
    summary: truncateText(value.summary ?? fallback.summary, 260),
    skill_tags: Array.isArray(value.skill_tags) ? value.skill_tags.slice(0, 10) : fallback.skill_tags,
    ai_native_score: clamp(value.ai_native_score ?? fallback.ai_native_score),
    confidence_score: clamp(value.confidence_score ?? fallback.confidence_score)
  } satisfies ExtractedSignal;
}

function inferChannel(text: string): SignalChannel {
  if (/Agent|agent|工具调用|function calling|structured outputs|工作流|workflow/.test(text)) return "agent";
  if (/RAG|rag|知识库|向量数据库/.test(text)) return "rag";
  if (/AI IDE|Cursor|Claude Code|编辑器|开发者工具/.test(text)) return "ai_ide";
  if (/多模态|图像|视频/.test(text)) return "multimodal";
  if (/远程|remote/i.test(text)) return "remote";
  if (/早期|创业|合伙人|从 0 到 1|0 到 1/.test(text)) return "early_team";
  if (/全栈|Next\.js|React|前后端/.test(text)) return "ai_fullstack";
  return "other";
}

function inferOpportunityType(text: string): OpportunityType {
  if (/实习/.test(text)) return "internship";
  if (/远程|remote/i.test(text)) return "remote";
  if (/兼职|外包|项目制/.test(text)) return "freelance";
  if (/合伙人|搭子|协作/.test(text)) return "collaboration";
  if (/早期|创业|从 0 到 1|0 到 1/.test(text)) return "early_team";
  if (/招聘|岗位|工程师|developer|engineer/i.test(text)) return "formal_role";
  return "unknown";
}

function inferRemoteType(text: string): RemoteType {
  if (/远程|remote/i.test(text)) return "remote";
  if (/混合|hybrid/i.test(text)) return "hybrid";
  if (/到岗|坐班|base|Base/.test(text)) return "onsite";
  return "unknown";
}

function inferCity(text: string) {
  const city = ["北京", "上海", "深圳", "杭州", "广州", "成都", "南京", "苏州"].find((name) =>
    text.includes(name)
  );
  return city ?? null;
}

function inferCompanyOrTeam(text: string) {
  const match = text.match(/([\u4e00-\u9fa5A-Za-z0-9]{2,24}(?:团队|公司|实验室|工作室))/);
  return match?.[1] ?? null;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
