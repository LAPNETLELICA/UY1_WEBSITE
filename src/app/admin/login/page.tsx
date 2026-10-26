"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { login, type LoginState } from "./actions";
import { LanguageSwitcher, useTranslation } from "@/components/language-provider";

const initialState: LoginState = null;

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const { t } = useTranslation();
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const [username, setUsername] = useState("");
  const [department, setDepartment] = useState("");
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    setUsername(search.get("username")?.toLowerCase() ?? "");
    const value = search.get("department")?.toLowerCase() ?? "";
    setDepartment(/^[a-z0-9-]+$/.test(value) ? value : "");
  }, []);

  return (
    <section className="content-section" style={{ background: "var(--cream)", minHeight: "55vh" }}>
      <form className="admin-box" action={formAction}><div style={{ display: "flex", justifyContent: "flex-end" }}><LanguageSwitcher /></div>
        <img className="admin-login-seal" src="/uy1-seal-transparent.png" alt="University of Yaoundé I" />
        <p className="section-kicker">Faculty staff</p>
        <h1>Administrator sign in</h1>
        <p>{department ? `Secure access to the ${department.replace(/-/g, " ")} department workspace.` : "Secure access to faculty content management."}</p>
        {!isConfigured && <p role="alert" className="admin-notice">Administrator sign-in is not configured on this deployment. Add the public Supabase URL and anon key, then restart the application.</p>}
        {department && <input type="hidden" name="department" value={department} />}
        <label>Administrator email or username<input name="name" type="text" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} maxLength={254} required /></label>
        <p style={{ fontSize: 11, margin: "-8px 0 4px" }}>Use your administrator email to sign in directly. Username sign-in requires the server’s private Supabase credential.</p>
        <label>Password<input name="password" type="password" autoComplete="current-password" maxLength={256} required /></label>
        {state?.error && <p role="alert" className="admin-notice">{t(state.error)}</p>}
        <button className="button" style={{ width: "100%", background: "var(--purple)", color: "white", border: 0, marginTop: 8 }} disabled={pending || !isConfigured}>
          {pending ? "Signing in…" : isConfigured ? "Sign in securely" : "Supabase setup required"}
        </button>
        <p style={{ fontSize: 11, marginTop: 14 }}><Link className="text-link" href="/admin/forgot-password">Department administrator password request</Link></p>
        <p style={{ fontSize: 11, marginTop: 8 }}><Link className="text-link" href="/admin/super-forgot-password">Faculty super administrator password reset</Link></p>
        <p style={{ fontSize: 11, marginTop: 17 }}>Public visitors do not need an account. <Link className="text-link" href="/timetables">View student timetables</Link></p>
      </form>
    </section>
  );
}
