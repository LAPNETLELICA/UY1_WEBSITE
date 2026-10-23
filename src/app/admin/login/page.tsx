"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { login, type LoginState } from "./actions";
import { LanguageSwitcher, useTranslation } from "@/components/language-provider";

const initialState: LoginState = null;

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const { t } = useTranslation();
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
        <p className="section-kicker">Faculty staff</p>
        <h1>Administrator sign in</h1>
        <p>{department ? `Secure access to the ${department.replace(/-/g, " ")} department workspace.` : "Secure access to faculty content management."}</p>
        {department && <input type="hidden" name="department" value={department} />}
        <label>Username or email<input name="name" type="text" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} maxLength={254} required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" maxLength={256} required /></label>
        {state?.error && <p role="alert" className="admin-notice">{t(state.error)}</p>}
        <button className="button" style={{ width: "100%", background: "var(--purple)", color: "white", border: 0, marginTop: 8 }} disabled={pending}>
          {pending ? "Signing in…" : "Sign in securely"}
        </button>
        <p style={{ fontSize: 11, marginTop: 14 }}><Link className="text-link" href="/admin/forgot-password">Department administrator password request</Link></p>
        <p style={{ fontSize: 11, marginTop: 8 }}><Link className="text-link" href="/admin/super-forgot-password">Faculty super administrator password reset</Link></p>
        <p style={{ fontSize: 11, marginTop: 17 }}>Public visitors do not need an account. <Link className="text-link" href="/timetables">View student timetables</Link></p>
      </form>
    </section>
  );
}
