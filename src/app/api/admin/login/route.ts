import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return NextResponse.json({ error: "Admin username authentication is not configured." }, { status: 503 });
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.username !== "string" || typeof body.password !== "string" || body.username.length > 64 || body.password.length > 256) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
  }
  const username = body.username.trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,64}$/.test(username) || body.password.length === 0) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  // This lookup uses the service-role key on the server only. The username mapping
  // table is not exposed to browser clients or public API roles.
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: identity, error: lookupError } = await admin
    .from("admin_login_identities")
    .select("email")
    .eq("username", username)
    .maybeSingle();
  if (lookupError || !identity?.email) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(values) {
        values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: identity.email,
    password: body.password,
  });
  if (authError || !auth.user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const { data: profile, error: profileError } = await admin
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (profileError || !profile) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
