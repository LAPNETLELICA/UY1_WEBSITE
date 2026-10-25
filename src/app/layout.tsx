import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PageBackControl } from "@/components/back-button";
import { LanguageProvider } from "@/components/language-provider";
import { SiteMotion } from "@/components/site-motion";
import { PageLoader } from "@/components/page-loader";
import localFont from "next/font/local";

const dmSans = localFont({ src: "../../DM_SansPlayfair_Display/DM_Sans/DMSans-VariableFont_opsz,wght.ttf", variable: "--font-dm-sans", display: "swap", weight: "100 1000" });
const playfair = localFont({ src: "../../DM_SansPlayfair_Display/Playfair_Display/PlayfairDisplay-VariableFont_wght.ttf", variable: "--font-playfair", display: "swap", weight: "400 900" });

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
    <html lang="en" translate="no" className={`${dmSans.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=DM+Serif+Display:ital@0;1&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
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
