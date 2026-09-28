import { createClient } from "@supabase/supabase-js";

export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    if (!new URL(url).hostname.endsWith(".supabase.co")) return null;
  } catch {
    return null;
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
