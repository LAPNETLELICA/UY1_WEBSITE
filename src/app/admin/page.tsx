"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowUpRight, CalendarDays, FileText, GraduationCap, LogOut, Newspaper } from "lucide-react";

export default function AdminPage() {
  const router = useRouter(); const client = createClient();
  const [email, setEmail] = useState(""); const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!client) { setReady(true); return; }
    client.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/admin/login"); return; }
      const { data: profile } = await client.from("admin_profiles").select("user_id").eq("user_id", data.user.id).maybeSingle();
      if (!profile) { await client.auth.signOut(); router.replace("/admin/login"); return; }
      setEmail(data.user.email ?? ""); setReady(true);
    });
  }, [client, router]);
  async function signOut() { await client?.auth.signOut(); router.replace("/admin/login"); }
  if (!ready) return <section className="content-section"><div className="wrap">Checking administrator access…</div></section>;
  if (!client) return <section className="content-section"><div className="wrap"><div className="content-block"><p className="section-kicker">Setup required</p><h1 className="section-heading">Connect Supabase to open the dashboard.</h1><p>Administrator access uses Supabase Auth; content administration is unavailable until project credentials and database policies are configured.</p><Link className="text-link" href="/admin/login">Go to staff sign in <ArrowUpRight size={15}/></Link></div></div></section>;
  return <section className="content-section" style={{background:"var(--cream)",minHeight:"60vh"}}><div className="wrap"><div className="section-head-row"><div><p className="section-kicker">Content management</p><h1 className="section-heading">Welcome to the dashboard.</h1><p className="section-lead">Signed in as {email}. Manage public faculty information securely from Supabase.</p></div><button className="text-link" onClick={signOut}><LogOut size={15}/> Sign out</button></div><div className="simple-list">{[["Departments", "/departments", GraduationCap],["Timetables", "/timetables", CalendarDays],["News & events", "/news", Newspaper],["Documents", "/documents", FileText]].map(([label,href,Icon])=>{const IconComponent=Icon as typeof GraduationCap;return <article key={label as string}><IconComponent color="var(--purple)"/><h3>{label as string}</h3><p>Content editing interface is being connected to the faculty's approved Supabase workflow.</p><Link className="text-link" href={href as string}>View public section <ArrowUpRight size={14}/></Link></article>})}</div><p className="admin-notice" style={{marginTop:24}}>Secure sign-in is enabled. Full content CRUD requires the Supabase schema and Storage policies in supabase/migrations to be applied. Never add a service-role key to the browser.</p></div></section>;
}
