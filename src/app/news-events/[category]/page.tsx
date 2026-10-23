import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { PAGE_BANNER_IMAGES, getPublicRows } from "@/lib/content";
import { LocalizedDate } from "@/components/language-provider";

const pages = {
  "academic-news": { category: "Academic", type: "news", title: "Academic news", eyebrow: "Faculty academic updates", intro: "Academic announcements, achievements, research and learning updates from the Faculty of Science." },
  "academic-events": { category: "Academic", type: "events", title: "Academic events", eyebrow: "Faculty academic calendar", intro: "Seminars, lectures, workshops and other academic events across the Faculty of Science." },
  "general-news": { category: "General", type: "news", title: "General news", eyebrow: "Faculty community updates", intro: "General announcements, community news and Faculty-wide updates." },
  "general-events": { category: "General", type: "events", title: "General events", eyebrow: "Faculty community calendar", intro: "Community events, notices and Faculty-wide activities." },
} as const;

type CategoryPage = keyof typeof pages;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const page = pages[category as CategoryPage];
  return { title: page?.title ?? "News & Events", description: page?.intro };
}

export default async function NewsEventCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const page = pages[category as CategoryPage];
  if (!page) notFound();

  const rows = (await getPublicRows(page.type)).filter((row) => row.category === page.category);

  return <>
    <section className="page-hero public-page-hero" style={{ backgroundImage: `linear-gradient(90deg,rgba(31,17,45,.92),rgba(48,31,63,.64)),url("${PAGE_BANNER_IMAGES["news-events"]}")` }}>
      <div className="wrap"><p className="section-kicker">{page.eyebrow}</p><h1>{page.title}</h1><p>{page.intro}</p></div>
    </section>
    <section className="content-section"><div className="wrap">
      <nav className="news-event-category-links" aria-label="News and event categories">
        <Link className="button button-primary" href="/news-events/academic-news">Academic news</Link>
        <Link className="button button-quiet" href="/news-events/academic-events">Academic events</Link>
        <Link className="button button-quiet" href="/news-events/general-news">General news</Link>
        <Link className="button button-quiet" href="/news-events/general-events">General events</Link>
      </nav>
      {rows.length ? <div className="resource-grid blog-card-grid">{rows.map((row: any) => {
        const href = `/${page.type}/${row.slug}`;
        const summary = page.type === "news" ? row.excerpt : row.description;
        const date = page.type === "news" ? row.published_at : row.starts_at;
        return <article className="resource-card blog-card" key={row.id}>
          {row.image_path && <Link href={href} className="blog-card-image"><img src={row.image_path} alt={row.title}/></Link>}
          <p className="section-kicker">{page.category} · {page.type === "news" ? "News" : "Event"}</p>
          <h2><Link href={href}>{row.title}</Link></h2>
          <p>{summary}</p>
          <div className="blog-card-meta">{date && <time dateTime={date}><LocalizedDate value={date} dateStyle="medium" /></time>}{row.author_name && <span>{row.author_name}</span>}</div>
          <Link className="text-link" href={href}>{page.type === "news" ? "Read more" : "Event details"} <ArrowUpRight size={14}/></Link>
        </article>;
      })}</div> : <p className="empty-inline">No published {page.title.toLowerCase()} yet.</p>}
      <p className="news-event-back"><Link className="text-link" href="/news-events"><ArrowLeft size={14}/> Back to all news & events</Link></p>
    </div></section>
  </>;
}
