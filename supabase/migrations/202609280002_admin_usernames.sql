-- Server-only mapping from administrator usernames to existing Supabase Auth users.
-- Never grant anon/authenticated access to this table. The Next.js server uses the
-- service-role key for lookup; it must never be exposed as a NEXT_PUBLIC variable.
create table public.admin_login_identities (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique
    check (username = lower(username) and username ~ '^[a-z0-9._-]{3,64}$'),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.admin_login_identities enable row level security;
revoke all on public.admin_login_identities from anon, authenticated;

-- Create each login identity as a trusted Supabase project owner after creating
-- the auth user and matching admin_profiles row. Example (replace values):
-- insert into public.admin_login_identities (user_id, username, email)
-- values ('AUTH-USER-UUID', 'facultyadmin', 'admin@example.edu');