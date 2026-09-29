import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminLookupClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) return null;

  // Never allow the public/publishable key to be used for privileged identity lookup.
  const isSecretKey = secretKey.startsWith("sb_secret_");
  let isLegacyServiceRoleKey = false;
  if (secretKey.startsWith("eyJ")) {
    try {
      const payload = secretKey.split(".")[1];
      isLegacyServiceRoleKey = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")).role === "service_role";
    } catch {
      isLegacyServiceRoleKey = false;
    }
  }
  if (!isSecretKey && !isLegacyServiceRoleKey) {
    console.error("Admin lookup requires a Supabase secret key (sb_secret_) or legacy service_role JWT; a publishable key cannot read the private identity table.");
    return null;
  }

  return createSupabaseClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
