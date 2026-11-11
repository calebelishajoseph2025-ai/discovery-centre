-- 0002_rls_and_grants.sql: Strict Deny-By-Default RLS & Permissions
-- Enforces zero direct table access for anon and authenticated roles.
-- Access is strictly mediated through whitelisted SECURITY DEFINER RPC functions.

alter table public.plan_feedback      enable row level security;
alter table public.short_plans        enable row level security;
alter table public.exhibit_favourites enable row level security;
alter table public.rate_limits        enable row level security;

-- Deliberately NO policies: deny-by-default for anon and authenticated.
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from public, anon, authenticated;
