-- Add manageable Faculty services and department leadership profiles.
-- Apply after migrations 001 through 007.

alter table public.departments
  add column if not exists head_title text not null default '',
  add column if not exists head_bio text not null default '',
  add column if not exists head_image_path text;

create table if not exists public.faculty_services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  title text not null default '',
  responsible_name text not null default '',
  biography text not null default '',
  description text not null default '',
  image_path text,
  contact_email text not null default '',
  contact_phone text not null default '',
  department_id uuid references public.departments(id) on delete set null,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.faculty_services enable row level security;
grant select on public.faculty_services to anon, authenticated;
grant insert, update, delete on public.faculty_services to authenticated;
drop policy if exists faculty_services_public_read on public.faculty_services;
create policy faculty_services_public_read on public.faculty_services for select to anon, authenticated
  using (status = 'published' or public.is_faculty_admin());
drop policy if exists faculty_services_admin_write on public.faculty_services;
create policy faculty_services_admin_write on public.faculty_services for all to authenticated
  using (public.is_faculty_admin()) with check (public.is_faculty_admin());
create index if not exists faculty_services_public_order_idx on public.faculty_services(status, sort_order, name);

-- Reuse the same editable page sections and contacts for programmes and services.
alter table public.page_content_blocks
  add column if not exists program_id uuid references public.programs(id) on delete cascade,
  add column if not exists service_id uuid references public.faculty_services(id) on delete cascade;
alter table public.page_content_blocks drop constraint if exists page_content_blocks_scope_check;
alter table public.page_content_blocks add constraint page_content_blocks_scope_check
  check (scope in ('faculty','department','specialty','program','service'));
create index if not exists page_blocks_program_service_idx on public.page_content_blocks(program_id, service_id, page_key, sort_order);

alter table public.site_contacts
  add column if not exists program_id uuid references public.programs(id) on delete cascade,
  add column if not exists service_id uuid references public.faculty_services(id) on delete cascade;
alter table public.site_contacts drop constraint if exists site_contacts_scope_check;
alter table public.site_contacts add constraint site_contacts_scope_check
  check (scope in ('faculty','department','specialty','program','service'));

alter table public.site_links
  add column if not exists program_id uuid references public.programs(id) on delete cascade,
  add column if not exists service_id uuid references public.faculty_services(id) on delete cascade;
alter table public.site_links drop constraint if exists site_links_scope_check;
alter table public.site_links add constraint site_links_scope_check
  check (scope in ('faculty','department','specialty','program','service'));
