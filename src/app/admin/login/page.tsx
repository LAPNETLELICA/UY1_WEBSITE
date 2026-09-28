"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const client = createClient();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!client) { setError("Supabase is not configured. Add the public project URL and anon key to the environment before signing in."); return; }
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const { error: authError } = await client.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    setLoading(false);
    if (authError) { setError("Sign-in failed. Check your credentials or contact the faculty administrator."); return; }
    window.location.href = "/admin";
  }
  return <section className="content-section" style={{background:"var(--cream)",minHeight:"55vh"}}><form className="admin-box" onSubmit={submit}><p className="section-kicker">Faculty staff</p><h1>Administrator sign in</h1><p>Secure access to faculty content management.</p><label>Email address<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label>{error && <p role="alert" className="admin-notice">{error}</p>}<button className="button" style={{width:"100%",background:"var(--purple)",color:"white",border:0,marginTop:8}} disabled={loading}>{loading ? "Signing in…" : "Sign in securely"}</button><p style={{fontSize:11,marginTop:17}}>Public visitors do not need an account. <Link className="text-link" href="/timetables">View student timetables</Link></p></form></section>;
}
