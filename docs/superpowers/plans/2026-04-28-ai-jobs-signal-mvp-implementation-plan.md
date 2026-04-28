# AI Jobs Signal MVP Implementation Plan

## Source Spec

Design spec: `docs/superpowers/specs/2026-04-28-ai-jobs-signal-mvp-design.md`

## Goal

Build the first MVP as a single Next.js application with TypeScript, Tailwind CSS, Supabase, a public news-feed homepage, signal detail pages, and a daily collection pipeline for public domestic AI developer opportunity signals.

The MVP should stay intentionally light:

- No BOSS Zhipin data.
- No custom admin app.
- No user accounts.
- No separate worker service.
- Supabase Table Editor is the admin fallback.

## Phase 1: Project Scaffold

### Tasks

- Create a Next.js App Router project in the repository root.
- Configure TypeScript.
- Configure Tailwind CSS.
- Add baseline linting and formatting scripts.
- Add `.env.example` with required environment variables.
- Add basic project README with setup instructions.

### Expected Files

- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.*`
- `tailwind.config.*`
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `.env.example`
- `README.md`

### Acceptance Criteria

- `npm run dev` or `pnpm dev` starts the app locally.
- The homepage renders a basic shell.
- Tailwind classes apply correctly.
- TypeScript passes without errors.

## Phase 2: Supabase Schema

### Tasks

- Add SQL migration or schema file for the MVP tables.
- Define `sources`, `raw_items`, `signals`, and `daily_reports`.
- Add indexes for feed queries and dedupe checks.
- Add seed data for a small set of sample published signals and one daily report.

### Expected Files

- `supabase/schema.sql`
- `supabase/seed.sql`
- `.env.example` updated with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Acceptance Criteria

- Schema can be run on a Supabase project.
- Seed data creates visible homepage content.
- `signals.status`, `signals.channel`, `signals.source_type`, and `signals.published_at` are query-friendly.

## Phase 3: Shared Types And Supabase Access

### Tasks

- Add TypeScript enums/unions for source types, channels, opportunity types, remote types, and statuses.
- Add server-side Supabase client using the service role key only in server contexts.
- Add read helpers for:
  - latest published signals
  - signal by slug
  - latest daily report
  - hot skill tags from recent published signals

### Expected Files

- `types/signal.ts`
- `lib/supabase/server.ts`
- `lib/data/signals.ts`
- `lib/data/reports.ts`

### Acceptance Criteria

- Server components can fetch published signals.
- Detail pages can load by slug.
- No service role key is exposed to the browser.
- Missing data fails gracefully.

## Phase 4: Public UI

### Tasks

- Build the news-feed homepage.
- Build the signal detail page.
- Build reusable UI components for the feed.
- Add channel/source filter support through query parameters.
- Add empty, loading, and error-friendly states.

### Expected Files

- `app/page.tsx`
- `app/signals/[slug]/page.tsx`
- `components/DailySummary.tsx`
- `components/FilterBar.tsx`
- `components/HotTags.tsx`
- `components/SignalCard.tsx`
- `components/ScoreBadge.tsx`
- `components/SourceBadge.tsx`

### Acceptance Criteria

- Homepage shows daily summary, filters, hot tags, and signal cards.
- Signal cards expose source, channel, tags, AI-native score, confidence score, and source link.
- Detail page shows the full structured summary and source attribution.
- UI is usable on mobile and desktop.

## Phase 5: Source Adapters

### Tasks

- Define a common source adapter interface.
- Implement a generic website source adapter for static public pages.
- Implement a community source adapter for simple RSS/HTML pages where feasible.
- Add a Xiaohongshu adapter placeholder that only handles explicitly configured public URLs in MVP.
- Store raw collected records in `raw_items`.

### Expected Files

- `lib/sources/types.ts`
- `lib/sources/website.ts`
- `lib/sources/community.ts`
- `lib/sources/xiaohongshu.ts`
- `lib/pipeline/raw-items.ts`

### Acceptance Criteria

- Each adapter returns normalized raw items.
- Adapters do not collect login-gated content.
- Xiaohongshu MVP adapter does not crawl comments, private messages, or hidden data.
- Raw items include title, excerpt, source URL, source type, metadata, and content hash.

## Phase 6: Classification, Extraction, Scoring

### Tasks

- Add rule-based prefiltering for obvious non-recruiting content.
- Add LLM extraction function that returns structured signal fields.
- Add AI-native scoring.
- Add confidence scoring.
- Add paraphrased summary generation.
- Add duplicate detection by URL, hash, and title similarity.
- Add publish decision logic.

### Expected Files

- `lib/ai/extractSignal.ts`
- `lib/ai/scoreSignal.ts`
- `lib/ai/summarizeDaily.ts`
- `lib/pipeline/prefilter.ts`
- `lib/pipeline/dedupe.ts`
- `lib/pipeline/publish.ts`
- `lib/pipeline/collect.ts`

### Acceptance Criteria

- Non-recruiting content can be discarded before LLM calls where possible.
- Extracted signals fit the `signals` table fields.
- High-confidence signals become `published`.
- Medium-confidence signals become `needs_review`.
- Duplicates are not republished.
- Generated summaries are paraphrased and do not copy full source text.

## Phase 7: Cron Endpoint

### Tasks

- Add protected collection endpoint.
- Require a cron secret header or query token.
- Load enabled sources.
- Run source adapters.
- Process raw items.
- Generate/update daily report.
- Return a concise run summary.

### Expected Files

- `app/api/cron/collect/route.ts`
- `lib/pipeline/collect.ts`
- `.env.example` updated with:
  - `CRON_SECRET`
  - `OPENAI_API_KEY` or chosen LLM provider key

### Acceptance Criteria

- Unauthorized cron requests are rejected.
- Authorized cron requests execute without exposing secrets.
- Run summary reports collected, processed, published, review, discarded, duplicate, and error counts.
- Errors are stored without crashing the entire run when one source fails.

## Phase 8: Verification And Deployment Prep

### Tasks

- Add smoke tests or lightweight script checks for data helpers and publish rules.
- Add README setup steps for Supabase and Vercel.
- Add Vercel cron configuration if using Vercel.
- Verify seeded homepage locally.
- Verify cron endpoint with a test source.
- Push implementation commits.

### Expected Files

- `README.md`
- `vercel.json` if using Vercel Cron.
- Optional test files near the logic they cover.

### Acceptance Criteria

- Local app runs with seeded Supabase data.
- Homepage and detail page render without runtime errors.
- Cron endpoint can process at least one test source.
- `npm run lint` and TypeScript checks pass.
- Deployment requirements are documented.

## Recommended Build Order

1. Phase 1: Project Scaffold.
2. Phase 2: Supabase Schema.
3. Phase 3: Shared Types And Supabase Access.
4. Phase 4: Public UI with seed data.
5. Phase 6: Classification and publish logic using local fixtures.
6. Phase 5: Source adapters.
7. Phase 7: Cron endpoint.
8. Phase 8: Verification and deployment prep.

This order gets a visible product running early, then adds data collection and automation behind it.

## First Implementation Milestone

The first milestone should stop after Phase 4.

Milestone output:

- A running Next.js site.
- Supabase schema and seed data.
- News-feed homepage populated from Supabase.
- Signal detail pages.
- Filterable feed UI.

This gives the product a usable shell before spending effort on source reliability and LLM automation.

## Risks And Mitigations

### Xiaohongshu Source Instability

Risk: public content may be hard to access consistently or may change structure.

Mitigation: keep Xiaohongshu as a configured public URL adapter in MVP, cap confidence, and avoid making it the only source type.

### Low Quality Auto-Publish

Risk: automatic publishing may create noisy or incorrect feed items.

Mitigation: use strict confidence thresholds, keep `needs_review`, and prefer fewer high-quality published signals.

### LLM Cost And Latency

Risk: processing every raw item through an LLM can be slow or expensive.

Mitigation: use rule-based prefiltering and dedupe before LLM extraction.

### Scope Creep

Risk: admin UI, user accounts, personalization, and richer analytics could expand the MVP.

Mitigation: keep those out of the first implementation and use Supabase Table Editor as the admin surface.

## Explicit Non-Goals

- Do not add BOSS Zhipin data.
- Do not build a custom admin app.
- Do not add login or user profiles.
- Do not build resume matching.
- Do not collect comments, private messages, or login-gated content.
- Do not republish full source content.
