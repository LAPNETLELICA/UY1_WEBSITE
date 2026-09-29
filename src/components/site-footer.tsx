import Link from "next/link";
import { ArrowUpRight, MapPin, Mail, Phone } from "lucide-react";
import Image from "next/image";
import { createPublicClient } from "@/lib/supabase/public";
import { SiteChromeGuard } from "@/components/site-chrome-guard";

export async function SiteFooter() {
  const client=createPublicClient();
  const [contactResult,linkResult]=client?await Promise.all([client.from("site_contacts").select("label,contact_type,value").eq("scope","faculty").eq("is_enabled",true).order("sort_order"),client.from("site_links").select("label,url").eq("scope","faculty").eq("is_enabled",true).order("sort_order")]):[{data:[]},{data:[]}];
  const contacts=contactResult.data??[];
  const address=contacts.find((item:any)=>item.contact_type==="address")?.value??"Ngoa-Ekellé, Yaoundé, Cameroon";
  const email=contacts.find((item:any)=>item.contact_type==="email")?.value??"facsciences@uy1.uninet.cm";
  const phone=contacts.find((item:any)=>item.contact_type==="phone")?.value??"+237 222 23 44 96";
  return (
    <SiteChromeGuard><footer className="site-footer">
      <div className="footer-main wrap">
        <div className="footer-intro">
          <Link href="/" className="brand footer-brand">
            <span className="brand-seal">
              <Image src="/uy1-seal.png" alt="University of Yaoundé I seal" width={46} height={46} />
            </span>
            <span className="brand-copy">
              <strong>FACULTY OF SCIENCE</strong>
              <small>UNIVERSITY OF YAOUNDÉ I</small>
            </span>
          </Link>
          <p>Curiosity in the classroom. Discovery in the laboratory. Knowledge in service of society.</p>
        </div>
        <div className="footer-column"><h3>Explore</h3><Link href="/about">About Us</Link><Link href="/services">Faculty services</Link><Link href="/departments">Departments</Link><Link href="/programs">Academic programmes</Link><Link href="/research">Research</Link></div>
        <div className="footer-column"><h3>For students</h3><Link href="/timetables">Class timetables <ArrowUpRight size={13} /></Link><Link href="/documents">Documents & forms</Link><Link href="/contact">Contact</Link><Link href="/news-events">News & events</Link></div>
        <div className="footer-column footer-contact"><h3>Find us</h3><p><MapPin size={15} /> {address}</p><a href={`mailto:${email}`}><Mail size={15} /> {email}</a><a href={`tel:${phone.replace(/[^+0-9]/g,"")}`}><Phone size={15} /> {phone}</a>{contacts.filter((item:any)=>item.contact_type==="social").map((item:any)=><a key={item.value} href={item.value} target="_blank" rel="noreferrer"><ArrowUpRight size={14}/>{item.label}</a>)}{(linkResult.data??[]).map((item:any)=><a key={item.url} href={item.url} target="_blank" rel="noreferrer"><ArrowUpRight size={14}/>{item.label}</a>)}</div>
      </div>
      <div className="footer-bottom wrap"><span>© {new Date().getFullYear()} University of Yaoundé I · Faculty of Science</span><div><Link href="/admin/login">Staff access</Link><span>Built for knowledge and discovery</span></div></div>
    </footer></SiteChromeGuard>
  );
}
