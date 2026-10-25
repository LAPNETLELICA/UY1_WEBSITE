-- Published content can offer labeled PDF documents and useful web links.
alter table public.departments add column if not exists resource_links jsonb not null default '[]'::jsonb;
alter table public.specializations add column if not exists resource_links jsonb not null default '[]'::jsonb;
alter table public.programs add column if not exists resource_links jsonb not null default '[]'::jsonb;
alter table public.research_projects add column if not exists resource_links jsonb not null default '[]'::jsonb;
alter table public.news add column if not exists resource_links jsonb not null default '[]'::jsonb;
alter table public.events add column if not exists resource_links jsonb not null default '[]'::jsonb;
alter table public.documents add column if not exists resource_links jsonb not null default '[]'::jsonb;
alter table public.page_content_blocks add column if not exists resource_links jsonb not null default '[]'::jsonb;
alter table public.faculty_services add column if not exists resource_links jsonb not null default '[]'::jsonb;
