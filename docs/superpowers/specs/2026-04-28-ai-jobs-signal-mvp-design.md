# AI Jobs Signal MVP Design

## Product Positioning

AI Jobs Signal is a domestic AI developer opportunity signal site. It helps AI developers and independent developers understand which AI-native development skills, teams, and opportunity types are emerging in China.

The product is not a job board aggregator and will not use BOSS Zhipin data. It is closer to an editorial signal feed: the system collects public AI developer opportunity signals, summarizes them, tags them, scores them, and presents them in a lightweight news-feed experience.

## Target User

The first user group is AI developers and independent developers who want to understand:

- Which AI development directions are heating up.
- Which teams are hiring or recruiting collaborators.
- Which skill combinations are repeatedly appearing in public opportunities.
- Where early-stage, remote, or non-standard opportunities are emerging.
- What to learn or build next based on real market signals.

## MVP Scope

The MVP is a single Next.js application with Supabase as the backend database and management surface.

Included:

- News-feed homepage.
- Signal detail page.
- Daily collection endpoint.
- Public-source collection adapters.
- LLM-based extraction, summarization, classification, and scoring.
- Supabase tables for sources, raw items, signals, and daily reports.
- Automatic publish workflow with confidence thresholds.
- Manual correction through Supabase Table Editor, not a custom admin app.

Excluded:

- BOSS Zhipin data.
- Dedicated admin application.
- Separate worker service.
- User accounts and user-specific personalization.
- Resume matching.
- User-uploaded job data.
- Comment/private-message collection.
- Login-gated scraping, CAPTCHA bypassing, account pools, or platform circumvention.
- Full-text copying of source articles or Xiaohongshu notes.

## Information Architecture

### Homepage

Route: `/`

The homepage is a news-feed style experience.

Primary sections:

- Daily market summary.
- Channel filters: All, AI Full-stack, Agent, RAG, AI IDE, Multimodal, Remote, Early Teams.
- Source filters: Xiaohongshu, WeChat official accounts, company websites, communities.
- Signal card feed.
- Hot skill tags.
- Rising opportunity directions.

Each signal card shows:

- Title.
- Short summary.
- Source type.
- Company or team name when available.
- Opportunity type.
- Channel.
- Skill tags.
- AI-native score.
- Confidence level.
- Published time.
- Link to source.

### Signal Detail Page

Route: `/signals/[slug]`

The detail page shows:

- Signal title.
- Structured summary.
- Opportunity type.
- Source attribution and external link.
- Extracted skill tags.
- AI-native score.
- Confidence level.
- Location or remote marker when available.
- Original source excerpt or paraphrased context.
- Related signals can be added later and is not required for MVP.

## Source Strategy

The MVP uses public domestic sources. BOSS Zhipin is explicitly excluded.

Priority sources:

- Xiaohongshu public recruiting notes.
- Company recruitment pages.
- Company or team WeChat official account recruiting posts.
- Founder or team public recruiting posts.
- V2EX, Juejin, SegmentFault, GitHub issues/discussions, and similar developer communities.
- Public Notion, Feishu, or website pages linked from official team channels.

### Xiaohongshu Boundaries

Xiaohongshu is a core source, but it is treated as an opportunity lead source rather than a standard JD source.

Rules:

- Only collect publicly accessible note content.
- Do not collect comments, private messages, or login-gated content.
- Do not bypass platform controls.
- Do not copy full note text into the product.
- Store title, short paraphrased summary, public URL, public author display name if visible, extracted tags, and collection timestamp.
- Mark Xiaohongshu-derived signals as lead-style signals.
- Default Xiaohongshu source confidence is capped unless the content clearly includes recruiting intent, technical requirements, and team context.

## Data Model

The MVP keeps the database small and uses JSON fields where useful.

### `sources`

Stores configured sources.

Fields:

- `id`
- `name`
- `source_type`: `xiaohongshu`, `wechat`, `website`, `community`
- `url`
- `enabled`
- `crawl_frequency`
- `risk_level`
- `notes`
- `created_at`
- `updated_at`

### `raw_items`

Stores collected raw source records before publication.

Fields:

- `id`
- `source_id`
- `source_url`
- `source_type`
- `raw_title`
- `raw_excerpt`
- `raw_content_hash`
- `raw_metadata`
- `collected_at`
- `processing_status`: `pending`, `processed`, `discarded`, `error`
- `error_message`

### `signals`

Stores structured opportunity signals.

Fields:

- `id`
- `slug`
- `title`
- `summary`
- `source_id`
- `source_url`
- `source_type`
- `company_name`
- `team_name`
- `channel`: `ai_fullstack`, `agent`, `rag`, `ai_ide`, `multimodal`, `remote`, `early_team`, `other`
- `opportunity_type`: `formal_role`, `early_team`, `remote`, `freelance`, `internship`, `collaboration`, `unknown`
- `city`
- `remote_type`: `onsite`, `hybrid`, `remote`, `unknown`
- `skill_tags`: JSON array
- `ai_native_score`: 0-100
- `confidence_score`: 0-100
- `status`: `published`, `needs_review`, `hidden`, `discarded`, `duplicate`
- `published_at`
- `collected_at`
- `created_at`
- `updated_at`

