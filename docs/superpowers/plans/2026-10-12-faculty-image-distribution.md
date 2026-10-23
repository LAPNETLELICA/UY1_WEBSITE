# Faculty Image Distribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use supplied UY1 photos as department, faculty and leadership visuals without changing department records.

**Architecture:** Import image files into `public/images/faculty/` under stable readable names. A pure TypeScript registry provides local cover and HOD-portrait fallbacks; Supabase `image_path` and `head_image_path` always win. Shared resolvers keep all public department views consistent.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS, Supabase public content.

**Spec:** `docs/superpowers/specs/2026-10-12-faculty-image-distribution-design.md`

## Global Constraints

- Preserve every department and database row, including Geology, Animal Biology and Physiology, and Plant Biology and Physiology.
- Do not change authentication, portals, invitations, administrator records, or Supabase media values.
- Database image fields override local image fallbacks.
- Use `edb7fdd738804800b060c69e59d1b6d8.png` only for Computer Science / IT.
- Use wide photos as purple-overlay backgrounds; never use portraits as backgrounds.
- Leadership cards must support portrait, name, title and long biography at desktop and mobile widths.
- Work in the existing dirty workspace; do not create commits unless the user explicitly requests them.

## Review Focus

- Current database slugs and older fallback aliases resolve the correct media.
- Dashboard-selected media overrides local media.
- Computer Science receives only its supplied IT image.
- An HOD portrait with no biography remains useful without empty copy.
- A long biography at 375px neither clips nor overlaps the portrait.

---

### Task 1: Import and catalogue UY1 visual assets

**Files:**
- Create: `public/images/faculty/` image files
- Create: `public/images/faculty/README.md`

**Interfaces:**
- Produces: documented `/images/faculty/<name>.png` URLs for Tasks 2–4.

- [ ] **Step 1: Record source image, final filename, subject, and page role**

Include every PNG in `UY1_IMAGE.zip`. Preserve pixels during import; do not crop or recompress originals.

- [ ] **Step 2: Copy every image into `public/images/faculty/`**

Use stable names such as `computer-science-it.png`, `hod-biochemistry.png`, `hod-earth-universe-science.png`, `campus-gate.png`, `chemistry-laboratory.png`, and `lecture-theatre.png`.

- [ ] **Step 3: Verify the asset catalogue**

Run: `find public/images/faculty -type f | sort`

Expected: every imported image occurs once and README maps each public file to its archive source.

- [ ] **Step 4: Review the asset-only change set**

Run: `git status --short public/images/faculty`

Expected: only the imported image catalogue and its README are listed; do not commit shared-workspace changes.

### Task 2: Add tested department-media fallbacks

**Files:**
- Create: `src/lib/department-media.ts`
- Create: `tests/department-media.test.ts`
- Modify: `package.json` only if the smallest TypeScript-compatible test command is required

**Interfaces:**
- Produces: `getDepartmentMedia(slug: string): DepartmentMedia | undefined`, `getDepartmentCover(slug: string): string | undefined`, and `resolveDepartmentCover(imagePath: string | null | undefined, slug: string, genericFallback: string): string`.
- Consumes: Task 1 public image paths.
- Consumed by: Tasks 3 and 4.

- [ ] **Step 1: Write failing registry tests**

Assert `computer-science` resolves to `/images/faculty/computer-science-it.png`; `biochemistry` resolves to `/images/faculty/hod-biochemistry.png`; and `earth-universe-sciences-geology` and legacy `earth-sciences` resolve to `/images/faculty/hod-earth-universe-science.png`. Assert unknown slugs return `undefined` and database cover media wins.

- [ ] **Step 2: Verify the test fails**

Run: `npm test -- tests/department-media.test.ts`

Expected: FAIL because the registry is absent. If no test command exists, add only the smallest compatible test setup.

- [ ] **Step 3: Implement registry and aliases**

Map every existing department slug to an appropriate local UY1 cover. Include named HOD mappings from the spec while retaining both biology-and-physiology departments and Geology. Keep `edb7fdd…` exclusive to Computer Science.

