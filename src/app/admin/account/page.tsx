"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdministratorAccountPage() {
  const client = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 12) { setMessage("Use at least 12 characters."); return; }
    if (password !== confirm) { setMessage("The passwords do not match."); return; }
    if (!client) { setMessage("Supabase is not configured."); return; }
    const { error } = await client.auth.updateUser({ password });
    setMessage(error ? "Password could not be changed. Sign in again and retry." : "Password changed successfully.");
    if (!error) { setPassword(""); setConfirm(""); }
  }

  return <section className="content-section" style={{ background: "var(--cream)", minHeight: "55vh" }}><form className="admin-box" onSubmit={submit}><p className="section-kicker">Administrator account</p><h1>Change password</h1><p>Use a private password of at least 12 characters.</p><label>New password<input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={event => setPassword(event.target.value)} /></label><label>Confirm password<input type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={event => setConfirm(event.target.value)} /></label>{message && <p className="admin-notice">{message}</p>}<button className="button" style={{ width: "100%", background: "var(--purple)", color: "white", border: 0, marginTop: 8 }}>Change password</button><p style={{ marginTop: 16 }}><Link className="text-link" href="/admin">Back to dashboard</Link></p></form></section>;
}
