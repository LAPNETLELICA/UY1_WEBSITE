# Services and administration editor design

## Goal and scope

Faculty administrators need one place in the **admin dashboard** to manage the public “Services et administration de la faculté” content. Visitors can read the resulting content on the Faculty home page and `/services`, but cannot see editing controls. Editors should write ordinary text, upload images, and manage service profiles without entering JSON. Address directly related content-editor defects discovered while implementing this flow; unrelated site-wide issues are outside this change.

## Existing data and selected approach

The `faculty_services` table already stores published service cards, including names, descriptions, portraits and contact details. Department leadership is stored on `departments` (`head_name`, `head_title`, `head_bio`, `head_image_path`). Both public pages currently render the Rector/Dean cards from the hard-coded `facultyLeaders` array, and `/services` also hard-codes its banner and introductory copy. The admin dashboard already has a Services module and an image uploader.

Reuse the existing `faculty_information` table for the page-level configuration instead of introducing another schema migration. One public row, `key = 'services_page'`, stores an object in `content` with the page text, banner URL and a `leaders` array of `{ role, name, summary, imagePath }`. The admin UI never exposes that object as JSON. Existing hard-coded values remain display fallbacks when the row or individual fields are absent, so an upgrade does not blank the public pages. Edits to service cards continue using `faculty_services`; edits to department-head profiles continue using `departments`.

## Admin dashboard experience

Rename the current Services dashboard entry to “Services et administration” and give it a dedicated page-management panel above its existing service-record list. This panel is visible only to authenticated Faculty administrators with the existing Services permission. It contains:

- Home-section eyebrow, heading and introduction; `/services` page heading, introduction, section heading and section description.
- Current banner preview plus JPEG/PNG/WebP upload to `faculty-public`, limited to 20 MB, with a clear upload error and no save-success claim until the row is saved.
- Rector/Dean leadership cards with ordinary inputs for role, name and summary, and a portrait upload/preview for each card. Editors may add, remove and reorder cards; existing cards are prefilled from the fallback data on first use.
- The existing service-record list and editor, including service photos, publication status and ordering. A department-head summary lists existing records and provides a direct route to edit each record in the Departments editor; the same department data remains the single source of truth.

The page-level Save action upserts `faculty_information.services_page` with `is_public = true`. It validates required headings and nonempty leader names/roles before saving. Leaving the panel, upload failures, or database errors must not silently discard unsaved text. The current service-card editor keeps its own Save action; page settings and service cards are distinct records.

## Public rendering

The Faculty home section and `/services` load the public `services_page` row and resolve each configured field against its current fallback. Both use the same saved leaders and image URLs. The existing service-card queries continue to show only published services. Department-head cards on `/services` continue to read Departments. Neither public page imports an admin component or exposes editing controls. The Services banner falls back to `PAGE_BANNER_IMAGES.services` until replaced.

## Plain-language page-section descriptions

In the general Page sections editor, relabel “Section content (JSON)” to “Description” and show a textarea containing the readable description from `content.description`, `content.body` or `content.text`. Saving writes `content.description` while preserving unrelated JSON properties such as cards, statistics and image alt text. Editors do not see or type JSON for this description. Other JSON-only settings are not silently converted into prose fields because their schemas have different meanings.

## Verification

Test parsing and merging the Services configuration, fallback behavior, leader reordering, and page-block description preservation. Test upload validation and error handling at the UI boundary where practical. Verify both public pages read the same saved copy/leaders, drafts remain hidden, and the new controls are admin-only. Run the repository test suite and typecheck; report pre-existing failures separately. A live Supabase save/upload still requires a configured project with the existing storage policies and CMS migrations applied.
