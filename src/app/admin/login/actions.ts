'use server';

import { redirect } from "next/navigation";
import { createAdminLookupClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: "auth.signInFailed" } | null;
const genericError = "auth.signInFailed" as const;

export async function login(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const nameValue = formData.get("name");
  const passwordValue = formData.get("password");
  const departmentValue = formData.get("department");
  const name = typeof nameValue === "string" ? nameValue.trim().toLowerCase() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const expectedDepartmentSlug = typeof departmentValue === "string" ? departmentValue.trim().toLowerCase() : "";

  const emailLogin = /^\S+@\S+\.\S+$/.test(name);
  if ((!emailLogin && !/^[a-z0-9._-]{3,64}$/.test(name)) || password.length === 0 || password.length > 256) {
    console.error("STEP A FAILED: Invalid username or missing credentials.");
    return { error: genericError };
  }

  const supabase = await createClient();
  if (!supabase) {
    console.error("STEP B FAILED: Supabase server authentication is not configured.");
    return { error: genericError };
  }

  // Email sign-in does not need a service key. Once authenticated, RLS permits a
  // user to read only their own profile, which is enough to prove admin access.
  // Username sign-in still needs the private identity map and therefore the
  // server-only secret key.
  let identity: { email: string; user_id: string } | null = emailLogin ? { email: name, user_id: "" } : null;
  if (!emailLogin) {
    const lookupClient = createAdminLookupClient();
    if (!lookupClient) {
      console.error("STEP A FAILED: Username login requires SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.");
      return { error: genericError };
    }
    try {
      const profileResult = await lookupClient.from("admin_profiles").select("email,user_id").eq("username", name).maybeSingle();
      identity = profileResult.data;
      if (!identity && !profileResult.error) {
        const legacyResult = await lookupClient.from("admin_login_identities").select("email,user_id").eq("username", name).maybeSingle();
        if (!legacyResult.error) identity = legacyResult.data;
      }
      if (profileResult.error) console.error("STEP A FAILED: Administrator profile lookup failed.", profileResult.error);
    } catch (error) {
      console.error("STEP A FAILED: Username lookup in admin_login_identities threw an exception.", error);
    }
    if (!identity?.email || !identity.user_id) {
      console.error(`STEP A FAILED: No administrator identity is registered for username "${name}".`);
      return { error: genericError };
    }
  }

  let authUserId: string | null = null;
  try {
    const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
      email: identity!.email,
      password,
    });
    if (authError || !auth.user || (!emailLogin && auth.user.id !== identity!.user_id)) {
      console.error("STEP B FAILED: Supabase Auth rejected the credentials or the profile did not match.", authError);
      if (auth.user) await supabase.auth.signOut();
      return { error: genericError };
    }
    authUserId = auth.user.id;
  } catch (error) {
    console.error("STEP B FAILED: Supabase Auth threw an exception.", error);
    return { error: genericError };
  }

  if (!authUserId) return { error: genericError };

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("user_id,role,is_active,department:departments(slug,is_active)")
    .eq("user_id", authUserId)
    .maybeSingle();
  const assignedDepartment = Array.isArray(profile?.department) ? profile.department[0] : profile?.department;
  const allowedRoles = ["super_admin", "administrator", "editor", "admin", "department_admin"];
  if (profileError || !profile || !profile.is_active || !allowedRoles.includes(profile.role)) {
    console.error("STEP C FAILED: The authenticated account has no active administrator profile.", profileError);
    await supabase.auth.signOut();
    return { error: genericError };
  }
  if (expectedDepartmentSlug && (
    !/^[a-z0-9-]+$/.test(expectedDepartmentSlug) ||
    profile.role !== "department_admin" ||
    !profile.is_active ||
    assignedDepartment?.slug !== expectedDepartmentSlug ||
    !assignedDepartment.is_active
  )) {
    await supabase.auth.signOut();
    return { error: genericError };
  }

  redirect("/admin");
}
