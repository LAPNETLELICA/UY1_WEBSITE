"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = null;

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <section className="content-section" style={{ background: "var(--cream)", minHeight: "55vh" }}>
      <form className="admin-box" action={formAction}>
        <p className="section-kicker">Faculty staff</p>
        <h1>Administrator sign in</h1>
        <p>Secure access to faculty content management.</p>
        <label>Name<input name="name" type="text" autoComplete="username" maxLength={64} required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" maxLength={256} required /></label>
        {state?.error && <p role="alert" className="admin-notice">{state.error}</p>}
        <button className="button" style={{ width: "100%", background: "var(--purple)", color: "white", border: 0, marginTop: 8 }} disabled={pending}>
          {pending ? "Signing in…" : "Sign in securely"}
        </button>
        <p style={{ fontSize: 11, marginTop: 17 }}>Public visitors do not need an account. <Link className="text-link" href="/timetables">View student timetables</Link></p>
      </form>
    </section>
  );
}
