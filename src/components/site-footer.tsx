import Link from "next/link";
import { ArrowUpRight, MapPin, Mail, Phone } from "lucide-react";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="site-footer">
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
        <div className="footer-column"><h3>Explore</h3><Link href="/about">About Us</Link><Link href="/departments">Departments</Link><Link href="/programs">Academic programmes</Link><Link href="/research">Research</Link></div>
        <div className="footer-column"><h3>For students</h3><Link href="/timetables">Class timetables <ArrowUpRight size={13} /></Link><Link href="/documents">Documents & forms</Link><Link href="/events">Academic calendar</Link><Link href="/news">Faculty news</Link></div>
        <div className="footer-column footer-contact"><h3>Find us</h3><p><MapPin size={15} /> Ngoa-Ekellé, Yaoundé, Cameroon</p><a href="mailto:facsciences@uy1.uninet.cm"><Mail size={15} /> facsciences@uy1.uninet.cm</a><a href="tel:+237222234496"><Phone size={15} /> +237 222 23 44 96</a></div>
      </div>
      <div className="footer-bottom wrap"><span>© {new Date().getFullYear()} University of Yaoundé I · Faculty of Science</span><div><Link href="/admin/login">Staff access</Link><span>Built for knowledge and discovery</span></div></div>
    </footer>
  );
}
