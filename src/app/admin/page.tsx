"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminWorkspace } from "@/components/admin-workspace";
import { BackButton } from "@/components/back-button";

export default function AdminPage() {
  const router=useRouter();
  const client=useMemo(()=>createClient(),[]);
  const [displayName,setDisplayName]=useState("");
  const [ready,setReady]=useState(false);
  const [authError,setAuthError]=useState("");
  useEffect(()=>{
    if(!client){setReady(true);return;}
    client.auth.getUser().then(async({data})=>{
      if(!data.user){router.replace("/admin/login");return;}
      const {data:profile,error}=await client.from("admin_profiles").select("user_id").eq("user_id",data.user.id).maybeSingle();
      if(error){setAuthError(`Could not verify administrator access: ${error.message}`);setReady(true);return;}
      if(!profile){await client.auth.signOut();router.replace("/admin/login");return;}
      setDisplayName("ADMIN-FS");setReady(true);
    }).catch((error:unknown)=>{setAuthError(error instanceof Error?error.message:"Administrator access could not be checked.");setReady(true);});
  },[client,router]);
  async function signOut(){await client?.auth.signOut();router.replace("/admin/login");}
  if(!ready)return <section className="content-section"><div className="wrap">Checking administrator access…</div></section>;
  if(authError)return <section className="content-section"><div className="wrap"><div className="content-block"><BackButton fallbackPath="/admin/login"/><p className="section-kicker">Dashboard unavailable</p><h1 className="section-heading">Could not verify administrator access.</h1><p>{authError}</p><button className="button button-primary" onClick={()=>window.location.reload()}>Try again</button></div></div></section>;
  if(!client)return <section className="content-section"><div className="wrap"><div className="content-block"><p className="section-kicker">Setup required</p><h1 className="section-heading">Connect Supabase to open the dashboard.</h1><p>Administrator access uses Supabase Auth. Configure the project URL and public key, then apply the migrations in <code>supabase/migrations</code>.</p><Link className="text-link" href="/admin/login">Go to staff sign in</Link></div></div></section>;
  return <section className="admin-page"><div className="admin-page-heading"><div className="admin-page-heading-title"><BackButton fallbackPath="/"/><div><p className="section-kicker">Faculty of Science · Administration</p><h1>Content dashboard</h1></div></div><button className="text-link" onClick={signOut}><LogOut size={15}/> Sign out</button></div><AdminWorkspace displayName={displayName}/></section>;
}
