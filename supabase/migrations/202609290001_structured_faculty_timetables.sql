-- Faculty of Sciences timetable versions, source PDFs and structured review data.
-- Apply after migrations 001 through 008.

do $$
declare
  missing_tables text[];
begin
  select array_agg(required.table_name) into missing_tables
  from (values ('departments'), ('specializations'), ('timetables'), ('timetable_entries')) as required(table_name)
  where to_regclass('public.' || required.table_name) is null;
  if missing_tables is not null then
    raise exception 'Timetable migration requires migrations 001 and 003 first. Missing tables: %', array_to_string(missing_tables, ', ');
  end if;
end $$;

-- Keep the timetable structure in the shared faculty department table. Inactive
-- legacy Microbiology rows remain intact for historical references.
update public.departments
set is_active = false, updated_at = now()
where lower(regexp_replace(name, '[^a-zA-Z]+', '', 'g')) = 'microbiology';

insert into public.departments (name, slug, description, is_active, sort_order)
values
  ('Department of Biochemistry', 'biochemistry', '', true, 1),
  ('Department of Animal Biology and Physiology', 'animal-biology-physiology', '', true, 2),
  ('Department of Plant Biology and Physiology', 'plant-biology-physiology', '', true, 3),
  ('Department of Inorganic Chemistry', 'inorganic-chemistry', '', true, 4),
  ('Department of Organic Chemistry', 'organic-chemistry', '', true, 5),
  ('Department of Computer Science', 'computer-science', '', true, 6),
  ('Department of Mathematics', 'mathematics', '', true, 7),
  ('Department of Physics', 'physics', '', true, 8),
  ('Department of Earth and Universe Sciences / Geology', 'earth-universe-sciences-geology', '', true, 9),
  ('Department of Geology', 'geology', '', true, 10)
on conflict (slug) do update set name = excluded.name, is_active = true;

-- A faculty-wide schedule has no one department. Department and specialty
-- timetables continue referencing the same existing academic structure.
alter table public.timetables alter column department_id drop not null;
alter table public.timetables add column if not exists source_pdf_path text;
alter table public.timetables add column if not exists source_file_name text not null default '';
alter table public.timetables add column if not exists version_number integer not null default 1 check (version_number > 0);
alter table public.timetables add column if not exists review_required boolean not null default false;
alter table public.timetables add column if not exists extraction_status text not null default 'manual'
  check (extraction_status in ('manual','pending','review','approved'));
alter table public.timetables add column if not exists notes text not null default '';
alter table public.timetables add column if not exists scope text not null default 'department';
alter table public.timetables drop constraint if exists timetables_scope_check;
alter table public.timetables add constraint timetables_scope_check check (scope in ('faculty','department','specialty'));

create table if not exists public.timetable_source_versions (
  id uuid primary key default gen_random_uuid(),
  timetable_id uuid not null references public.timetables(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  storage_path text not null,
  file_name text not null,
  mime_type text not null default 'application/pdf',
  file_size_bytes bigint not null default 0 check (file_size_bytes >= 0),
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid references auth.users(id) on delete set null,
  unique (timetable_id, version_number)
);

alter table public.timetable_entries add column if not exists department_id uuid references public.departments(id) on delete set null;
alter table public.timetable_entries add column if not exists specialization_id uuid references public.specializations(id) on delete set null;
alter table public.timetable_entries add column if not exists level text not null default '';
alter table public.timetable_entries add column if not exists course_code text not null default '';
alter table public.timetable_entries add column if not exists class_date date;
alter table public.timetable_entries add column if not exists review_required boolean not null default false;
alter table public.timetable_entries add column if not exists extraction_notes text not null default '';
update public.timetable_entries e set department_id = t.department_id, specialization_id = t.specialization_id, level = t.level
from public.timetables t where t.id = e.timetable_id and t.scope <> 'faculty';

alter table public.timetable_source_versions enable row level security;
grant select on public.timetable_source_versions to anon, authenticated;
grant insert, update, delete on public.timetable_source_versions to authenticated;
drop policy if exists timetable_source_versions_public_read on public.timetable_source_versions;
create policy timetable_source_versions_public_read on public.timetable_source_versions
  for select to anon, authenticated using (exists (
    select 1 from public.timetables t where t.id = timetable_id
      and (t.status = 'published' or public.is_faculty_admin())
  ));
drop policy if exists timetable_source_versions_admin_write on public.timetable_source_versions;
create policy timetable_source_versions_admin_write on public.timetable_source_versions
  for all to authenticated using (public.is_faculty_admin()) with check (public.is_faculty_admin());

create index if not exists timetable_source_versions_order_idx on public.timetable_source_versions(timetable_id, version_number desc);
create index if not exists timetable_entries_review_idx on public.timetable_entries(timetable_id, review_required);
create index if not exists timetables_public_faculty_idx on public.timetables(scope, status, academic_year desc);

