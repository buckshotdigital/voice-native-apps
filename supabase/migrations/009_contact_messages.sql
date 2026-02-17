-- Contact messages from signed-in users
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

-- RLS
alter table contact_messages enable row level security;

-- Users can insert their own messages
create policy "Users can submit contact messages"
  on contact_messages for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can view their own messages
create policy "Users can view own messages"
  on contact_messages for select
  to authenticated
  using (auth.uid() = user_id);

-- Admins can view all messages (via profiles role check)
create policy "Admins can view all messages"
  on contact_messages for select
  to authenticated
  using (
    exists (
      select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Admins can update message status
create policy "Admins can update messages"
  on contact_messages for update
  to authenticated
  using (
    exists (
      select 1 from profiles where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
