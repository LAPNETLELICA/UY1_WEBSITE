"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotAdministratorPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setMessage("");
    await fetch("/api/admin/password-reset-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    setSaving(false);
    // Do not reveal whether an email address has an administrator account.
    setMessage("If this email belongs to a department administrator, the Faculty super administrator has been notified.");
  }

  return <section className="content-section" style={{ background: "var(--cream)", minHeight: "55vh" }}><form className="admin-box" onSubmit={submit}>
    <p className="section-kicker">Administrator access</p><h1>Reset your password</h1>
    <p>Enter the email address used for your department administrator account. The Faculty super administrator will receive your password-reset request.</p>
    <label>Email address<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
    {message && <p className="admin-notice">{message}</p>}
    <button className="button" style={{ width: "100%", background: "var(--purple)", color: "white", border: 0, marginTop: 8 }} disabled={saving}>{saving ? "Sending…" : "Request password reset"}</button>
    <p style={{ marginTop: 16 }}><Link className="text-link" href="/admin/login">Back to sign in</Link></p>
  </form></section>;
}
