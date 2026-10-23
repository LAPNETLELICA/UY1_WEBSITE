-- Mirror the private username/email mapping onto admin_profiles so server-side
-- login actions can perform the requested profile lookup. RLS remains unchanged.
alter table public.admin_profiles
  add column if not exists username text,
  add column if not exists email text;

update public.admin_profiles as profiles
set username = identities.username,
    email = identities.email
from public.admin_login_identities as identities
where identities.user_id = profiles.user_id
  and (profiles.username is distinct from identities.username
    or profiles.email is distinct from identities.email);

create unique index if not exists admin_profiles_username_unique_idx
  on public.admin_profiles (username) where username is not null;
create unique index if not exists admin_profiles_email_unique_idx
  on public.admin_profiles (email) where email is not null;

create or replace function public.sync_admin_profile_login_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    update public.admin_profiles
      set username = null, email = null
      where user_id = old.user_id;
    return old;
  end if;

  update public.admin_profiles
    set username = new.username, email = new.email
    where user_id = new.user_id;
  return new;
end;
$$;

revoke all on function public.sync_admin_profile_login_identity() from public;
drop trigger if exists sync_admin_profile_login_identity on public.admin_login_identities;
create trigger sync_admin_profile_login_identity
  after insert or update of username, email, user_id or delete
  on public.admin_login_identities
  for each row execute function public.sync_admin_profile_login_identity();
