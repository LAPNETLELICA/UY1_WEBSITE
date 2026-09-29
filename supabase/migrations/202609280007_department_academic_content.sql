-- Additional department and specialty content fields used by the department pages.
-- Apply after migration 006.

alter table public.programs
  add column if not exists cycle text not null default '';

alter table public.specializations
  add column if not exists objectives text not null default '',
  add column if not exists career_paths text[] not null default '{}',
  add column if not exists teaching_staff text[] not null default '{}',
  add column if not exists laboratories text[] not null default '{}';

alter table public.research_projects
  add column if not exists publications text[] not null default '{}';

alter table public.events
  add column if not exists author_name text not null default '',
  add column if not exists body text not null default '';

create index if not exists research_projects_department_status_idx
  on public.research_projects(department_id, status, starts_on desc);
create index if not exists events_department_start_idx
  on public.events(department_id, status, starts_at);


drop policy if exists research_projects_public_read on public.research_projects;
create policy research_projects_public_read on public.research_projects for select to anon, authenticated using (status in ('published','completed') or public.is_faculty_admin());
