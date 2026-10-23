-- Organize faculty content by department and specialty while keeping existing records valid.
create table if not exists public.specializations (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  mission text not null default '',
  teaching_areas text[] not null default '{}',
  research_areas text[] not null default '{}',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (department_id, name),
  unique (department_id, slug)
);

alter table public.departments
  add column if not exists mission text not null default '',
  add column if not exists vision text not null default '',
  add column if not exists objectives text not null default '',
  add column if not exists teaching_areas text[] not null default '{}',
  add column if not exists research_areas text[] not null default '{}';

alter table public.programs
  add column if not exists specialization_id uuid references public.specializations(id) on delete set null,
  add column if not exists level text not null default '',
  add column if not exists academic_year text not null default '',
  add column if not exists details text not null default '';

alter table public.research_projects
  add column if not exists specialization_id uuid references public.specializations(id) on delete set null,
  add column if not exists team_name text not null default '',
  add column if not exists details text not null default '',
  add column if not exists image_path text;

alter table public.news
  add column if not exists department_id uuid references public.departments(id) on delete set null,
  add column if not exists specialization_id uuid references public.specializations(id) on delete set null,
  add column if not exists author_name text not null default '';

alter table public.events
  add column if not exists department_id uuid references public.departments(id) on delete set null,
  add column if not exists specialization_id uuid references public.specializations(id) on delete set null,
  add column if not exists image_path text;

alter table public.gallery_items
  add column if not exists department_id uuid references public.departments(id) on delete set null,
  add column if not exists specialization_id uuid references public.specializations(id) on delete set null,
  add column if not exists event_id uuid references public.events(id) on delete set null,
  add column if not exists research_project_id uuid references public.research_projects(id) on delete set null;

alter table public.documents
  add column if not exists department_id uuid references public.departments(id) on delete set null,
  add column if not exists specialization_id uuid references public.specializations(id) on delete set null,
  add column if not exists program_id uuid references public.programs(id) on delete set null,
  add column if not exists research_project_id uuid references public.research_projects(id) on delete set null,
  add column if not exists academic_level text not null default '';

alter table public.timetables
  add column if not exists specialization_id uuid references public.specializations(id) on delete set null;

alter table public.specializations enable row level security;
grant select on public.specializations to anon, authenticated;
grant insert, update, delete on public.specializations to authenticated;
drop policy if exists specializations_public_read on public.specializations;
create policy specializations_public_read on public.specializations for select to anon, authenticated
  using (is_active or public.is_faculty_admin());
drop policy if exists specializations_admin_write on public.specializations;
create policy specializations_admin_write on public.specializations for all to authenticated
  using (public.is_faculty_admin()) with check (public.is_faculty_admin());

create index if not exists specializations_department_idx on public.specializations(department_id, sort_order, name);
create index if not exists programs_specialization_idx on public.programs(specialization_id, is_active);
create index if not exists news_context_idx on public.news(department_id, specialization_id, status, published_at desc);
create index if not exists events_context_idx on public.events(department_id, specialization_id, status, starts_at);
create index if not exists research_context_idx on public.research_projects(department_id, specialization_id, status);
create index if not exists gallery_context_idx on public.gallery_items(department_id, specialization_id, status);
create index if not exists documents_context_idx on public.documents(department_id, specialization_id, status);
update public.timetables t set specialization_id = p.specialization_id from public.programs p where t.program_id = p.id and t.specialization_id is null and p.specialization_id is not null;
create index if not exists timetables_specialization_idx on public.timetables(specialization_id, status, academic_year desc);

-- Public pages resolve only published content; existing admin policies continue to govern writes.

alter table public.programs add column if not exists slug text not null default '';
alter table public.research_projects add column if not exists slug text not null default '';
update public.programs set slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || left(id::text, 8) where slug = '';
update public.research_projects set slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || left(id::text, 8) where slug = '';
create unique index if not exists programs_slug_idx on public.programs(slug);
create unique index if not exists research_projects_slug_idx on public.research_projects(slug);