- [ ] **Step 4: Verify the test passes**

Run: `npm test -- tests/department-media.test.ts`

Expected: PASS.

- [ ] **Step 5: Review registry and test changes**

Run: `git diff --check`

Expected: no whitespace errors; do not commit shared-workspace changes.

### Task 3: Apply UY1 covers to public department and faculty pages

**Files:**
- Modify: `src/lib/content.ts`
- Modify: `src/app/[slug]/page.tsx`
- Modify: `src/app/departments/[slug]/page.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/department-media.test.ts`

**Interfaces:**
- Consumes: Task 2 `resolveDepartmentCover` and `getDepartmentCover`.
- Produces: consistent department cards, banners and readable faculty backgrounds.

- [ ] **Step 1: Extend failing tests for precedence**

Cover exactly `database image_path → local UY1 cover → existing generic fallback`.

- [ ] **Step 2: Verify the test fails**

Run: `npm test -- tests/department-media.test.ts`

Expected: FAIL because public pages do not yet consume the resolver.

- [ ] **Step 3: Integrate the shared resolver**

Use it for department index cards and detail banners, preserving dynamic Supabase data and every route.

- [ ] **Step 4: Replace only suitable faculty backgrounds**

Use imported campus, lecture-hall or laboratory landscapes where relevant. Retain purple gradients, text contrast, responsive positioning and reduced-motion behavior. Never use portraits as backgrounds.

- [ ] **Step 5: Verify test and build**

Run: `npm test -- tests/department-media.test.ts && npm run build`

Expected: PASS.

- [ ] **Step 6: Review public cover integration**

Run: `git diff --check`

Expected: no whitespace errors; do not commit shared-workspace changes.

### Task 4: Add HOD portrait fallbacks and biography space

**Files:**
- Modify: `src/app/departments/[slug]/page.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/department-media.test.ts`

**Interfaces:**
- Consumes: Task 2 registry plus `head_name`, `head_title`, `head_bio`, and `head_image_path`.
- Produces: a responsive department leadership card.

- [ ] **Step 1: Add failing leadership-resolution tests**

Assert dashboard `head_image_path` overrides mapped portrait; named HOD departments resolve to their assigned portrait when it is absent; and an unmapped department with no head name creates no card.

- [ ] **Step 2: Verify the test fails**

Run: `npm test -- tests/department-media.test.ts`

Expected: FAIL because the leadership resolution is absent.

- [ ] **Step 3: Implement fallback and render rule**

Use `head_image_path → mapped portrait` priority. Render when a dashboard head name or mapped HOD portrait exists; title and biography display only when supplied, with meaningful alt text.

- [ ] **Step 4: Make the card biography-friendly**

Use a wider text column, constrained `object-fit: cover` portrait, comfortable paragraphs, and one-column phone layout while preserving cream/purple styles.

- [ ] **Step 5: Verify and inspect responsive pages**

Run: `npm test -- tests/department-media.test.ts && npm run build`

Expected: PASS.

Inspect `/departments/computer-science`, `/departments/biochemistry`, and `/departments/earth-universe-sciences-geology` at desktop and 375px. Confirm correct IT image, correct HOD fallback, readable backgrounds and unclipped biography.

- [ ] **Step 6: Review leadership presentation**

Run: `git diff --check`

Expected: no whitespace errors; do not commit shared-workspace changes.

### Task 5: Final scope and asset verification

**Files:**
- Modify: `public/images/faculty/README.md` only if visual review changes a mapping

- [ ] **Step 1: Review changed paths and whitespace**

Run: `git diff --check`

Expected: no whitespace errors, `.env` changes, auth changes, or deletion migrations.

- [ ] **Step 2: Run full verification**

Run: `npm test && npm run build`

Expected: PASS.

- [ ] **Step 3: Confirm the final scope**

Run: `git status --short`

Expected: the image-distribution changes are identifiable without altering or committing unrelated shared-workspace work.
