-- Enable required extensions
create extension if not exists "pg_trgm";

-- ============================================================
-- PROFILES
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  submissions_today int not null default 0,
  last_submission_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "Admins can read all profiles"
  on profiles for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  icon text not null default '📁',
  display_order int not null default 0
);

alter table categories enable row level security;

create policy "Categories are publicly readable"
  on categories for select using (true);

create policy "Admins can manage categories"
  on categories for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- APPS
-- ============================================================
create table apps (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references profiles(id) on delete cascade,
  name text not null check (char_length(name) <= 100),
  slug text not null unique,
  tagline text not null check (char_length(tagline) between 10 and 150),
  description text not null check (char_length(description) between 50 and 2000),
  category_id uuid not null references categories(id),
  voice_features text[] not null default '{}',
  platforms text[] not null default '{}',
  website_url text not null,
  app_store_url text,
  play_store_url text,
  other_download_url text,
  logo_url text not null,
  screenshot_urls text[] not null default '{}',
  demo_video_url text,
  pricing_model text not null default 'free' check (pricing_model in ('free', 'freemium', 'paid', 'subscription')),
  pricing_details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  featured boolean not null default false,
  upvote_count int not null default 0,
  view_count int not null default 0,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table apps enable row level security;

-- Anyone can read approved apps
create policy "Approved apps are publicly readable"
  on apps for select using (status = 'approved');

-- Submitters can read their own apps (any status)
create policy "Submitters can read own apps"
  on apps for select using (auth.uid() = submitted_by);

-- Admins can read all apps
create policy "Admins can read all apps"
  on apps for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Authenticated users can insert
create policy "Authenticated users can submit apps"
  on apps for insert with check (auth.uid() = submitted_by);

-- Submitter can update own pending apps
create policy "Submitters can update own pending apps"
  on apps for update using (
    auth.uid() = submitted_by and status in ('pending', 'rejected')
  );

-- Admins can update any app
create policy "Admins can update any app"
  on apps for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Index for full-text search
create index apps_search_idx on apps using gin(search_vector);
create index apps_status_idx on apps(status);
create index apps_category_idx on apps(category_id);
create index apps_featured_idx on apps(featured) where featured = true;
create index apps_slug_idx on apps(slug);

-- ============================================================
-- TAGS
-- ============================================================
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

alter table tags enable row level security;

create policy "Tags are publicly readable"
  on tags for select using (true);

create policy "Admins can manage tags"
  on tags for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Authenticated users can insert tags (for submission flow)
create policy "Authenticated users can create tags"
  on tags for insert with check (auth.uid() is not null);

-- ============================================================
-- APP_TAGS (junction)
-- ============================================================
create table app_tags (
  app_id uuid not null references apps(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (app_id, tag_id)
);

alter table app_tags enable row level security;

create policy "App tags are publicly readable"
  on app_tags for select using (true);

create policy "App submitters can manage their app tags"
  on app_tags for insert with check (
    exists (select 1 from apps where id = app_id and submitted_by = auth.uid())
  );

create policy "Admins can manage app tags"
  on app_tags for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- UPVOTES
-- ============================================================
create table upvotes (
  user_id uuid not null references profiles(id) on delete cascade,
  app_id uuid not null references apps(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, app_id)
);

alter table upvotes enable row level security;

create policy "Upvotes are publicly readable"
  on upvotes for select using (true);

create policy "Authenticated users can insert own upvotes"
  on upvotes for insert with check (auth.uid() = user_id);

create policy "Users can delete own upvotes"
  on upvotes for delete using (auth.uid() = user_id);

-- ============================================================
-- REPORTS
-- ============================================================
create table reports (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references apps(id) on delete cascade,
  reporter_id uuid not null references profiles(id) on delete cascade,
  reason text not null check (reason in ('spam', 'misleading', 'broken_links', 'duplicate', 'inappropriate', 'other')),
  details text not null check (char_length(details) between 10 and 500),
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

alter table reports enable row level security;

create policy "Authenticated users can submit reports"
  on reports for insert with check (auth.uid() = reporter_id);

create policy "Admins can read all reports"
  on reports for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update reports"
  on reports for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ============================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Update search vector on app insert/update
create or replace function update_search_vector()
returns trigger as $$
begin
  new.search_vector := to_tsvector('english',
    coalesce(new.name, '') || ' ' ||
    coalesce(new.tagline, '') || ' ' ||
    coalesce(new.description, '')
  );
  return new;
end;
$$ language plpgsql;

create trigger apps_search_vector_update
  before insert or update of name, tagline, description on apps
  for each row execute function update_search_vector();

-- Update upvote count
create or replace function update_upvote_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update apps set upvote_count = upvote_count + 1 where id = new.app_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update apps set upvote_count = upvote_count - 1 where id = old.app_id;
    return old;
  end if;
end;
$$ language plpgsql security definer;

create trigger on_upvote_change
  after insert or delete on upvotes
  for each row execute function update_upvote_count();

-- Auto-generate slug from name
create or replace function generate_slug()
returns trigger as $$
declare
  base_slug text;
  final_slug text;
  counter int := 0;
begin
  base_slug := lower(regexp_replace(trim(new.name), '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '[\s]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;

  while exists (select 1 from apps where slug = final_slug and id != coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)) loop
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  end loop;

  new.slug := final_slug;
  return new;
end;
$$ language plpgsql;

create trigger apps_generate_slug
  before insert or update of name on apps
  for each row execute function generate_slug();

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger apps_updated_at
  before update on apps
  for each row execute function update_updated_at();

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- ============================================================
-- SEED CATEGORIES
-- ============================================================
insert into categories (name, slug, description, icon, display_order) values
  ('Productivity & Assistants', 'productivity-assistants', 'Voice-powered tools to get things done faster', 'zap', 1),
  ('Health & Wellness', 'health-wellness', 'Voice apps for fitness, meditation, and health tracking', 'heart-pulse', 2),
  ('Smart Home & IoT', 'smart-home-iot', 'Control your connected devices with voice', 'home', 3),
  ('Communication & Social', 'communication-social', 'Voice-first messaging and social platforms', 'message-circle', 4),
  ('Entertainment & Media', 'entertainment-media', 'Voice-controlled music, podcasts, and media', 'music', 5),
  ('Education & Learning', 'education-learning', 'Learn languages and skills through voice interaction', 'graduation-cap', 6),
  ('Navigation & Travel', 'navigation-travel', 'Voice-guided navigation and travel planning', 'map', 7),
  ('Finance & Shopping', 'finance-shopping', 'Voice commerce and financial management', 'wallet', 8),
  ('Accessibility', 'accessibility', 'Voice technology making the world more accessible', 'accessibility', 9),
  ('Developer Tools', 'developer-tools', 'Voice APIs, SDKs, and developer resources', 'code', 10);

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public) values ('app-assets', 'app-assets', true);

create policy "Anyone can read app assets"
  on storage.objects for select using (bucket_id = 'app-assets');

create policy "Authenticated users can upload app assets"
  on storage.objects for insert with check (
    bucket_id = 'app-assets' and auth.uid() is not null
  );

create policy "Users can update own uploads"
  on storage.objects for update using (
    bucket_id = 'app-assets' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own uploads"
  on storage.objects for delete using (
    bucket_id = 'app-assets' and auth.uid()::text = (storage.foldername(name))[1]
  );
