"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Image from "next/image";

const links = [
  ["Faculty", "/faculty"], ["Departments", "/departments"], ["Programs", "/programs"],
  ["Research", "/research"], ["News", "/news"], ["Events", "/events"],
  ["Gallery", "/gallery"], ["Documents", "/documents"], ["Contact", "/contact"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/" className="brand" aria-label="Faculty of Science homepage" onClick={() => setOpen(false)}>
          <span className="brand-seal"><Image src="/uy1-seal.png" alt="University of Yaoundé I seal" width={46} height={46} priority /></span>
          <span className="brand-copy"><strong>FACULTY OF SCIENCE</strong><small>UNIVERSITY OF YAOUNDÉ I</small></span>
        </Link>
        <button className="mobile-menu" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        <nav className={`primary-nav ${open ? "is-open" : ""}`} aria-label="Main navigation">
          {links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link href="/timetables" className="nav-cta" onClick={() => setOpen(false)}>Student timetables <ArrowUpRight size={15} /></Link>
        </nav>
      </div>
    </header>
  );
}
