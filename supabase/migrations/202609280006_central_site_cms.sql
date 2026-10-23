-- Expand the existing faculty CMS without removing or renaming existing records.
-- Apply after migrations 001–005.

alter table public.programs alter column department_id drop not null;
alter table public.programs add column if not exists scope text not null default 'department';
update public.programs set scope = case when specialization_id is not null then 'specialty' when department_id is not null then 'department' else 'faculty' end;
alter table public.programs drop constraint if exists programs_scope_check;
alter table public.programs add constraint programs_scope_check check (scope in ('faculty','department','specialty'));

alter table public.research_projects add column if not exists scope text not null default 'department';
alter table public.research_projects add column if not exists research_axis text not null default '';
alter table public.research_projects add column if not exists researchers text[] not null default '{}';
alter table public.research_projects add column if not exists laboratory text not null default '';
alter table public.research_projects add column if not exists document_url text;
alter table public.research_projects add column if not exists external_url text;
update public.research_projects set scope = case when specialization_id is not null then 'specialty' when department_id is not null then 'department' else 'faculty' end;
alter table public.research_projects drop constraint if exists research_projects_scope_check;
alter table public.research_projects add constraint research_projects_scope_check check (scope in ('faculty','department','specialty'));

alter table public.news add column if not exists scope text not null default 'faculty';
alter table public.news add column if not exists program_id uuid references public.programs(id) on delete set null;
alter table public.news add column if not exists category text not null default 'News';
alter table public.news add column if not exists image_paths text[] not null default '{}';
alter table public.news drop constraint if exists news_scope_check;
alter table public.news add constraint news_scope_check check (scope in ('faculty','department','specialty','program'));

alter table public.events add column if not exists scope text not null default 'faculty';
alter table public.events add column if not exists program_id uuid references public.programs(id) on delete set null;
alter table public.events add column if not exists category text not null default 'Event';
alter table public.events add column if not exists image_paths text[] not null default '{}';
alter table public.events drop constraint if exists events_scope_check;
alter table public.events add constraint events_scope_check check (scope in ('faculty','department','specialty','program'));

create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(), title text not null, slug text not null unique,
  description text not null default '', cover_image_path text, category text not null default 'Campus',
  scope text not null default 'faculty' check (scope in ('faculty','department','specialty','event')),
  department_id uuid references public.departments(id) on delete set null,
  specialization_id uuid references public.specializations(id) on delete set null,
  event_id uuid references public.events(id) on delete set null,
  album_date date, status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.gallery_items add column if not exists album_id uuid references public.gallery_albums(id) on delete set null;
alter table public.gallery_items add column if not exists alt_text text not null default '';
alter table public.gallery_items add column if not exists captured_on date;

alter table public.documents add column if not exists visibility text not null default 'public';
alter table public.documents add column if not exists cover_image_path text;
alter table public.documents add column if not exists external_url text;
alter table public.documents add column if not exists program_id uuid references public.programs(id) on delete set null;
alter table public.documents add column if not exists scope text not null default 'faculty';
alter table public.documents drop constraint if exists documents_visibility_check;
alter table public.documents add constraint documents_visibility_check check (visibility in ('public','authenticated','hidden'));
alter table public.documents drop constraint if exists documents_scope_check;
alter table public.documents add constraint documents_scope_check check (scope in ('faculty','department','specialty','program','research'));

alter table public.timetables alter column program_id drop not null;
alter table public.timetables add column if not exists storage_path text;
alter table public.timetables add column if not exists file_url text;
alter table public.timetables add column if not exists mime_type text;
alter table public.timetables add column if not exists scope text not null default 'department';
alter table public.timetables drop constraint if exists timetables_scope_check;
alter table public.timetables add constraint timetables_scope_check check (scope in ('faculty','department','specialty'));

