create extension if not exists pgcrypto;

do $$ begin
  create type source_type as enum ('xiaohongshu', 'wechat', 'website', 'community');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type signal_channel as enum ('ai_fullstack', 'agent', 'rag', 'ai_ide', 'multimodal', 'remote', 'early_team', 'other');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type opportunity_type as enum ('formal_role', 'early_team', 'remote', 'freelance', 'internship', 'collaboration', 'unknown');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type remote_type as enum ('onsite', 'hybrid', 'remote', 'unknown');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type signal_status as enum ('published', 'needs_review', 'hidden', 'discarded', 'duplicate');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type raw_processing_status as enum ('pending', 'processed', 'discarded', 'error');
exception
  when duplicate_object then null;
end $$;

create table if not exists sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type source_type not null,
  url text not null,
  enabled boolean not null default true,
  crawl_frequency text not null default 'daily',
  risk_level text not null default 'medium',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists raw_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sources(id) on delete set null,
  source_url text not null,
  source_type source_type not null,
  raw_title text,
  raw_excerpt text,
  raw_content_hash text not null,
  raw_metadata jsonb not null default '{}'::jsonb,
  collected_at timestamptz not null default now(),
  processing_status raw_processing_status not null default 'pending',
  error_message text
);

create table if not exists signals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  source_id uuid references sources(id) on delete set null,
  source_url text not null,
  source_type source_type not null,
  company_name text,
  team_name text,
  channel signal_channel not null default 'other',
  opportunity_type opportunity_type not null default 'unknown',
  city text,
  remote_type remote_type not null default 'unknown',
  skill_tags jsonb not null default '[]'::jsonb,
  ai_native_score integer not null default 0 check (ai_native_score >= 0 and ai_native_score <= 100),
  confidence_score integer not null default 0 check (confidence_score >= 0 and confidence_score <= 100),
  status signal_status not null default 'needs_review',
  published_at timestamptz,
  collected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists daily_reports (
  id uuid primary key default gen_random_uuid(),
  report_date date not null unique,
  title text not null,
  summary text not null,
  hot_tags jsonb not null default '[]'::jsonb,
  rising_channels jsonb not null default '[]'::jsonb,
  published_signal_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_sources_enabled on sources(enabled);
create index if not exists idx_raw_items_hash on raw_items(raw_content_hash);
create index if not exists idx_raw_items_status on raw_items(processing_status);
create index if not exists idx_signals_feed on signals(status, published_at desc);
create index if not exists idx_signals_channel on signals(channel);
create index if not exists idx_signals_source_type on signals(source_type);
create index if not exists idx_signals_scores on signals(ai_native_score desc, confidence_score desc);
create index if not exists idx_daily_reports_date on daily_reports(report_date desc);
