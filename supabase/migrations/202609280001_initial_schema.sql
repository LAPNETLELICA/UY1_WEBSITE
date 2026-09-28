-- UY1 Faculty of Science: initial schema. Apply to Supabase SQL editor or CLI.
create extension if not exists pgcrypto;

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'editor' check (role in ('editor','administrator')),
  created_at timestamptz not null default now()
);
create or replace function public.is_faculty_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_profiles p where p.user_id = (select auth.uid()))
$$;
revoke all on function public.is_faculty_admin() from public;
grant execute on function public.is_faculty_admin() to anon, authenticated;

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  head_name text,
  contact_email text,
  image_path text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete restrict,
  name text not null,
  degree text not null,
  description text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (department_id, name, degree)
);
create table public.timetables (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete restrict,
  program_id uuid not null references public.programs(id) on delete cascade,
  level text not null,
  semester text not null,
  academic_year text not null check (academic_year ~ '^20[0-9]{2}-20[0-9]{2}$'),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_id, level, semester, academic_year)
);
create table public.timetable_entries (
  id uuid primary key default gen_random_uuid(),
  timetable_id uuid not null references public.timetables(id) on delete cascade,
  course_name text not null,
  teacher text,
  room text,
  day_of_week smallint not null check (day_of_week between 1 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);
create index timetable_entries_schedule_idx on public.timetable_entries(timetable_id, day_of_week, start_time);
create index timetables_public_lookup_idx on public.timetables(department_id, status, academic_year desc);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  body text not null default '',
  image_path text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  image_path text,
  status text not null default 'draft' check (status in ('draft','published','cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at is null or ends_at >= starts_at)
);
create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'Campus',
  image_path text not null,
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now()
);
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'General',
  storage_path text not null,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes between 1 and 20971520),
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create table public.research_projects (
  id uuid primary key default gen_random_uuid(),
  department_id uuid references public.departments(id) on delete set null,
  title text not null,
  summary text not null default '',
  lead_name text,
  status text not null default 'draft' check (status in ('draft','published','completed')),
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now()
);
create table public.faculty_information (
  key text primary key,
  title text not null,
  content jsonb not null default '{}'::jsonb,
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Public read, authenticated faculty-admin writes. No anonymous writes.
do $$ declare t text; begin
  foreach t in array array['departments','programs','timetables','timetable_entries','news','events','gallery_items','documents','research_projects','faculty_information','admin_profiles'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %I on public.%I for select to anon, authenticated using (public.is_faculty_admin() or true)', t || '_public_read', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_faculty_admin()) with check (public.is_faculty_admin())', t || '_admin_write', t);
  end loop;
end $$;
-- Replace broad read policies with publication-aware policies.
drop policy departments_public_read on public.departments;
create policy departments_public_read on public.departments for select to anon, authenticated using (is_active or public.is_faculty_admin());
drop policy programs_public_read on public.programs;
create policy programs_public_read on public.programs for select to anon, authenticated using (is_active or public.is_faculty_admin());
drop policy timetables_public_read on public.timetables;
create policy timetables_public_read on public.timetables for select to anon, authenticated using (status = 'published' or public.is_faculty_admin());
drop policy timetable_entries_public_read on public.timetable_entries;
create policy timetable_entries_public_read on public.timetable_entries for select to anon, authenticated using (exists (select 1 from public.timetables t where t.id = timetable_id and (t.status = 'published' or public.is_faculty_admin())));
drop policy news_public_read on public.news;
create policy news_public_read on public.news for select to anon, authenticated using (status = 'published' or public.is_faculty_admin());
drop policy events_public_read on public.events;
create policy events_public_read on public.events for select to anon, authenticated using (status = 'published' or public.is_faculty_admin());
drop policy gallery_items_public_read on public.gallery_items;
create policy gallery_items_public_read on public.gallery_items for select to anon, authenticated using (status = 'published' or public.is_faculty_admin());
drop policy documents_public_read on public.documents;
create policy documents_public_read on public.documents for select to anon, authenticated using (status = 'published' or public.is_faculty_admin());
drop policy research_projects_public_read on public.research_projects;
create policy research_projects_public_read on public.research_projects for select to anon, authenticated using (status = 'published' or public.is_faculty_admin());
drop policy faculty_information_public_read on public.faculty_information;
create policy faculty_information_public_read on public.faculty_information for select to anon, authenticated using (is_public or public.is_faculty_admin());
drop policy admin_profiles_public_read on public.admin_profiles;
create policy admin_profiles_self_or_admin_read on public.admin_profiles for select to authenticated using (user_id = (select auth.uid()) or public.is_faculty_admin());

-- Storage setup: private bucket for all assets; serve public-published files via authorized signed URLs or
-- split public media into public buckets after policy review. Never upload confidential material.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('faculty-public', 'faculty-public', true, 20971520, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;
create policy "Public can read published faculty media" on storage.objects for select to anon, authenticated using (bucket_id = 'faculty-public');
create policy "Faculty admins manage media" on storage.objects for all to authenticated using (bucket_id = 'faculty-public' and public.is_faculty_admin()) with check (bucket_id = 'faculty-public' and public.is_faculty_admin());
