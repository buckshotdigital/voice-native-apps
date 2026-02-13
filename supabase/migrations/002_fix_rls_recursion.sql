-- Fix infinite recursion: admin check on profiles references profiles itself
-- Solution: use a security definer function that bypasses RLS

create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Drop the recursive policies
drop policy if exists "Admins can read all profiles" on profiles;
drop policy if exists "Admins can read all apps" on apps;
drop policy if exists "Admins can update any app" on apps;
drop policy if exists "Admins can manage categories" on categories;
drop policy if exists "Admins can manage tags" on tags;
drop policy if exists "Admins can manage app tags" on app_tags;
drop policy if exists "Admins can read all reports" on reports;
drop policy if exists "Admins can update reports" on reports;

-- Recreate using is_admin() function (bypasses RLS)
create policy "Admins can read all profiles"
  on profiles for select using (is_admin());

create policy "Admins can read all apps"
  on apps for select using (is_admin());

create policy "Admins can update any app"
  on apps for update using (is_admin());

create policy "Admins can manage categories"
  on categories for all using (is_admin());

create policy "Admins can manage tags"
  on tags for all using (is_admin());

create policy "Admins can manage app tags"
  on app_tags for all using (is_admin());

create policy "Admins can read all reports"
  on reports for select using (is_admin());

create policy "Admins can update reports"
  on reports for update using (is_admin());
