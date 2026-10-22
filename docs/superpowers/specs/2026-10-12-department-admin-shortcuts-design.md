# Department administrator shortcuts and invitation destinations

## Goal

Give every department administrator a predictable portal URL derived from the
department's existing `slug`. A Supabase invitation must preserve that portal
as its destination, so the recipient activates their account and then signs in
through their department's URL.

## URLs

For a department whose slug is `<department-slug>`, its portal URL is:

`/admin-uy1-<department-slug>`

Examples:

- Mathematics (`mathematics`) → `/admin-uy1-mathematics`
- Biochemistry (`biochemistry`) → `/admin-uy1-biochemistry`

There is no editable shortcut field. Renaming a department does not change the
shortcut unless its canonical database slug changes.

`/admin` remains the Faculty super-administrator portal. It is not replaced by
department portals.

## Invitation and activation flow

1. A Faculty super administrator creates a department administrator and picks
   a department.
2. The server resolves that department's slug and passes the generated
   department portal to Supabase in the invitation `redirectTo` URL.
3. The recipient follows the secure Supabase invitation email link, verifies
   the account, and reaches the generated department portal URL.
4. The Faculty super administrator sets the default password during account
   creation and is the only role allowed to replace it later.
5. The department portal presents the login form and identifies the expected
   department. Successful authentication is allowed only for an active
   `department_admin` assigned to that department. It then opens the existing
   role-scoped dashboard.

The invitation email's security token remains a Supabase token. The generated
department URL is a destination, not a credential and never grants access on
its own. Department administrators do not set or reset their own passwords.

## CMS and resend behavior

The Department administrators screen displays the generated department portal
URL for each account, with a copy action. Creating an account, resending its
invitation, and resetting its password resolve the assigned department before
building the redirect URL. Existing accounts without a department assignment
cannot use this flow and should receive a clear server-side error.

## Security and compatibility

- The `admin_profiles.role`, `department_id`, and RLS policies remain the
  authorization authority; URL text is never trusted for permissions.
- A super administrator continues to access faculty-wide content via `/admin`.
- A department administrator who uses another department's portal gets a
  generic sign-in failure and does not receive a session.
- The route resolves only active departments and uses their stored slug; it
  does not accept arbitrary redirect destinations.
- The implementation needs no database migration because it derives the URL
  from the existing `departments.slug` and `admin_profiles.department_id`.

## Verification

Automated coverage will establish that shortcut construction is deterministic,
that only a matching active department administrator can complete a
department-scoped login, and that invitation/resend redirects use the assigned
department's activation destination. A production build/type check will run
when Node.js is available in the workspace.
