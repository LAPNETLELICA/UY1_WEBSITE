import { NextRequest, NextResponse } from "next/server";
import { createAdminLookupClient } from "@/lib/supabase/admin";

const superAdminRoles = ["super_admin", "administrator", "editor", "admin"];

export async function POST(request: NextRequest) {
  const admin = createAdminLookupClient();
  if (!admin) return NextResponse.json({ error: "Password recovery is not configured." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const { data: profile, error: profileError } = await admin.from("admin_profiles").select("role").eq("email", email).maybeSingle();
  if (profileError) {
    console.error("Unable to look up super-administrator password recovery account.", profileError);
    return NextResponse.json({ error: "The password-reset service is temporarily unavailable. Please try again later." }, { status: 503 });
  }

  if (profile && superAdminRoles.includes(profile.role)) {
    const { error: resetError } = await admin.auth.resetPasswordForEmail(email, {
      // Use the actual site hosting this request. This prevents a local development
      // value from sending a production administrator to the wrong website.
      redirectTo: `${request.nextUrl.origin}/admin/super-reset`,
    });
    if (resetError) {
      console.error("Unable to send super-administrator password recovery email.", resetError);
      return NextResponse.json({ error: "The password-reset service is temporarily unavailable. Please try again later." }, { status: 503 });
    }
  }

  // Keep the response generic so this endpoint does not reveal administrator accounts.
  return NextResponse.json({ ok: true });
}
