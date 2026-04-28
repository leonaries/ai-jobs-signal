# AI Jobs Signal

国内 AI 开发机会信号雷达。MVP 是一个单体 Next.js 应用，用公开信源生成资讯流、信号详情页和每日市场摘要。

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Neon Postgres

## Local Development

```bash
pnpm install
pnpm dev
```

The app can run without `DATABASE_URL`. In that case it falls back to local mock data so the UI is previewable immediately.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Neon connection string.

```bash
cp .env.example .env.local
```

Required for Neon-backed data:

- `DATABASE_URL`

Required for collection automation:

- `CRON_SECRET`

Optional for LLM extraction. Without it, the app uses the rule-based extraction fallback:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Neon Setup

Run the schema and seed SQL against Neon:

```bash
pnpm db:setup
```

The SQL files live in:

1. `db/schema.sql`
2. `db/seed.sql`

The seed file creates sample published signals and a daily report.

The seed file also creates three disabled example sources. Replace their URLs with real public sources and set `enabled = true` when ready.

## Current MVP Status

Implemented:

- News-feed homepage.
- Signal detail page.
- Shared signal types.
- Neon read helpers with mock fallback.
- Neon schema and seed data.
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

## Vercel Deployment

1. Import the GitHub repository into Vercel.
2. Add the environment variables listed above.
3. Add `DATABASE_URL` and `CRON_SECRET` in Vercel environment variables.
4. Run `pnpm db:setup` locally or run `db/schema.sql` and `db/seed.sql` against Neon.
5. Configure real public sources in the `sources` table.
6. Deploy.

`vercel.json` configures a daily cron:

```json
{
  "path": "/api/cron/collect?secret=$CRON_SECRET",
  "schedule": "0 23 * * *"
}
```

Vercel cron schedules are UTC. `0 23 * * *` runs at 07:00 China time.

## Verification

Run the full local verification suite:

```bash
pnpm verify
```

This runs linting, TypeScript checks, smoke tests, and a production build.

## First Real Source Checklist

For each real source added to Neon:

- Use a public URL that does not require login.
- Set the correct `source_type`.
- Keep `enabled = false` until the URL has been tested once.
- Avoid sources that require CAPTCHA or aggressive interaction.
- For Xiaohongshu, use only explicit public note URLs and keep `risk_level = medium`.
- After a successful collection run, inspect `raw_items`, `signals`, and `daily_reports` in Neon.

## Product Boundaries

- No BOSS Zhipin data.
- No login-gated scraping.
- No comments or private messages.
- No full-text copying of source content.
- Xiaohongshu content is treated as public opportunity leads, not standard JD data.
