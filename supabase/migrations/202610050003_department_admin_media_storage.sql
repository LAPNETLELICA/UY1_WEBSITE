-- Department administrators can upload and manage media only inside a folder
-- named with their assigned department UUID. Faculty super administrators keep
-- access to all media.
create or replace function public.can_manage_department_media(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_faculty_super_admin() or exists (
    select 1
    from public.admin_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.is_active
      and profile.role = 'department_admin'
      and object_name like profile.department_id::text || '/%'
  )
$$;

revoke all on function public.can_manage_department_media(text) from public;
grant execute on function public.can_manage_department_media(text) to authenticated;

drop policy if exists "Faculty admins manage media" on storage.objects;
drop policy if exists "Department staff manage media" on storage.objects;
create policy "Department staff manage media" on storage.objects
for all to authenticated
using (
  bucket_id = 'faculty-public'
  and public.can_manage_department_media(name)
)
with check (
  bucket_id = 'faculty-public'
  and public.can_manage_department_media(name)
);
