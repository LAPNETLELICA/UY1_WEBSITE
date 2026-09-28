-- Editable media for department, specialty, programme and news landing cards.
alter table public.departments add column if not exists image_path text;
alter table public.specializations add column if not exists image_path text;
alter table public.programs add column if not exists image_path text;
alter table public.news add column if not exists image_path text;
