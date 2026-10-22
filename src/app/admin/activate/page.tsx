"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeDepartmentPortalPath } from "@/lib/department-admin-portal";

export default function ActivateAdministratorPage() {
  const router = useRouter();
  const client = useMemo(() => createClient(), []);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [returnPath, setReturnPath] = useState("/admin/login");

  useEffect(() => {
    const nextPath = safeDepartmentPortalPath(new URLSearchParams(window.location.search).get("next")) ?? "/admin/login";
    setReturnPath(nextPath);
    if (!client) return;
    let mounted = true;
    async function establishInvitationSession() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await client!.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        window.history.replaceState({}, document.title, window.location.pathname);
        if (!mounted) return;
        if (error) { setMessage("This invitation link is invalid or has expired. Ask the Faculty super administrator to resend it."); return; }
      }
      const { data } = await client!.auth.getUser();
      if (!data.user) { if (mounted) setReady(false); return; }
      await client!.auth.signOut();
      if (mounted) router.replace(nextPath);
    }
    void establishInvitationSession();
    return () => { mounted = false; };
  }, [client]);

  if (!ready) return <section className="content-section"><div className="wrap"><div className="admin-box"><p className="section-kicker">Account verification</p><h1>Verifying your invitation</h1><p>Your Faculty super administrator has set your login password. Use the secure invitation link to continue to your department portal.</p>{message&&<p className="admin-notice">{message}</p>}<Link className="text-link" href="/admin/login">Back to sign in</Link></div></div></section>;
  return <section className="content-section"><div className="wrap"><div className="admin-box"><p className="section-kicker">Account verification</p><h1>Invitation verified</h1><p>Continue to sign in with the password set by your Faculty super administrator.</p><Link className="button button-primary" href={returnPath}>Continue to department portal</Link></div></div></section>;
}
