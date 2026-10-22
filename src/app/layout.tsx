import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageBackControl } from "@/components/back-button";
import { LanguageProvider } from "@/components/language-provider";
import { SiteMotion } from "@/components/site-motion";
import { PageLoader } from "@/components/page-loader";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sciences.univ-yaounde1.cm";

// Faculty content is maintained through the admin workspace. Render every route
// dynamically so a newly published change is visible immediately rather than
// waiting for a statically generated page to be rebuilt or revalidated.
export const dynamic = "force-dynamic";

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
      <LanguageProvider>
        <PageLoader />
        <SiteMotion />
        <SiteHeader />
        <main><PageBackControl />{children}</main>
        <SiteFooter />
      </LanguageProvider>
      </body>
    </html>
  );
}
