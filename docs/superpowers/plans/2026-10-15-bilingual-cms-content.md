# Bilingual CMS Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store English and French versions of editable public content and automatically generate the second version when an administrator saves content.

**Architecture:** A JSONB `translations` column retains language versions without changing existing English/default columns. The dashboard invokes an authenticated Supabase Edge Function that detects source language and uses OpenAI to generate all selected visitor-facing fields in the opposite language. Client-side localized content components choose the active locale at render time.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase Postgres/Auth/Edge Functions, OpenAI Responses API.

**Spec:** `docs/superpowers/specs/2026-10-15-bilingual-cms-content-design.md`

## Global Constraints

- English columns remain compatible defaults; French content is stored at `translations.fr`.
- Translation requests are made only server-side using the `OPENAI_API_KEY` Supabase Edge Function secret.
- Never translate IDs, slugs, URLs, email addresses, telephone numbers, files, image paths, dates, or select values.
- A translation failure must not publish or overwrite a record.
- Existing records with no French translation must fall back to English.
- Do not commit or deploy without explicit user approval.

## Review Focus

- A French edit must preserve the pre-existing English content if the translator fails.
- JSON page-block content must preserve non-text values and translate all nested visitor-facing strings.
- A new French translation must be visible immediately after the visitor switches to French.
- Repeated saves must replace only the affected locale and fields, not erase other translations.
- An unauthorized request to the Edge Function must be rejected before it reaches OpenAI.

---

### Task 1: Translation data and locale selection utilities

**Files:**
- Create: `supabase/migrations/202610150001_bilingual_cms_content.sql`
- Create: `src/lib/localized-content.ts`
- Test: `tests/localized-content.test.ts`

**Interfaces:**
- Produces `getLocalizedField(row, field, locale): string` and `getLocalizedObject(value, locale): unknown`.
- Consumed by public content components and the dashboard save adapter.

- [ ] **Step 1: Write failing tests for French selection, English fallback, and nested JSON preservation**

```ts
assert.equal(getLocalizedField({ title: "Science", translations: { fr: { title: "Sciences" } } }, "title", "fr"), "Sciences");
assert.equal(getLocalizedField({ title: "Science", translations: {} }, "title", "fr"), "Science");
```

- [ ] **Step 2: Run the focused test and verify it fails because the utility is missing**

Run: `npm test -- tests/localized-content.test.ts`
Expected: FAIL because `localized-content` does not exist.

- [ ] **Step 3: Add the migration and localization utility**

