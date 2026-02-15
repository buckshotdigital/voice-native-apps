-- Coming Soon feature: apps can be marked as "coming soon" and users can express interest

-- Add columns to apps table
alter table apps add column is_coming_soon boolean not null default false;
alter table apps add column expected_launch_date date;
alter table apps add column interest_count integer not null default 0;

-- Create app_interests table (mirrors upvotes pattern)
create table app_interests (
  user_id uuid references profiles(id) on delete cascade,
  app_id uuid references apps(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, app_id)
);

alter table app_interests enable row level security;

-- RLS policies
create policy "Anyone can view interest counts"
  on app_interests for select using (true);

create policy "Authenticated users can insert own interests"
  on app_interests for insert with check (auth.uid() = user_id);

create policy "Users can delete own interests"
  on app_interests for delete using (auth.uid() = user_id);

-- Trigger to update interest_count on apps (same pattern as upvote_count)
create or replace function update_interest_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update apps set interest_count = interest_count + 1 where id = new.app_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update apps set interest_count = interest_count - 1 where id = old.app_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger on_interest_change
  after insert or delete on app_interests
  for each row execute function update_interest_count();
