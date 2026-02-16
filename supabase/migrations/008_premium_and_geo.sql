-- Premium analytics & geo capture: country on interests, app_unlocks table, RPC functions

-- Add country column to app_interests
alter table app_interests add column country text;
create index idx_app_interests_country on app_interests (app_id, country) where country is not null;

-- Create app_unlocks table for premium per-app purchases
create table app_unlocks (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references apps(id) on delete cascade,
  unlocked_by uuid not null references profiles(id) on delete cascade,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text unique,
  amount_cents integer not null,
  currency text not null default 'usd',
  created_at timestamptz not null default now(),
  unique (app_id)
);

alter table app_unlocks enable row level security;

-- RLS: only app owner or admin can view unlock records
create policy "App owner can view own unlocks"
  on app_unlocks for select using (
    unlocked_by = auth.uid()
    or exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- No INSERT/UPDATE/DELETE policies — only admin client (webhook) writes

-- RPC: interest timeline grouped by day
create or replace function get_interest_timeline(p_app_id uuid)
returns table(day date, count bigint)
language sql
security definer
set search_path = public
as $$
  select
    date(created_at) as day,
    count(*) as count
  from app_interests
  where app_id = p_app_id
  group by date(created_at)
  order by day;
$$;

-- RPC: interest countries grouped by country code
create or replace function get_interest_countries(p_app_id uuid)
returns table(country text, count bigint)
language sql
security definer
set search_path = public
as $$
  select
    coalesce(country, 'Unknown') as country,
    count(*) as count
  from app_interests
  where app_id = p_app_id
  group by country
  order by count desc;
$$;

-- RPC: interested users with profile data (for premium unlock)
create or replace function get_interested_users(p_app_id uuid)
returns table(email text, display_name text, country text, interested_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select
    p.email,
    p.display_name,
    ai.country,
    ai.created_at as interested_at
  from app_interests ai
  join profiles p on p.id = ai.user_id
  where ai.app_id = p_app_id
  order by ai.created_at desc;
$$;

-- Revoke direct execution from client roles — these must only be called
-- via service_role (admin client) in server actions that verify ownership/payment
revoke execute on function get_interest_timeline(uuid) from anon, authenticated;
revoke execute on function get_interest_countries(uuid) from anon, authenticated;
revoke execute on function get_interested_users(uuid) from anon, authenticated;