Add `translations jsonb not null default '{}'::jsonb` to every public text-content table specified in the design. Implement the utility without mutating the row or the source JSON.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npm test -- tests/localized-content.test.ts`
Expected: PASS.

### Task 2: Secure automatic translation Edge Function

**Files:**
- Create: `supabase/functions/translate-content/index.ts`
- Create: `supabase/functions/translate-content/deno.json`
- Test: `tests/translation-request.test.ts`

**Interfaces:**
- Consumes `{ table: string; sourceLocale: "en" | "fr"; fields: Record<string, unknown> }` plus authenticated Supabase JWT.
- Produces `{ sourceLocale: "en" | "fr"; targetLocale: "en" | "fr"; translatedFields: Record<string, unknown> }`.
- Consumed by `translateForSave` in the admin workspace.

- [ ] **Step 1: Write failing request validation tests**

```ts
assert.throws(() => validateTranslationRequest({ table: "departments", sourceLocale: "fr", fields: { slug: "biology" } }), /not translatable/);
assert.throws(() => validateTranslationRequest({ table: "unknown", sourceLocale: "en", fields: {} }), /unsupported/);
```

- [ ] **Step 2: Run the focused test and verify it fails because validation is missing**

Run: `npm test -- tests/translation-request.test.ts`
Expected: FAIL because the function validation module does not exist.

- [ ] **Step 3: Implement authenticated allowlisted translation**

Verify the caller is an active faculty or department administrator, reject unsupported tables/fields, preserve non-text values, call OpenAI with a strict JSON response schema, and return only allowed translated fields. Read `OPENAI_API_KEY` with `Deno.env.get`; never log request content or credentials.

- [ ] **Step 4: Run focused tests and deploy-function lint/type validation**

Run: `npm test -- tests/translation-request.test.ts`
Expected: PASS.

### Task 3: Dashboard translation-on-save workflow

**Files:**
- Modify: `src/components/admin-workspace.tsx`
- Create: `src/lib/admin-translations.ts`
- Test: `tests/admin-translations.test.ts`

**Interfaces:**
- Consumes a module table, its draft, and the current record.
- Produces an insert/update payload with canonical English columns and `translations.fr`.
- Uses `supabase.functions.invoke("translate-content", …)`.

- [ ] **Step 1: Write failing tests for French-origin saves and failure preservation**

```ts
assert.deepEqual(buildBilingualPayload(existingEnglish, "fr", translatedEnglish), expectedPayload);
assert.equal(buildBilingualPayload(existingEnglish, "fr", null), null);
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- tests/admin-translations.test.ts`
Expected: FAIL because the payload adapter is missing.

- [ ] **Step 3: Implement language detection, translation preview, and atomic save gating**

Add source-language selection/detection and translated-field review to public-content editors. Invoke the Edge Function before database writes; on an error, display an actionable notice and leave the record unchanged. Keep administrative-only fields untouched.

- [ ] **Step 4: Run focused tests and the full test suite**

Run: `npm test -- tests/admin-translations.test.ts && npm test`
Expected: PASS.

### Task 4: Locale-aware public rendering

**Files:**
- Create: `src/components/localized-text.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/[slug]/page.tsx`
- Modify: `src/app/[slug]/[itemSlug]/page.tsx`
- Modify: `src/app/departments/[slug]/page.tsx`
- Modify: `src/app/departments/[slug]/[section]/page.tsx`
- Modify: `src/app/departments/[slug]/[section]/[itemSlug]/page.tsx`
- Modify: `src/app/services/page.tsx`
- Modify: `src/components/public-page-blocks.tsx`
- Test: `tests/localized-text.test.tsx`

**Interfaces:**
- Consumes `value`, `translations`, `field`, and optional fallback.
- Produces a `data-no-translate` locale-reactive text node.

- [ ] **Step 1: Write failing component tests for EN/FR switching and fallback**

```tsx
render(<LocalizedText value="Science" translations={{ fr: { title: "Sciences" } }} field="title" />);
expect(screen.getByText("Sciences")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- tests/localized-text.test.tsx`
Expected: FAIL because `LocalizedText` does not exist.

- [ ] **Step 3: Implement the shared component and replace public CMS text output**

Use the shared component for card titles/descriptions, details, department text, programme text, research, news/events, services, gallery/document labels, page-block content, contact labels, and metadata-safe fallbacks. Mark it `data-no-translate` so the current static-string translator cannot overwrite selected CMS text.

- [ ] **Step 4: Run component tests and production build**

Run: `npm test -- tests/localized-text.test.tsx && npm run build`
Expected: PASS and a successful Next.js build.

### Task 5: Deployment guidance and end-to-end verification

**Files:**
- Create: `docs/superpowers/runbooks/bilingual-content-setup.md`
- Modify: `README.md`

**Interfaces:**
- Consumes the deployed migration, Edge Function, and `OPENAI_API_KEY` secret.
- Produces administrator setup and recovery instructions.

- [ ] **Step 1: Document setup and recovery procedures**

Document migration application, `supabase secrets set OPENAI_API_KEY=…`, Edge Function deployment, test save, rollback, and how to correct a generated translation in the dashboard.

- [ ] **Step 2: Manually verify essential flows**

Create one French department update and one English news update. Confirm both pages switch fully between languages, a missing translation falls back to English, and an invalid/removed secret prevents writes.

- [ ] **Step 3: Run final checks**

Run: `npm test && npm run build && git diff --check`
Expected: all checks pass with no whitespace errors.
