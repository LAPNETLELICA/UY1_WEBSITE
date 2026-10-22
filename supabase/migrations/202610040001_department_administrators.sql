-- Multi-administrator accounts. Existing `administrator` profiles remain the
-- Faculty super administrators until they are explicitly changed.
alter table public.admin_profiles drop constraint if exists admin_profiles_role_check;
alter table public.admin_profiles
  add column if not exists department_id uuid references public.departments(id) on delete set null,
  add column if not exists permissions jsonb not null default '["department_content"]'::jsonb,
  add column if not exists is_active boolean not null default true,
  add column if not exists last_login timestamptz;

-- Older installations can contain legacy role names (for example `admin`).
-- They already had faculty-wide access, so retain that access as `editor`.
update public.admin_profiles
set role = 'editor'
where role is null
   or role not in ('editor', 'administrator', 'super_admin', 'department_admin');

alter table public.admin_profiles
  add constraint admin_profiles_role_check check (role in ('editor', 'administrator', 'super_admin', 'department_admin'));

create index if not exists admin_profiles_department_idx on public.admin_profiles(department_id);

-- A department administrator must be tied to one department; faculty-wide
-- administrators intentionally have no department assignment.
alter table public.admin_profiles drop constraint if exists department_admin_department_required;
alter table public.admin_profiles add constraint department_admin_department_required
  check (role <> 'department_admin' or department_id is not null);

-- Department accounts can manage rows belonging only to their assigned department.
create or replace function public.is_faculty_super_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admin_profiles p
    where p.user_id = (select auth.uid())
      and p.is_active
      and p.role in ('editor', 'administrator', 'super_admin')
  )
$$;

create or replace function public.can_manage_department(target_department_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_faculty_super_admin() or exists (
    select 1 from public.admin_profiles p
    where p.user_id = (select auth.uid())
      and p.is_active
      and p.role = 'department_admin'
      and p.department_id = target_department_id
  )
$$;

-- Existing broad write policies now apply only to Faculty super administrators.
create or replace function public.is_faculty_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_faculty_super_admin()
$$;

do $$ declare t text; begin
  foreach t in array array['specializations','programs','timetables','research_projects','news','events','gallery_items','documents','gallery_albums','page_content_blocks','site_contacts','site_links','media_assets','faculty_services'] loop
    execute format('drop policy if exists %I on public.%I', t || '_department_admin_manage', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.can_manage_department(department_id)) with check (public.can_manage_department(department_id))', t || '_department_admin_manage', t);
  end loop;
end $$;

drop policy if exists departments_department_admin_update on public.departments;
create policy departments_department_admin_update on public.departments for update to authenticated
  using (public.can_manage_department(id)) with check (public.can_manage_department(id));
