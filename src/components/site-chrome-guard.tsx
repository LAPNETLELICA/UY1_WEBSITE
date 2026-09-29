"use client";

import { usePathname } from "next/navigation";

export function SiteChromeGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <>{children}</>;
}
