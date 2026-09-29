'use server';

import { redirect } from "next/navigation";
import { createAdminLookupClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string } | null;
const genericError = "Sign-in failed. Check your name and password or contact the faculty administrator.";

export async function login(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const nameValue = formData.get("name");
  const passwordValue = formData.get("password");
  const name = typeof nameValue === "string" ? nameValue.trim().toLowerCase() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!/^[a-z0-9._-]{3,64}$/.test(name) || password.length === 0 || password.length > 256) {
    console.error("STEP A FAILED: Invalid username or missing credentials.");
    return { error: genericError };
  }

  const lookupClient = createAdminLookupClient();
  if (!lookupClient) {
    console.error("STEP A FAILED: Supabase admin lookup is not configured (check the project URL and server-only SUPABASE_SECRET_KEY / SUPABASE_SERVICE_ROLE_KEY).");
    return { error: genericError };
  }

  let identity: { email: string; user_id: string } | null = null;
  try {
    const result = await lookupClient
      .from("admin_login_identities")
      .select("email,user_id")
      .eq("username", name)
      .maybeSingle();
    identity = result.data;
    if (result.error) {
      console.error("STEP A FAILED: Username lookup in admin_login_identities failed.", result.error);
      return { error: genericError };
    }
  } catch (error) {
    console.error("STEP A FAILED: Username lookup in admin_login_identities threw an exception.", error);
    return { error: genericError };
  }

  if (!identity?.email || !identity.user_id) {
    console.error(`STEP A FAILED: No admin_login_identities row is registered for username "${name}".`);
    return { error: genericError };
  }

  const { data: profile, error: profileError } = await lookupClient
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", identity.user_id)
    .maybeSingle();
  if (profileError || !profile) {
    console.error("STEP A FAILED: The mapped account has no matching admin_profiles row.", profileError);
    return { error: genericError };
  }

  const supabase = await createClient();
  if (!supabase) {
    console.error("STEP B FAILED: Supabase server authentication is not configured.");
    return { error: genericError };
  }

  let authUserId: string | null = null;
  try {
    const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
      email: identity.email,
      password,
    });
    if (authError || !auth.user || auth.user.id !== identity.user_id) {
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

  redirect("/admin/dashboard");
}
