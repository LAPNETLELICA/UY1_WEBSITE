"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function SuperAdministratorForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setMessage("");
    const response = await fetch("/api/admin/super-password-reset-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const result = await response.json().catch(() => null);
    setSaving(false);
    setMessage(response.ok ? "If this email belongs to a Faculty super administrator, a password-reset link has been sent." : result?.error || "Unable to send the password-reset email. Please try again later.");
  }

  return <section className="content-section" style={{ background: "var(--cream)", minHeight: "55vh" }}><form className="admin-box" onSubmit={submit}>
    <p className="section-kicker">Faculty super administrator</p><h1>Reset your password</h1>
    <p>Enter the email address for your Faculty super-administrator account.</p>
    <label>Email address<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
    {message && <p className="admin-notice">{message}</p>}
    <button className="button" style={{ width: "100%", background: "var(--purple)", color: "white", border: 0, marginTop: 8 }} disabled={saving}>{saving ? "Sending…" : "Send password-reset link"}</button>
    <p style={{ marginTop: 16 }}><Link className="text-link" href="/admin/login">Back to sign in</Link></p>
  </form></section>;
}
