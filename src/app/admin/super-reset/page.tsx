"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const superAdminRoles = ["super_admin", "administrator", "editor", "admin"];

export default function SuperAdministratorResetPage() {
  const router = useRouter();
  const client = useMemo(() => createClient(), []);
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!client) return;
    let mounted = true;
    async function establishRecoverySession() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await client!.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        window.history.replaceState({}, document.title, window.location.pathname);
        if (error) { if (mounted) setMessage("This password-reset link is invalid or has expired. Request a new link."); return; }
      }
      const { data } = await client!.auth.getUser();
      if (!data.user) { if (mounted) setReady(true); return; }
      const { data: profile } = await client!.from("admin_profiles").select("role,is_active").eq("user_id", data.user.id).maybeSingle();
      if (mounted) { setAllowed(!!profile?.is_active && superAdminRoles.includes(profile.role)); setReady(true); }
    }
    void establishRecoverySession();
    return () => { mounted = false; };
  }, [client]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 12) { setMessage("Use a password of at least 12 characters."); return; }
    if (password !== confirmPassword) { setMessage("The passwords do not match."); return; }
    if (!client || !allowed) { setMessage("This password-reset link cannot be used for this account."); return; }
    setSaving(true); setMessage("");
    const { error } = await client.auth.updateUser({ password });
    setSaving(false);
    if (error) { setMessage("Unable to update the password. Request a new reset link and try again."); return; }
    await client.auth.signOut();
    router.replace("/admin/login");
  }

  if (!ready) return <section className="content-section"><div className="wrap">Verifying password-reset link…</div></section>;
  if (!allowed) return <section className="content-section"><div className="wrap"><div className="admin-box"><p className="section-kicker">Password reset unavailable</p><h1>Use a Faculty super-administrator account.</h1><p>{message || "This recovery link is invalid, expired, or does not belong to a Faculty super administrator."}</p><Link className="text-link" href="/admin/super-forgot-password">Request another link</Link></div></div></section>;
  return <section className="content-section" style={{ background: "var(--cream)", minHeight: "55vh" }}><form className="admin-box" onSubmit={submit}><p className="section-kicker">Faculty super administrator</p><h1>Choose a new password</h1><label>New password<input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={event => setPassword(event.target.value)} /></label><label>Confirm password<input type="password" autoComplete="new-password" minLength={12} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /></label>{message && <p className="admin-notice">{message}</p>}<button className="button" style={{ width: "100%", background: "var(--purple)", color: "white", border: 0, marginTop: 8 }} disabled={saving}>{saving ? "Saving…" : "Save new password"}</button></form></section>;
}