### `daily_reports`

Stores generated daily summaries.

Fields:

- `id`
- `report_date`
- `title`
- `summary`
- `hot_tags`: JSON array
- `rising_channels`: JSON array
- `published_signal_count`
- `created_at`

## Collection And Processing Flow

The daily flow is triggered by Vercel Cron or GitHub Actions calling:

`/api/cron/collect`

Pipeline:

1. Load enabled sources from Supabase.
2. Collect public content from each source.
3. Save source records into `raw_items`.
4. Discard obvious non-recruiting content using keyword and rule checks.
5. Use LLM extraction to decide whether the content is an AI developer opportunity signal.
6. Extract structured fields: company, team, channel, opportunity type, city, remote type, and skill tags.
7. Generate a paraphrased summary.
8. Deduplicate against existing signals by URL, hash, title similarity, and company/team similarity.
9. Score AI-native relevance and confidence.
10. Publish automatically if the confidence threshold is high enough.
11. Send uncertain items to `needs_review`.
12. Generate or update the daily report.

## Auto-Publish Rules

The MVP minimizes administrator work through confidence-based publishing.

Recommended status rules:

- `published`: confidence score >= 80 and no duplicate detected.
- `needs_review`: confidence score between 50 and 79, or Xiaohongshu source with incomplete context.
- `discarded`: confidence score < 50, obvious marketing-only content, or not related to AI development opportunities.
- `duplicate`: repeated source URL, repeated hash, or very similar content.

Xiaohongshu-specific rule:

- A Xiaohongshu signal can auto-publish only when it clearly includes recruiting intent, AI development relevance, and enough team or opportunity context.

## Scoring

### AI-Native Score

A 0-100 score estimating whether the opportunity is genuinely AI-native.

Positive signals:

- Mentions of Agent, RAG, LLM application, tool calling, workflow automation, model evaluation, prompt engineering, AI IDE, multimodal application, vector database, knowledge base, MCP, or AI product engineering.
- Clear product or engineering context around AI.
- Technical stack connected to AI application delivery.

Negative signals:

- Generic frontend/backend role with only superficial AI wording.
- Marketing-heavy content without technical context.
- Vague recruiting with no role, skills, or team detail.

### Confidence Score

A 0-100 score estimating data reliability and extraction quality.

Positive signals:

- Official company or team source.
- Clear recruiting intent.
- Clear skill requirements.
- Clear role or opportunity type.
- Clear location or remote information.
- Stable source URL.

Negative signals:

- Informal social note with sparse context.
- Missing team/company.
- Missing role or skill detail.
- Unclear source attribution.

## Application Structure

The MVP is a single Next.js app.

```txt
ai-jobs-signal/
  app/
    page.tsx
    signals/[slug]/page.tsx
    api/cron/collect/route.ts
    api/signals/route.ts
  components/
    SignalCard.tsx
    FilterBar.tsx
    HotTags.tsx
    DailySummary.tsx
  lib/
    supabase.ts
    sources/
      xiaohongshu.ts
      wechat.ts
      website.ts
      community.ts
    ai/
      extractSignal.ts
      scoreSignal.ts
      summarizeDaily.ts
    pipeline/
      collect.ts
      dedupe.ts
      publish.ts
  types/
    signal.ts
```

## Technology Choices

- Next.js App Router for UI and API routes.
- TypeScript for shared types.
- Tailwind CSS for styling.
- Supabase Postgres for persistence.
- Supabase Table Editor as the first admin surface.
- Vercel for deployment.
- Vercel Cron or GitHub Actions for scheduled collection.
- LLM API for classification, extraction, scoring, and daily summaries.

## Quality And Safety

Quality controls:

- Keep raw source and published signal separate.
- Use paraphrased summaries rather than full-text copying.
- Keep source attribution and external links.
- Track collection errors in `raw_items`.
- Store source risk level.
- Make low-confidence items reviewable in Supabase.
- Keep source adapters isolated so risky or unstable sources can be disabled quickly.

Compliance boundaries:

- Do not collect BOSS Zhipin data.
- Do not collect login-gated data.
- Do not bypass CAPTCHA or anti-bot controls.
- Do not collect private messages or comments.
- Do not republish full source content.
- Do not expose personal contact details unless they are part of an official public recruiting page and are necessary for source attribution.

## MVP Success Criteria

The MVP is successful if it can:

- Collect from at least three source types, including Xiaohongshu public notes.
- Publish a daily feed of AI developer opportunity signals.
- Generate useful tags and summaries with limited manual correction.
- Keep administrator effort low by auto-publishing high-confidence signals.
- Provide enough value that a developer can understand what AI development opportunities are emerging in China this week.

## Open Implementation Decisions

These decisions can be made during implementation:

- Whether collection runs via Vercel Cron or GitHub Actions.
- Which LLM provider and model to use.
- Exact first batch of source URLs and Xiaohongshu keywords.
- Whether `/api/signals` is needed or pages can query Supabase directly from server components.
- Whether to add a minimal protected admin page after the first working version.
