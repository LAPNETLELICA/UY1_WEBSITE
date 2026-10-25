-- Reconcile image fields used by the admin CMS on databases where earlier
-- media migrations were only partially applied. Safe to run more than once.
-- Apply after the earlier migrations; this does not replace their tables,
-- constraints, policies, or other content columns.
do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('departments', 'image_path', true),
      ('departments', 'head_image_path', false),
      ('specializations', 'image_path', true),
      ('programs', 'image_path', true),
      ('news', 'image_path', true),
      ('events', 'image_path', true),
      ('research_projects', 'image_path', true),
      ('gallery_items', 'image_path', false),
      ('documents', 'cover_image_path', true),
      ('gallery_albums', 'cover_image_path', true),
      ('page_content_blocks', 'image_path', true),
      ('faculty_services', 'image_path', true)
    ) as fields(table_name, column_name, has_gallery)
  loop
    if to_regclass(format('public.%I', item.table_name)) is null then
      raise notice 'Missing table public.%; apply earlier CMS migrations first', item.table_name;
      continue;
    end if;

    execute format('alter table public.%I add column if not exists %I text', item.table_name, item.column_name);
    if item.has_gallery then
      execute format('alter table public.%I add column if not exists image_paths text[] default %L::text[]', item.table_name, '{}');
      execute format('alter table public.%I alter column image_paths set default %L::text[]', item.table_name, '{}');
      execute format('update public.%I set image_paths = %L::text[] where image_paths is null', item.table_name, '{}');
      execute format('alter table public.%I alter column image_paths set not null', item.table_name);
    end if;
  end loop;
end $$;

-- PostgREST can otherwise keep reporting a newly added column as PGRST204.
notify pgrst, 'reload schema';

-- When run in the SQL Editor, this must return zero rows. A missing table
-- means its earlier CREATE TABLE migration still needs to be applied.
with expected(table_name, column_name) as (
  values
    ('departments', 'image_path'), ('departments', 'head_image_path'), ('departments', 'image_paths'),
    ('specializations', 'image_path'), ('specializations', 'image_paths'),
    ('programs', 'image_path'), ('programs', 'image_paths'),
    ('news', 'image_path'), ('news', 'image_paths'),
    ('events', 'image_path'), ('events', 'image_paths'),
    ('research_projects', 'image_path'), ('research_projects', 'image_paths'),
    ('gallery_items', 'image_path'),
    ('documents', 'cover_image_path'), ('documents', 'image_paths'),
    ('gallery_albums', 'cover_image_path'), ('gallery_albums', 'image_paths'),
    ('page_content_blocks', 'image_path'), ('page_content_blocks', 'image_paths'),
    ('faculty_services', 'image_path'), ('faculty_services', 'image_paths')
)
select expected.table_name, expected.column_name
from expected
left join information_schema.columns as actual
  on actual.table_schema = 'public'
 and actual.table_name = expected.table_name
 and actual.column_name = expected.column_name
where actual.column_name is null
order by expected.table_name, expected.column_name;
