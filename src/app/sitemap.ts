import type { MetadataRoute } from "next";
const pages = ["", "about", "faculty", "departments", "programs", "timetables", "research", "news", "events", "gallery", "documents", "contact", "services"];
export default function sitemap(): MetadataRoute.Sitemap { const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sciences.univ-yaounde1.cm"; return pages.map((path) => ({ url: `${base}/${path}`, lastModified: new Date(), changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : path === "timetables" ? .9 : .7 })); }
