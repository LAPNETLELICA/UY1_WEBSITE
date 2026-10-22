# Department Administrator Shortcuts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each department administrator an invitation and login portal at `/admin-uy1-<department-slug>`.

**Architecture:** A small route/URL helper derives the portal from the canonical department slug and validates safe return destinations. The existing root dynamic-page dispatcher will recognize the `admin-uy1-` prefix and render a reusable department login page. The protected invitation API resolves the selected administrator's department before setting its Supabase portal redirect; the Faculty super administrator supplies and retains control of the account password.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Supabase Auth and PostgreSQL.

**Spec:** `docs/superpowers/specs/2026-10-12-department-admin-shortcuts-design.md`

## Global Constraints

- Derive every portal from `departments.slug`; add no editable shortcut database field or migration.
- `/admin` remains the faculty super-administrator portal.
- The database profile role, `department_id`, and RLS remain the sole authorization authority.
- Department shortcuts are destinations, never credentials or permission grants.
- Resolve only active departments and reject arbitrary redirect destinations.

## Review Focus

- A requested root slug with the `admin-uy1-` prefix but no active matching department must return the existing not-found behavior.
- A department administrator using another department's portal must get the generic sign-in failure and no retained session.
- A faculty super administrator must retain access through `/admin` and must not become department-scoped because its profile has a stale `department_id`.
- An invitation, resend, and password recovery redirect must use the administrator's assigned department, not a client-supplied slug.
- Malformed or external activation return destinations must fall back safely to `/admin/login`.

---

### Task 1: Department portal URL helpers

**Files:**
- Create: `src/lib/department-admin-portal.ts`
- Test: `src/lib/department-admin-portal.test.ts`

**Interfaces:**
- Produces `departmentPortalPath(slug: string): string`, `activationPathForDepartment(slug: string): string`, and `safeDepartmentPortalPath(value: string | null): string | null`.
- Consumed by the route dispatcher, activation page, and administrator API.

- [ ] **Step 1: Write failing helper tests**

```ts
expect(departmentPortalPath("biochemistry")).toBe("/admin-uy1-biochemistry");
expect(activationPathForDepartment("mathematics")).toBe("/admin/activate?next=%2Fadmin-uy1-mathematics");
expect(safeDepartmentPortalPath("https://example.com")).toBeNull();
```

- [ ] **Step 2: Run the helper test to verify it fails**

Run: `npm test -- src/lib/department-admin-portal.test.ts`

Expected: FAIL because the helper module does not exist.

- [ ] **Step 3: Implement the pure helpers in `src/lib/department-admin-portal.ts`**

Generate only paths matching `/admin-uy1-<non-empty-slug>` and preserve only a valid same-site department portal in `safeDepartmentPortalPath`.

- [ ] **Step 4: Run the helper test to verify it passes**

Run: `npm test -- src/lib/department-admin-portal.test.ts`

Expected: PASS.

### Task 2: Department portal route and scoped sign-in

**Files:**
- Modify: `src/app/[slug]/page.tsx`
- Modify: `src/app/admin/login/actions.ts`
- Create: `src/components/department-admin-login.tsx`
- Test: `src/app/[slug]/department-admin-portal.test.tsx`

**Interfaces:**
- Consumes `departmentPortalPath` from Task 1.
- Produces a root-level portal page for active departments and a login action that rejects a signed-in account not assigned to the requested department.

- [ ] **Step 1: Write route and role-bound login tests**

```tsx
expect(resolveDepartmentPortal("admin-uy1-biochemistry")).toEqual({ slug: "biochemistry" });
expect(resolveDepartmentPortal("admin-uy1-unknown")).toBeNull();
expect(canUseDepartmentPortal({ role: "department_admin", departmentSlug: "mathematics" }, "biochemistry")).toBe(false);
```

- [ ] **Step 2: Run the route/login tests to verify they fail**

Run: `npm test -- src/app/[slug]/department-admin-portal.test.tsx`

Expected: FAIL because the portal resolver and department-bound authorization check do not exist.

- [ ] **Step 3: Implement the route dispatcher and reusable login form**

Make `src/app/[slug]/page.tsx` recognize `admin-uy1-<department-slug>` before the generic public-page lookup, fetch only an active department, and render the department login form with the expected slug as a hidden form value.

- [ ] **Step 4: Bind login to the expected department**

After Supabase authentication, retrieve the account profile and assigned department slug through the server-only lookup client. Allow only an active `department_admin` whose assigned department matches the expected slug; otherwise sign out and return the existing generic error. Leave `/admin/login` unchanged.

- [ ] **Step 5: Run the route/login tests to verify they pass**

Run: `npm test -- src/app/[slug]/department-admin-portal.test.tsx`

Expected: PASS.

### Task 3: Invitation, activation, and administrator screen links

**Files:**
- Modify: `src/app/api/admin/administrators/route.ts`
- Modify: `src/app/admin/activate/page.tsx`
- Modify: `src/components/department-administrators.tsx`
- Test: `src/app/api/admin/administrators/department-redirect.test.ts`

**Interfaces:**
- Consumes `activationPathForDepartment` and `departmentPortalPath` from Task 1.
- Produces server-generated Supabase invitation/resend/recovery redirects and visible copyable portal links for department administrator accounts.

- [ ] **Step 1: Write failing administrator redirect tests**

```ts
expect(invitationRedirect("https://faculty.example", "biochemistry"))
  .toBe("https://faculty.example/admin/activate?next=%2Fadmin-uy1-biochemistry");
expect(invitationRedirect("https://faculty.example", null)).toBeNull();
```

- [ ] **Step 2: Run the redirect test to verify it fails**

Run: `npm test -- src/app/api/admin/administrators/department-redirect.test.ts`

Expected: FAIL because invitation redirect construction is not yet extractable or department-aware.

- [ ] **Step 3: Resolve department slugs server-side for invitation actions**

On account creation, resolve `departmentId` to an active department before calling Supabase. On resend and recovery, query the account profile's assigned department. Use the helper-generated activation URL for invite, resend, and recovery; return a clear error if no active department is assigned.

- [ ] **Step 4: Return from activation to the validated department portal**

Read `next` from the activation page query string, validate it with `safeDepartmentPortalPath`, and after a successful password update/sign-out route there; otherwise route to `/admin/login`.

- [ ] **Step 5: Show the generated portal link in Department administrators**

Return department slugs with the administrators API response. Render the derived link with a copy action, without storing the URL in the database.

- [ ] **Step 6: Run the redirect test to verify it passes**

Run: `npm test -- src/app/api/admin/administrators/department-redirect.test.ts`

Expected: PASS.

### Task 4: Full verification and deployment guidance

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes the completed department shortcut flow.
- Produces setup guidance for Supabase Auth redirect allow-lists and manual acceptance steps.

- [ ] **Step 1: Document the pre-deployment acceptance checklist**

Include account creation, invitation, activation, correct-portal login, wrong-portal rejection, and super-admin `/admin` scenarios.

- [ ] **Step 2: Document Supabase redirect allow-list requirements**

State that the production domain's `/admin/activate` route and query-string variations must be accepted by Supabase Auth before sending invitations.

- [ ] **Step 3: Run focused tests and a production build**

Run: `npm test` and `npm run build`.

Expected: PASS. If Node.js remains unavailable, record that the environment prevented execution and provide the exact commands for the deployment environment.
