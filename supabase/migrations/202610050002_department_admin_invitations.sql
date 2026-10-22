-- Make the department-administrator invitation flow safe on databases where
-- the earlier login-identity migration was not applied separately.
alter table public.admin_profiles
  add column if not exists email text,
  add column if not exists username text;

create unique index if not exists admin_profiles_email_unique_idx
  on public.admin_profiles (email) where email is not null;

create unique index if not exists admin_profiles_username_unique_idx
  on public.admin_profiles (username) where username is not null;

-- The profile is the record shown in the Department administrators dashboard.
-- Its foreign key already cascades from auth.users, so deleting the Auth user
-- through the protected server route also removes this record.
