import { NextRequest, NextResponse } from "next/server";
import { createAdminLookupClient } from "@/lib/supabase/admin";
import { departmentPortalPath } from "@/lib/department-admin-portal";
import { invitationConfigurationMessage, invitationSiteOrigin } from "@/lib/site-url";

const hasValidDepartmentAdminPassword = (value: string) => value.length >= 8 && value.length <= 256 && /[^A-Za-z0-9]/.test(value);

async function requireSuperAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const admin = createAdminLookupClient();
  if (!admin) return { admin: null, error: "Server administrator access is not configured. Add SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY to the server environment, then restart the server." };
  if (!token) return { admin: null, error: "Your administrator session has expired. Sign out, sign in again, and retry." };

  const { data: auth, error: authError } = await admin.auth.getUser(token);
  if (authError || !auth.user) return { admin: null, error: "Your administrator session could not be verified. Sign out, sign in again, and retry." };
  const { data: profile } = await admin
    .from("admin_profiles")
    .select("role")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  // `editor` and `admin` were legacy faculty-wide administrator roles.
  if (!["super_admin", "administrator", "editor", "admin"].includes(profile?.role)) {
    return { admin: null, error: "Only a Faculty super administrator can manage department accounts. Apply the department-administrators migration and ensure your profile role is administrator, editor, or super_admin." };
  }
  return { admin, error: null };
}

export async function GET(request: NextRequest) {
  const access = await requireSuperAdmin(request);
  if (!access.admin) return NextResponse.json({ error: access.error }, { status: 403 });
  const admin = access.admin;

  const { data, error } = await admin
    .from("admin_profiles")
    .select("user_id,display_name,email,role,department_id,permissions,is_active,created_at,last_login")
    .in("role", ["department_admin"])
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: `Unable to load administrators: ${error.message}` }, { status: 500 });
  const departmentIds = [...new Set((data ?? []).map((profile) => profile.department_id).filter(Boolean))];
  const { data: departments } = departmentIds.length
    ? await admin.from("departments").select("id,name,slug").in("id", departmentIds)
    : { data: [] };
  const departmentsById = new Map((departments ?? []).map((department) => [department.id, department]));
  const { data: passwordRequests, error: passwordRequestsError } = await admin
    .from("department_admin_password_requests")
    .select("id,user_id,requested_at")
    .eq("status", "pending")
    .order("requested_at", { ascending: false });
  if (passwordRequestsError) return NextResponse.json({ error: "Apply the latest password-request database migration before managing department administrators." }, { status: 500 });
  const administrators = (data ?? []).map((profile) => ({ ...profile, department: profile.department_id ? departmentsById.get(profile.department_id) ?? null : null }));
  return NextResponse.json({ administrators, passwordRequests: (passwordRequests ?? []).map((request) => ({ ...request, administrator: administrators.find((profile) => profile.user_id === request.user_id) ?? null })) });
}

