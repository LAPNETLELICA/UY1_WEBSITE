"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BackButton } from "@/components/back-button";
import { DepartmentAdministrators } from "@/components/department-administrators";
import { createClient } from "@/lib/supabase/client";

export default function DepartmentAdministratorsPage() {
  const client = useMemo(() => createClient(), []);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!client) return;
    client.from("departments").select("id,name").eq("is_active", true).order("name").then(({ data }) => setDepartments(data ?? []));
  }, [client]);

  return <section className="admin-page"><div className="admin-page-heading"><div className="admin-page-heading-title"><BackButton fallbackPath="/admin"/><div><p className="section-kicker">Faculty of Science · Administration</p><h1>Department administrators</h1></div></div><Link className="text-link" href="/admin">Back to dashboard</Link></div><DepartmentAdministrators departments={departments}/></section>;
}