create table if not exists public.page_content_blocks (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'faculty' check (scope in ('faculty','department','specialty')),
  department_id uuid references public.departments(id) on delete cascade,
  specialization_id uuid references public.specializations(id) on delete cascade,
  page_key text not null default 'home', section_key text not null,
  block_type text not null default 'rich_text', title text not null default '',
  content jsonb not null default '{}'::jsonb, image_path text, link_label text, link_url text,
  sort_order integer not null default 0, is_enabled boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.site_contacts (
  id uuid primary key default gen_random_uuid(), scope text not null default 'faculty' check (scope in ('faculty','department','specialty')),
  department_id uuid references public.departments(id) on delete cascade,
  specialization_id uuid references public.specializations(id) on delete cascade,
  label text not null, contact_type text not null default 'email', value text not null,
  sort_order integer not null default 0, is_enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.site_links (
  id uuid primary key default gen_random_uuid(), scope text not null default 'faculty' check (scope in ('faculty','department','specialty')),
  department_id uuid references public.departments(id) on delete cascade,
  specialization_id uuid references public.specializations(id) on delete cascade,
  label text not null, url text not null, category text not null default 'Institutional',
  sort_order integer not null default 0, is_enabled boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(), key text not null unique, title text not null, value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(), title text not null, storage_path text not null unique,
  public_url text not null, mime_type text not null, file_size_bytes bigint not null default 0,
  category text not null default 'General', department_id uuid references public.departments(id) on delete set null,
  specialization_id uuid references public.specializations(id) on delete set null, alt_text text not null default '',
  created_at timestamptz not null default now()
);
alter table public.faculty_information add column if not exists id uuid default gen_random_uuid();
update public.faculty_information set id=gen_random_uuid() where id is null;
alter table public.faculty_information alter column id set not null;
create unique index if not exists faculty_information_id_idx on public.faculty_information(id);

create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(), year text not null unique,
  is_current boolean not null default false, is_enabled boolean not null default true,
  created_at timestamptz not null default now(), check (year ~ '^20[0-9]{2}-20[0-9]{2}$')
);

alter table public.news add column if not exists external_url text;
alter table public.events add column if not exists external_url text;

drop policy if exists documents_public_read on public.documents;
drop policy if exists documents_authenticated_read on public.documents;
create policy documents_public_read on public.documents for select to anon using ((status = 'published' and visibility = 'public') or public.is_faculty_admin());
create policy documents_authenticated_read on public.documents for select to authenticated using ((status = 'published' and visibility in ('public','authenticated')) or public.is_faculty_admin());

create index if not exists page_blocks_lookup_idx on public.page_content_blocks(scope, department_id, specialization_id, page_key, is_enabled, sort_order);
create index if not exists contacts_scope_idx on public.site_contacts(scope, department_id, specialization_id, sort_order);
create index if not exists links_scope_idx on public.site_links(scope, department_id, specialization_id, sort_order);
create index if not exists albums_context_idx on public.gallery_albums(scope, department_id, specialization_id, status, album_date desc);
create index if not exists news_program_idx on public.news(program_id, status);
create index if not exists events_program_idx on public.events(program_id, status);

do $$ declare t text; begin
  foreach t in array array['gallery_albums','page_content_blocks','site_contacts','site_links','site_settings','media_assets','academic_years'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_admin_write', t);
    if t in ('site_settings','media_assets','academic_years') then
      execute format('create policy %I on public.%I for select to anon, authenticated using (public.is_faculty_admin())', t || '_public_read', t);
    elsif t = 'gallery_albums' then
      execute format('create policy %I on public.%I for select to anon, authenticated using (public.is_faculty_admin() or status = ''published'')', t || '_public_read', t);
    else
      execute format('create policy %I on public.%I for select to anon, authenticated using (public.is_faculty_admin() or is_enabled)', t || '_public_read', t);
    end if;
    execute format('create policy %I on public.%I for all to authenticated using (public.is_faculty_admin()) with check (public.is_faculty_admin())', t || '_admin_write', t);
  end loop;
end $$;

grant select on public.gallery_albums, public.page_content_blocks, public.site_contacts, public.site_links, public.site_settings, public.media_assets, public.academic_years to anon, authenticated;
grant insert, update, delete on public.gallery_albums, public.page_content_blocks, public.site_contacts, public.site_links, public.site_settings, public.media_assets, public.academic_years to authenticated;
