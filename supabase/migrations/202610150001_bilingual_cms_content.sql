-- Stores optional localized CMS text while preserving existing English columns.
do $$
declare
  target text;
begin
  foreach target in array array[
    'departments', 'specializations', 'programs', 'research_projects',
    'news', 'events', 'faculty_services', 'gallery_items', 'gallery_albums',
    'documents', 'faculty_information', 'page_content_blocks', 'site_contacts',
    'site_links', 'media_assets'
  ] loop
    execute format('alter table public.%I add column if not exists translations jsonb not null default ''{}''::jsonb', target);
  end loop;
end $$;
