"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { BackButton } from "@/components/back-button";

const links = [["Home", "/"], ["About Us", "/about"], ["Programs", "/programs"], ["Research", "/research"], ["News & Events", "/news-events"], ["Departments", "/departments"]] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;
  return <><div className="announcement"><span className="announcement-dot" /> Official website of the Faculty of Science <span className="announcement-separator">·</span> University of Yaoundé I</div><header className="site-header"><div className="nav-shell">
    <BackButton className="site-history-back" />
    <Link href="/" className="brand" aria-label="Faculty of Science homepage" onClick={() => setOpen(false)}>
      <span className="brand-seal"><Image src="/uy1-seal.png" alt="University of Yaoundé I seal" width={46} height={46} priority /></span>
      <span className="brand-copy"><strong>FACULTY OF SCIENCE</strong><small>UNIVERSITY OF YAOUNDÉ I</small></span>
    </Link>
    <button className="mobile-menu" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
    <nav className={`primary-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
      {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
      <details className="nav-more"><summary>Explore <ChevronDown size={13}/></summary><div className="nav-dropdown">
        <Link href="/services" onClick={() => setOpen(false)}>Faculty services</Link><Link href="/gallery" onClick={() => setOpen(false)}>Gallery</Link><Link href="/documents" onClick={() => setOpen(false)}>Documentation</Link><Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
      </div></details>
      <Link href="/timetables" className="nav-cta" onClick={() => setOpen(false)}>Timetables <ArrowUpRight size={15} /></Link>
    </nav>
  </div></header></>;
}
