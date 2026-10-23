# Faculty Publishing Composer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Faculty information JSON/key creation form with a typed publishing form whose published items appear on the Faculty home page and matching destination pages.

**Architecture:** Keep `faculty_information` for existing About page sections. Add a composer that maps four content types to existing `news`, `events`, and `research_projects` rows and uses the current public storage bucket. Extend the existing admin workspace and public views only where their current rendering does not show the new content clearly.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase, CSS, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-23-faculty-publishing-composer-design.md`

## Global Constraints

- Preserve existing `faculty_information.key` values and About page content.
- Do not add a new publishing table or place a service-role key in browser code.
- Image uploads accept JPEG, PNG, and WebP up to 20 MB each through `faculty-public`.
- New entries start as drafts; only published entries appear publicly.
- The existing dirty change in `src/components/admin-workspace.tsx` belongs to the prior specialty-save fix; preserve it.

## Review Focus

- Empty image selection must save empty image arrays, not `null` to a non-null column (Task 1 test).
- Missing event start date must stop save before an upload or database write (Task 1 test).
- Editing a published item must preserve its slug and table even if its title changes (Task 1 test).
- Upload failure must keep typed text and show an error, without reporting publication (Task 2 test/manual check).
- Existing mission/vision JSON properties must survive an About page text edit (Task 2 test).

---

### Task 1: Content mapping and validation

**Files:** Create `src/lib/faculty-publishing.ts`; create `tests/faculty-publishing.test.ts`.

**Interfaces:** Produce `ContentType = "academic_information" | "general_announcement" | "event" | "research"`; `getPublishingDestination(type: ContentType): {table: "news" | "events" | "research_projects"; category?: "Academic" | "General"; listingHref: string}`; `buildPublishingPayload(input: PublishingInput, existing?: {slug: string}): {table: string; payload: Record<string, unknown>}`. `PublishingInput` includes title, description, type, status, cover image URL, image URLs, and optional event/research fields.

- [ ] **Step 1: Write failing tests** for all four type mappings, description-to-summary/body mapping, empty images as `[]`, required event date, and editing with the existing slug.
- [ ] **Step 2: Run** `node --experimental-strip-types --test tests/faculty-publishing.test.ts`; confirm failures are from missing behavior.
- [ ] **Step 3: Implement** the exported types and functions in `src/lib/faculty-publishing.ts`. Return validation errors before making requests; preserve the existing slug on edit.
- [ ] **Step 4: Run** the focused test and `node --experimental-strip-types --test tests/*.test.ts`; confirm all pass.
- [ ] **Step 5: Commit** only the helper and its test.

### Task 2: Unified admin form and legacy About editor

**Files:** Modify `src/components/admin-workspace.tsx`; create `src/components/faculty-publishing-editor.tsx`; modify `src/app/globals.css`; create `tests/faculty-information-content.test.ts` and `src/lib/faculty-information-content.ts` for legacy JSON-to-text mapping.

**Interfaces:** Consume Task 1's `ContentType`, `getPublishingDestination`, and `buildPublishingPayload`. Produce a `FacultyPublishingEditor` component with `onSaved()` callback and an existing-row prop that includes its source table and row. Export `readFacultyInformationText(content: unknown): string` and `withFacultyInformationText(content: unknown, text: string): Record<string, unknown>`.

- [ ] **Step 1: Write failing tests** for legacy text extraction and update while retaining unrelated JSON properties.
- [ ] **Step 2: Run** the focused Node test and confirm expected failures.
- [ ] **Step 3: Implement** the legacy content helpers; rename the old sidebar entry to About page information, hide its key for new publishing, and show a normal text area when editing legacy rows.
- [ ] **Step 4: Add** a Publish content entry and `FacultyPublishingEditor` with type select, title, description, draft/published control, event/research conditional fields, destination preview, image thumbnails, remove control, and save. Reuse the browser Supabase client and storage bucket; retain the draft on any error and show Supabase's message. Lock type during edit.
- [ ] **Step 5: Run** focused and full Node tests, `npx tsc --noEmit`, and `git diff --check`. Manually inspect that upload failure leaves the editor open and an existing About record can be saved without exposing JSON.
- [ ] **Step 6: Commit** the admin form and compatibility changes.

### Task 3: Public placement and end-to-end verification

**Files:** Modify `src/app/page.tsx`, `src/app/[slug]/page.tsx`, `src/app/[slug]/[itemSlug]/page.tsx`, and `src/app/news-events/[category]/page.tsx` only as needed for visible images, ordering, and links; modify `src/app/globals.css` for card images if needed.

**Interfaces:** Public pages read the existing published rows from `getPublicRows`; no extra copy of a published item is created. Use `image_path` as cover and `image_paths` on detail pages.

- [ ] **Step 1: Write a failing focused test** for any extracted public ordering/link helper needed by the home page, especially selecting the next upcoming published event. If rendering stays in existing components, document the manual scenario instead of a test that mirrors markup.
- [ ] **Step 2: Run** the focused test and confirm the intended failure, if one was added.
- [ ] **Step 3: Make** home cards and destination listing/detail views show the selected item and images; preserve publication filtering already in `getPublicRows`.
- [ ] **Step 4: Run** `node --experimental-strip-types --test tests/*.test.ts`, `npx tsc --noEmit`, `npm run build`, and `git diff --check`. Manually verify drafts are absent; one published item of each type appears on home and destination; images open; mission and vision still render.
- [ ] **Step 5: Commit** public rendering changes and report any Supabase migration still required in the connected project.
