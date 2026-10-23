# Faculty publishing composer design

## Goal

Faculty editors publish an item by choosing its content type, writing a title and plain-language description, and optionally uploading images. A published item appears on the Faculty home page and the appropriate destination page. The editor does not ask for a database key or JSON.

## Existing structure

The current Faculty information editor writes `faculty_information(key, title, content, is_public)`. Its `key` is the primary key and is used by the About page for fixed sections such as mission and vision. It is not suitable as a content type or as a general publishing table. The site already has `news`, `events`, and `research_projects` tables and public pages. The home page already reads published rows from all three.

## Selected approach

Add a unified **Publish content** form in the Faculty CMS. The selected type determines which existing table receives the item. There is one saved record, and both the home page and destination page read it. Preserve the current Faculty information records and their About page behavior in a separate **About page information** editor; do not rename or repurpose their keys.

| Form choice | Saved as | Destination |
| --- | --- | --- |
| Academic information | `news` with category `Academic` | `/news-events/academic-news` and `/news/[slug]` |
| General announcement | `news` with category `General` | `/news-events/general-news` and `/news/[slug]` |
| Event | `events` with category `General` | `/news-events/general-events` and `/events/[slug]` |
| Research | `research_projects` | `/research` and `/research/[slug]` |

The home page shows published news in Latest updates, the next published event in the event panel, and published research in Research and discovery. Its existing queries provide these placements; verify ordering and linking during implementation.

## Form behavior

The form displays Content type, Title, Description, image upload, publication status, and a preview with the destination. Type-specific fields appear when needed: event start date and optional end date/location for Event; optional researcher and research area for Research. Event start date is required because the `events` table requires `starts_at`. New entries begin as drafts. Editors explicitly choose Published to show the item publicly. The description maps to `news.excerpt` and `news.body`, `events.description` and `events.body`, or `research_projects.summary` and `research_projects.details`, so the listing and detail pages both display the written text.

The image section accepts a cover image and optional additional images. It uses the existing `faculty-public` storage bucket and saves the resulting public URLs to `image_path` and `image_paths`. Show uploaded thumbnails and allow removing a selected image before save. Accept JPEG, PNG, and WebP within the existing 20 MB per-file limit. An upload failure leaves the editor open and shows the storage error. The editor must not claim publication until the row save succeeds.

When editing an existing item, load its type, text, image URLs, status, and type-specific fields into the same form. Changing content type after initial save is disallowed because it would move a record between tables and change its URL; editors may create a new item of another type. Existing news/event/research-specific admin modules remain available for advanced fields.

## Compatibility and validation

Keep the existing `faculty_information` schema and About page lookup intact. Existing About page entries remain editable through the renamed editor, with a text field backed by `content.text` or `content.body` while retaining any other JSON properties. The legacy key is shown as a read-only identifier for existing entries; creating a new About page section is outside this publishing flow.

For the new composer, validate title, description, selected type, and event start date before uploading or saving. Generate a slug and report database errors in the editor. Use the current administrator session and row-level security; no service-role key is sent to the browser. Publishing requires the existing media and academic-content migrations to be applied to Supabase.

## Verification

Test type-to-table mapping, required event date, draft versus published visibility, image URL persistence, and editing without type changes. Manually create one draft and one published item of each type, then confirm each published item appears on the home page and its destination listing/detail page while drafts do not. Confirm existing About page mission and vision entries still display and can be edited without JSON.
