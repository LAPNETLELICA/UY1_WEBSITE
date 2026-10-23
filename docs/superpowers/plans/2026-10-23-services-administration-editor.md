# Services and Administration Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let authorized administrators manage the Services page copy, banner, Rector/Dean cards, service profiles and department-head entry points from the admin dashboard, while public pages only display published content.

**Architecture:** Store page copy and leaders in one `faculty_information` row (`key = 'services_page'`) and keep `faculty_services` and `departments` as the existing sources for service cards and department heads. A focused model module resolves partial/legacy data against current defaults for both public pages and the new admin panel. No migration is introduced.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase JS, `node:test`.

**Spec:** `docs/superpowers/specs/2026-10-23-services-administration-editor-design.md`

## Global Constraints

- Admin-only editing; no edit UI or service-role key in public pages or browser code.
- Use `faculty-public` for JPEG/PNG/WebP images, maximum 20 MB per file.
- Preserve current public copy/images as fallbacks and preserve unrelated properties in the `services_page` JSONB object.
- Do not alter `faculty_services` or `departments` schema or make a new migration.
- Preserve the already-uncommitted workspace changes; stage only hunks created for these tasks.

## Review Focus

- Missing or malformed `services_page.content` must not blank either public page (Task 1 fallback test).
- An explicitly saved empty `leaders` array must remain empty rather than restoring fallback cards (Task 1 empty-array test).
- Invalid MIME type or a file over 20 MB must not upload or mutate saved content (Task 2 upload-validation test).
- Failed saves and navigation away with unsaved changes must retain or warn about the draft (Task 2 failure/dirty-draft tests).
- A non-public `services_page` row or draft `faculty_services` row must not appear publicly (Task 3 visibility test).

---

### Task 1: Services page content contract

**Files:**
- Create: `src/lib/services-page-content.ts`
- Create: `tests/services-page-content.test.ts`

**Interfaces:**
- `type ServicesPageContent = { homeEyebrow: string; homeHeading: string; homeIntroduction: string; pageHeading: string; pageIntroduction: string; sectionHeading: string; sectionDescription: string; bannerImage: string; leaders: { role: string; name: string; summary: string; imagePath: string }[] }`.
- `resolveServicesPageContent(raw: unknown, fallbackBanner: string, fallbackLeaders: ServicesPageContent['leaders']): ServicesPageContent` reads a `faculty_information.content` value and supplies the current copy plus the passed `PAGE_BANNER_IMAGES.services` and `facultyLeaders` defaults. Passing defaults keeps this model directly testable without Next.js path aliases. A valid explicit `leaders: []` stays empty.
- `resolvePublicServicesPageContent(row: { is_public: boolean; content: unknown } | null, fallbackBanner: string, fallbackLeaders: ServicesPageContent['leaders']): ServicesPageContent` ignores a non-public row and delegates to the same resolver.
- `mergeServicesPageContent(previous: unknown, next: ServicesPageContent): Record<string, unknown>` preserves unrelated keys while replacing only the named Services fields.
- `validateServicesPageContent(value: ServicesPageContent): string | null` requires the home and Services page headings and nonempty leader roles/names.

- [ ] **Step 1: Write failing tests** for absent/partial/malformed content, explicit empty leaders, merge preservation, validation, and adding/removing/reordering leaders by array order. Use literal expected strings and URLs from the current public pages.
- [ ] **Step 2: Run** `node --experimental-strip-types tests/services-page-content.test.ts`; confirm failures are the expected missing behavior.
- [ ] **Step 3: Implement** the five interfaces in `src/lib/services-page-content.ts`; keep the fallback copy strings there, and pass the existing banner/leader assets from callers.
- [ ] **Step 4: Rerun** the focused test; expect all assertions to pass.
- [ ] **Step 5: Review and commit** only the new model and test files: `git add src/lib/services-page-content.ts tests/services-page-content.test.ts` then `git commit -m "Add Services page content model"`.

### Task 2: Admin-only Services management panel

**Files:**
- Create: `src/components/services-administration-editor.tsx`
- Create: `src/lib/services-image-upload.ts`
- Create: `tests/services-image-upload.test.ts`
- Modify: `src/components/admin-workspace.tsx` (Services module label, panel mount, department-head edit navigation)
- Modify: `src/app/globals.css` (panel layout, leader controls and responsive behavior)

**Interfaces:**
- `validateServicesImage(file: { type: string; size: number }): string | null` enforces the exact spec MIME types and 20 MB limit; it is called before `storage.from('faculty-public').upload(...)`.
- `<ServicesAdministrationEditor departments={departments} onEditDepartment={(id: string) => void} />` loads/upserts `faculty_information.services_page`, edits the Task 1 type via plain controls, and shows a department-head summary that opens the existing Departments editor.

- [ ] **Step 1: Write failing tests** for JPEG/PNG/WebP boundaries, 20 MB boundary and rejected PDF/oversize inputs. Record manual UI checks for load/save failure, unsaved-draft navigation, leader add/remove/reorder and admin-only access before implementation.
- [ ] **Step 2: Run** `node --experimental-strip-types tests/services-image-upload.test.ts`; confirm expected assertion failures.
- [ ] **Step 3: Implement** upload validation and the editor: load `key,title,content` for `services_page`; save with `upsert(...,{onConflict:'key'})`, `is_public:true`, and `mergeServicesPageContent`; report Supabase errors verbatim; upload banner/portraits to `faculty-public`; show previews. Keep unsaved text in `sessionStorage` until successful save and warn on browser unload. Do not claim success after upload alone.
- [ ] **Step 4: Mount** the panel above the existing Services record list, rename the sidebar entry, and connect department-head edit buttons to the current Department editor without copying department data. Preserve the generic service-card editor and its publication status.
- [ ] **Step 5: Run** the focused test and manually confirm only admin users can open the panel, failed saves retain text, drafts survive module navigation, and a newly uploaded image appears in preview before the page-level Save.
- [ ] **Step 6: Commit** only this task's files/hunks; use patch staging for `admin-workspace.tsx` because it already has unrelated uncommitted changes.

### Task 3: Public home and Services page consume saved content

**Files:**
- Modify: `src/app/page.tsx` (home Services section)
- Modify: `src/app/services/page.tsx` (banner, headings, descriptions and leadership cards)
- Extend: `tests/services-page-content.test.ts`

**Interfaces:**
- Both pages select the public `faculty_information` row with `key='services_page'` and `is_public=true`, then call Task 1's `resolvePublicServicesPageContent(row ?? null, PAGE_BANNER_IMAGES.services, facultyLeaders)`.
- Existing `faculty_services.status='published'` and active Departments queries remain the only sources for the corresponding public cards.

- [ ] **Step 1: Add failing visibility tests** to the Task 1 test file for absent/non-public configuration through `resolvePublicServicesPageContent`, with literal expected fallback values.
- [ ] **Step 2: Run** the focused test to confirm the new assertions fail for the missing behavior.
- [ ] **Step 3: Update** both pages to read the same resolved settings and render the configured copy, banner and leader cards. Keep admin components out of these routes and retain published-service/active-department filtering.
- [ ] **Step 4: Run** `node --experimental-strip-types --test tests/*.test.ts` and `node node_modules/typescript/bin/tsc --noEmit --incremental false`; report any existing compiler errors separately. Manually verify a saved title, portrait and banner on both public pages, a draft service hidden, and no public edit controls.
- [ ] **Step 5: Commit** only Task 3 files/hunks after checking `git diff --check`.
