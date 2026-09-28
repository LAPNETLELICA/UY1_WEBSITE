import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sciences.univ-yaounde1.cm";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Faculty of Science | University of Yaoundé I",
    template: "%s | Faculty of Science — UY1",
  },
  description: "Discover the Faculty of Science at the University of Yaoundé I: academic programmes, research, campus news and student timetables.",
  openGraph: {
    title: "Faculty of Science — University of Yaoundé I",
    description: "Knowledge, discovery and service since 1962.",
    type: "website",
    locale: "en_CM",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="announcement"><span className="announcement-dot" /> Official website of the Faculty of Science <span className="announcement-separator">·</span> University of Yaoundé I</div>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
