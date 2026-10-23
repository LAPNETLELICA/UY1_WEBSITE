-- Allow CMS records with a public visual presence to retain an image gallery
-- in addition to their primary/cover image.
alter table public.departments add column if not exists image_paths text[] not null default '{}';
alter table public.specializations add column if not exists image_paths text[] not null default '{}';
alter table public.programs add column if not exists image_paths text[] not null default '{}';
alter table public.research_projects add column if not exists image_paths text[] not null default '{}';
alter table public.documents add column if not exists image_paths text[] not null default '{}';
alter table public.gallery_albums add column if not exists image_paths text[] not null default '{}';
alter table public.page_content_blocks add column if not exists image_paths text[] not null default '{}';
alter table public.faculty_services add column if not exists image_paths text[] not null default '{}';
