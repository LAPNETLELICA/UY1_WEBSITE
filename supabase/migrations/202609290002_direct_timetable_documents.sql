-- Direct prepared-file workflow: no server-side PDF parsing or structured class entry requirement.
-- Apply after migrations 001 through 009.

do $$
begin
  if to_regclass('public.timetables') is null or to_regclass('public.specializations') is null then
    raise exception 'Timetable migration requires public.timetables and public.specializations.';
  end if;
end $$;

-- Normalize existing relationships before enforcing the department/specialty pair.
update public.timetables t
set department_id = s.department_id
from public.specializations s
where t.specialization_id = s.id
  and t.department_id is distinct from s.department_id;
update public.timetables
set department_id = null, specialization_id = null
where scope = 'faculty';
update public.timetables
set specialization_id = null
where scope = 'department';

create or replace function public.validate_timetable_academic_context()
returns trigger
language plpgsql
set search_path = ''
as $$
declare specialty_department uuid;
begin
  if new.scope = 'faculty' then
    new.department_id := null;
    new.specialization_id := null;
  elsif new.scope = 'department' then
    if new.department_id is null then
      raise exception 'Select a Faculty of Sciences department for a department timetable.';
    end if;
    if not exists (select 1 from public.departments d where d.id = new.department_id and d.is_active) then
      raise exception 'The selected department does not exist or is inactive.';
    end if;
    new.specialization_id := null;
  elsif new.scope = 'specialty' then
    if new.department_id is null or new.specialization_id is null then
      raise exception 'Select both a department and one of its specialties for a specialty timetable.';
    end if;
    if not exists (select 1 from public.departments d where d.id = new.department_id and d.is_active) then
      raise exception 'The selected department does not exist or is inactive.';
    end if;
    select s.department_id into specialty_department
    from public.specializations s where s.id = new.specialization_id and s.is_active;
    if specialty_department is null then
      raise exception 'The selected specialty does not exist or is inactive.';
    end if;
    if specialty_department <> new.department_id then
      raise exception 'The selected specialty does not belong to the selected department.';
    end if;
  else
    raise exception 'Timetable scope must be faculty, department, or specialty.';
  end if;
  return new;
end;
$$;

drop trigger if exists timetables_academic_context_check on public.timetables;
create trigger timetables_academic_context_check
before insert or update of scope, department_id, specialization_id
on public.timetables
for each row execute function public.validate_timetable_academic_context();

-- Legacy extraction-related columns (if present from migration 009) remain
-- untouched so existing database records are not discarded. The application
-- no longer reads or writes them; publishing now depends only on the uploaded file.
