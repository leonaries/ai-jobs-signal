# AI Jobs Signal

国内 AI 开发机会信号雷达。MVP 是一个单体 Next.js 应用，用公开信源生成资讯流、信号详情页和每日市场摘要。

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres

## Local Development

```bash
pnpm install
pnpm dev
```

The app can run without Supabase environment variables. In that case it falls back to local mock data so the first UI milestone is previewable immediately.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values when a Supabase project is ready.

```bash
cp .env.example .env.local
```

Required for Supabase-backed data:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Reserved for later collection automation:

- `CRON_SECRET`
- `OPENAI_API_KEY`

## Supabase Setup

Run these SQL files in the Supabase SQL editor:

1. `supabase/schema.sql`
2. `supabase/seed.sql`

The seed file creates sample published signals and a daily report.

## Current MVP Status

Implemented:

- News-feed homepage.
- Signal detail page.
- Shared signal types.
- Supabase read helpers with mock fallback.
- Supabase schema and seed data.
- Public source adapters.
- Rule-based extraction and scoring fallback.
- Protected cron collection endpoint.

Not implemented yet:

- Daily automated collection.

## Collection Endpoint

The collection endpoint is protected by `CRON_SECRET`:

```bash
curl "http://localhost:3000/api/cron/collect?secret=$CRON_SECRET"
```

It loads enabled rows from `sources`, collects public content, writes `raw_items`, extracts structured signals, deduplicates, auto-publishes high-confidence records, and updates `daily_reports`.

For the MVP, Xiaohongshu collection only supports explicitly configured public note URLs. It does not crawl comments, private messages, or login-gated content.

## Product Boundaries

- No BOSS Zhipin data.
- No login-gated scraping.
- No comments or private messages.
- No full-text copying of source content.
- Xiaohongshu content is treated as public opportunity leads, not standard JD data.
