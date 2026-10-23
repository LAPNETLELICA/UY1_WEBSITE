import { NextRequest, NextResponse } from "next/server";
import { createAdminLookupClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const admin = createAdminLookupClient();
  if (!admin) return NextResponse.json({ error: "Password recovery is not configured." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const { data: profile } = await admin.from("admin_profiles").select("user_id,role").eq("email", email).maybeSingle();
  if (profile?.role === "department_admin") {
    const { data: pending } = await admin.from("department_admin_password_requests").select("id").eq("user_id", profile.user_id).eq("status", "pending").maybeSingle();
    if (!pending) await admin.from("department_admin_password_requests").insert({ user_id: profile.user_id });
  }

  // Always use the same response to prevent account enumeration.
  return NextResponse.json({ ok: true });
}
