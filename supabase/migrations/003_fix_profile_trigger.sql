-- Fix handle_new_user trigger: add search_path and handle nullable email
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, ''), '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Also make email nullable to be safe
alter table public.profiles alter column email drop not null;