export async function POST(request: NextRequest) {
  const access = await requireSuperAdmin(request);
  if (!access.admin) return NextResponse.json({ error: access.error }, { status: 403 });
  const admin = access.admin;

  const body = await request.json().catch(() => null);
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";
  const username = typeof body?.username === "string" ? body.username.trim().toLowerCase() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const departmentId = typeof body?.departmentId === "string" ? body.departmentId : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!displayName || !/^[a-z0-9._-]{3,64}$/.test(username) || !/^\S+@\S+\.\S+$/.test(email) || !departmentId || !hasValidDepartmentAdminPassword(password)) {
    return NextResponse.json({ error: "Name, login name, email, department, and a password of at least 8 characters including a special character are required." }, { status: 400 });
  }

  const { data: department, error: departmentError } = await admin
    .from("departments")
    .select("id,slug")
    .eq("id", departmentId)
    .eq("is_active", true)
    .maybeSingle();
  if (departmentError || !department) return NextResponse.json({ error: "Select an active department for this administrator." }, { status: 400 });

  const origin = invitationSiteOrigin(process.env, request.nextUrl.origin);
  if (!origin) return NextResponse.json({ error: invitationConfigurationMessage() }, { status: 503 });
  const { data: account, error: accountError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin.replace(/\/$/, "")}${departmentPortalPath(department.slug)}`,
    data: { display_name: displayName, username },
  });
  if (accountError || !account.user) return NextResponse.json({ error: accountError?.message || "The invitation could not be sent. The email may already be registered." }, { status: 400 });
  const { error: passwordError } = await admin.auth.admin.updateUserById(account.user.id, { password, email_confirm: true });
  if (passwordError) {
    await admin.auth.admin.deleteUser(account.user.id);
    return NextResponse.json({ error: `The invitation account could not be secured: ${passwordError.message}` }, { status: 500 });
  }

  const { data: profile, error: profileError } = await admin.from("admin_profiles").upsert({
    user_id: account.user.id,
    display_name: displayName,
    username,
    email,
    role: "department_admin",
    department_id: departmentId,
    permissions: ["department_content"],
    is_active: true,
  }, { onConflict: "user_id" }).select("user_id,role,email").single();
  if (profileError || !profile || profile.role !== "department_admin") {
    await admin.auth.admin.deleteUser(account.user.id);
    return NextResponse.json({ error: `The administrator profile could not be created. Apply the latest database migrations first. ${profileError?.message || "Profile verification failed."}` }, { status: 500 });
  }
  return NextResponse.json({ ok: true, invited: true });
}

export async function DELETE(request: NextRequest) {
  const access = await requireSuperAdmin(request);
  if (!access.admin) return NextResponse.json({ error: access.error }, { status: 403 });
  const admin = access.admin;
  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId : "";
  if (!userId) return NextResponse.json({ error: "Administrator account is required." }, { status: 400 });
  const { data: profile } = await admin.from("admin_profiles").select("role").eq("user_id", userId).maybeSingle();
  if (profile?.role !== "department_admin") return NextResponse.json({ error: "Only department administrator accounts can be deleted here." }, { status: 400 });
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: `Unable to delete the administrator account: ${error.message}` }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: NextRequest) {
  const access = await requireSuperAdmin(request);
  if (!access.admin) return NextResponse.json({ error: access.error }, { status: 403 });
  const admin = access.admin;
  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId : "";
  const action = body?.action === "set_password" ? "set_password" : body?.action === "resend_invitation" ? "resend_invitation" : "reset_password";
  if (!userId) return NextResponse.json({ error: "Administrator account is required." }, { status: 400 });
  const { data: profile } = await admin.from("admin_profiles").select("email,role,department_id").eq("user_id", userId).maybeSingle();
  if (profile?.role !== "department_admin" || !profile.email) return NextResponse.json({ error: "Administrator account was not found." }, { status: 404 });
  if (action === "set_password") {
    const password = typeof body?.password === "string" ? body.password : "";
    if (!hasValidDepartmentAdminPassword(password)) return NextResponse.json({ error: "Use at least 8 characters including at least one special character." }, { status: 400 });
    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) return NextResponse.json({ error: `Unable to set the new password: ${error.message}` }, { status: 500 });
    if (typeof body?.requestId === "string") await admin.from("department_admin_password_requests").update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: (await admin.auth.getUser(request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""))).data.user?.id ?? null }).eq("id", body.requestId).eq("user_id", userId);
    return NextResponse.json({ ok: true, passwordSet: true });
  }
  const origin = invitationSiteOrigin(process.env, request.nextUrl.origin);
  if (!origin) return NextResponse.json({ error: invitationConfigurationMessage() }, { status: 503 });
  const { data: department } = profile.department_id
    ? await admin.from("departments").select("slug").eq("id", profile.department_id).eq("is_active", true).maybeSingle()
    : { data: null };
  if (!department) return NextResponse.json({ error: "This administrator no longer has an active department portal." }, { status: 400 });
  const departmentPortal = `${origin.replace(/\/$/, "")}${departmentPortalPath(department.slug)}`;
  if (action === "resend_invitation") {
    const { error } = await admin.auth.resend({ type: "signup", email: profile.email, options: { emailRedirectTo: departmentPortal } });
    if (error) return NextResponse.json({ error: `Supabase could not resend the invitation: ${error.message}` }, { status: error.status || 500 });
    return NextResponse.json({ ok: true, resent: true });
  }
  return NextResponse.json({ error: "Department administrator passwords can only be changed by a Faculty super administrator." }, { status: 400 });
}
