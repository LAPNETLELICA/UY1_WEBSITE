import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: "/", disallow: "/admin" }, sitemap: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://sciences.univ-yaounde1.cm"}/sitemap.xml` }; }
