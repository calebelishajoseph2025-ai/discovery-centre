-- 0003_functions.sql: SECURITY DEFINER RPC Functions for Anonymous Visitor Actions
-- Every function sets search_path = '' and uses schema-qualified names.
-- Explicit revoke from public followed by grant to anon.

-- 1. take_token (Sliding rate limiter with lazy cleanup)
create or replace function public.take_token(
  p_bucket text,
  p_key_hash text,
  p_limit int,
  p_window_seconds int
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window_start timestamptz;
  v_current_hits int;
begin
  -- Lazy cleanup with ~2% probability
  if random() < 0.02 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  v_window_start := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into public.rate_limits (bucket, key_hash, window_start, hits)
  values (p_bucket, p_key_hash, v_window_start, 1)
  on conflict (bucket, key_hash, window_start)
  do update set hits = public.rate_limits.hits + 1
  returning hits into v_current_hits;

  return v_current_hits <= p_limit;
end;
$$;
revoke all on function public.take_token(text, text, int, int) from public, anon, authenticated;
grant execute on function public.take_token(text, text, int, int) to anon;

-- 2. submit_feedback
create or replace function public.submit_feedback(
  p_helpful boolean,
  p_comment text,
  p_plan_hash text,
  p_locale text,
  p_quiet boolean
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_clean_comment text;
begin
  -- Global budget: 300 per hour
  if not public.take_token('feedback-global', 'all', 300, 3600) then
    raise exception 'RATE_LIMITED';
  end if;

  v_clean_comment := nullif(trim(p_comment), '');

  insert into public.plan_feedback (helpful, comment, plan_hash, locale, quiet)
  values (p_helpful, v_clean_comment, p_plan_hash, p_locale, p_quiet);
end;
$$;
revoke all on function public.submit_feedback(boolean, text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.submit_feedback(boolean, text, text, text, boolean) to anon;

-- 3. feedback_summary
create or replace function public.feedback_summary()
returns table(total int, helpful int)
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  return query
  select
    count(*)::int as total,
    count(*) filter (where f.helpful = true)::int as helpful
  from public.plan_feedback f;
end;
$$;
revoke all on function public.feedback_summary() from public, anon, authenticated;
grant execute on function public.feedback_summary() to anon;

-- 4. create_short_plan
create or replace function public.create_short_plan(
  p_code text,
  p_payload jsonb
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inserted boolean := false;
begin
  -- Global budget: 2000 per 24 hours
  if not public.take_token('short-global', 'all', 2000, 86400) then
    raise exception 'RATE_LIMITED';
  end if;

  -- Lazy cleanup with ~2% probability
  if random() < 0.02 then
    delete from public.short_plans where expires_at < now();
  end if;

  insert into public.short_plans (code, payload)
  values (p_code, p_payload)
  on conflict (code) do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted;
end;
$$;
revoke all on function public.create_short_plan(text, jsonb) from public, anon, authenticated;
grant execute on function public.create_short_plan(text, jsonb) to anon;

-- 5. get_short_plan
create or replace function public.get_short_plan(
  p_code text
) returns jsonb
language plpgsql
security definer
stable
set search_path = ''
as $$
declare
  v_payload jsonb;
begin
  select payload into v_payload
  from public.short_plans
  where code = p_code and expires_at > now();

  return v_payload;
end;
$$;
revoke all on function public.get_short_plan(text) from public, anon, authenticated;
grant execute on function public.get_short_plan(text) to anon;

-- 6. favourite_adjust
create or replace function public.favourite_adjust(
  p_slug text,
  p_delta smallint
) returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new_count int;
begin
  if p_delta not in (1, -1) then
    raise exception 'INVALID_DELTA';
  end if;

  update public.exhibit_favourites
  set count = greatest(count + p_delta, 0)
  where slug = p_slug
  returning count into v_new_count;

  if not found then
    raise exception 'UNKNOWN_SLUG';
  end if;

  return v_new_count;
end;
$$;
revoke all on function public.favourite_adjust(text, smallint) from public, anon, authenticated;
grant execute on function public.favourite_adjust(text, smallint) to anon;

-- 7. favourite_counts
create or replace function public.favourite_counts()
returns table(slug text, count int)
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  return query
  select f.slug, f.count
  from public.exhibit_favourites f
  order by f.slug;
end;
$$;
revoke all on function public.favourite_counts() from public, anon, authenticated;
grant execute on function public.favourite_counts() to anon;

-- 8. ping
create or replace function public.ping()
returns boolean
language plpgsql
security definer
stable
set search_path = ''
as $$
begin
  return true;
end;
$$;
revoke all on function public.ping() from public, anon, authenticated;
grant execute on function public.ping() to anon;
