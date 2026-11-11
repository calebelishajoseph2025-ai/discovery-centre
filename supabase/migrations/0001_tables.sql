-- 0001_tables.sql: Database schema for Northside Discovery Centre
-- All tables are anonymous; no personal or identifiable visitor data is stored.

create table if not exists public.plan_feedback (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  helpful    boolean     not null,
  comment    text        check (comment is null or char_length(comment) between 1 and 280),
  plan_hash  text        not null check (plan_hash ~ '^[a-f0-9]{16}$'),
  locale     text        not null check (locale in ('en','ta')),
  quiet      boolean     not null default false
);

create table if not exists public.short_plans (
  code       text primary key check (code ~ '^[a-hjkmnp-z2-9]{6}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '90 days',
  payload    jsonb       not null check (jsonb_typeof(payload) = 'object' and pg_column_size(payload) < 2048),
  schema_v   smallint    not null default 1
);

create table if not exists public.exhibit_favourites (
  slug  text primary key check (slug in ('light-lab','build-bench','sky-room','echo-tunnel','garden-trail')),
  count integer not null default 0 check (count >= 0)
);

-- Seed known exhibit slugs with 0 count if not already present
insert into public.exhibit_favourites (slug) values
  ('light-lab'),
  ('build-bench'),
  ('sky-room'),
  ('echo-tunnel'),
  ('garden-trail')
on conflict (slug) do nothing;

create table if not exists public.rate_limits (
  bucket       text        not null,
  key_hash     text        not null,
  window_start timestamptz not null,
  hits         integer     not null default 0,
  primary key (bucket, key_hash, window_start)
);
