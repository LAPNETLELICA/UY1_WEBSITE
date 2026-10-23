# Page Section Description Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let administrators edit page-section descriptions as ordinary text without seeing or typing JSON.

**Architecture:** Keep the existing `page_content_blocks.content` JSONB column, but provide a small model adapter between it and the generic Page sections editor. The adapter reads the existing description/body/text forms and merges a changed description without deleting richer cards, statistics or image metadata.

**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase JS, `node:test`.

**Spec:** `docs/superpowers/specs/2026-10-23-services-administration-editor-design.md`

## Global Constraints

- Only the Page sections `content` field becomes prose; do not misrepresent arbitrary General Settings JSON as plain text.
- Preserve every unrelated `content` property and do not introduce a migration.
- Keep the editor admin-only and preserve already-uncommitted workspace changes; patch-stage only this task's hunks.

## Review Focus

- Legacy content with `body` or `text` must display readable prose (Task 1 legacy test).
- Existing `items`, `stats`, `eyebrow` and `image_alt` must survive edits (Task 1 preservation test).
- Null, primitive or array legacy JSON must not crash the editor (Task 1 malformed-input test).
- A blank description must serialize to an intentional empty string, not a JSON parse error (Task 1 empty-text test).
- Switching from Page sections to another module must not leak the previous section's description (Task 1 manual editor-transition check).

---

### Task 1: Replace raw page-section JSON editing with prose

**Files:**
- Create: `src/lib/page-block-description.ts`
- Create: `tests/page-block-description.test.ts`
- Modify: `src/components/admin-workspace.tsx` (Page sections field label, create/edit draft setup and save serialization)

**Interfaces:**
- `readPageBlockDescription(content: unknown): string` returns `description`, then `body`, then `text` when that value is a string, otherwise `''`.
- `withPageBlockDescription(previous: unknown, description: string): Record<string, unknown>` preserves object properties and sets `description` to the new text, including `''`.

- [ ] **Step 1: Write failing tests** for the two interfaces using literal legacy, malformed and rich-content fixtures; list the draft-transition scenario for the manual editor check in Step 5.
- [ ] **Step 2: Run** `node --experimental-strip-types tests/page-block-description.test.ts`; confirm the expected failure.
- [ ] **Step 3: Implement** the two model functions and wire Page sections create/edit/save to them. Change the visible label to “Description”; do not show serialized JSON in its textarea. Leave General Settings' JSON validation untouched.
- [ ] **Step 4: Run** the focused test and `node --experimental-strip-types --test tests/*.test.ts`; confirm passing results.
- [ ] **Step 5: Manually edit** an existing block with `items`/`stats`, refresh the public page, and confirm the description changes while those extra fields remain; verify a newly created block and module switching.
- [ ] **Step 6: Run** `node node_modules/typescript/bin/tsc --noEmit --incremental false` and `git diff --check`, report unrelated existing errors, then commit only this task's new files and patch-staged `admin-workspace.tsx` hunks.
