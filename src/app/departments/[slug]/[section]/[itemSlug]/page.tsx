import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";
const contentTables: Record<string, { table: string; title: (row: any) => string; body: (row: any) => string; publishedOnly?: boolean }> = {
  programs: { table: "programs", title: (row) => row.name, body: (row) => row.details || row.description },
  research: { table: "research_projects", title: (row) => row.title, body: (row) => row.details || row.summary },
  news: { table: "news", title: (row) => row.title, body: (row) => row.body || row.excerpt, publishedOnly: true },
  events: { table: "events", title: (row) => row.title, body: (row) => row.body || row.description, publishedOnly: true },
  gallery: { table: "gallery_items", title: (row) => row.title, body: (row) => row.description, publishedOnly: true },
  documents: { table: "documents", title: (row) => row.title, body: (row) => row.description, publishedOnly: true },
};

export default async function DepartmentContentDetail({ params }: { params: Promise<{ slug: string; section: string; itemSlug: string }> }) {
  const { slug: departmentSlug, section, itemSlug } = await params;
  const config = contentTables[section];
  const client = createPublicClient();
  if (!config || !client) notFound();

  const { data: department } = await client.from("departments").select("id,name,slug").eq("slug", departmentSlug).eq("is_active", true).maybeSingle();
  if (!department) notFound();

  const identifier = section === "gallery" || section === "documents" ? "id" : "slug";
  let query = client.from(config.table).select("*").eq(identifier, itemSlug).eq("department_id", department.id);
  if (section === "programs") query = query.eq("is_active", true);
  else if (section === "research") query = query.in("status", ["published", "completed"]);
  else if (config.publishedOnly) query = query.eq("status", "published");
  const { data: item } = await query.maybeSingle();
  if (!item) notFound();

  let specialty: { name: string; slug: string } | null = null;
  if (item.specialization_id) {
    const { data } = await client.from("specializations").select("name,slug").eq("id", item.specialization_id).eq("department_id", department.id).maybeSingle();
    specialty = data;
  }
  const title = config.title(item);
  const date = item.published_at || item.starts_at || item.created_at;
  const backPath = section === "news" || section === "events" ? "news-events" : section;
  const heroImage = item.image_path || item.cover_image_path;
  return <>
    <section className="page-hero article-page-hero"><div className="wrap">
      <p className="section-kicker"><Link href={`/departments/${department.slug}`}>{department.name}</Link> · {section}{specialty && <> · <Link href={`/departments/${department.slug}/specialties/${specialty.slug}`}>{specialty.name}</Link></>}{date && <> · <time dateTime={date}>{new Date(date).toLocaleDateString("en", { dateStyle: "long" })}</time></>}</p>
      <h1>{title}</h1><p>{item.excerpt || item.summary || item.description || item.degree || "Department information · University of Yaoundé I"}</p>
      {(item.author_name || item.category) && <p className="article-byline">{item.category}{item.author_name ? ` · ${item.author_name}` : ""}</p>}
    </div></section>
    {heroImage && <div className="article-hero-image-wrap"><img src={heroImage} alt={title} /></div>}
    <section className="content-section"><article className="wrap detail-layout">
      <div className="content-block"><p className="section-kicker">{section === "news" || section === "events" ? "Full story" : "Overview"}</p><div className="detail-body">{config.body(item) || `More information about ${title} will be published here.`}</div>
        {item.starts_at && <p><strong>Starts:</strong> {new Date(item.starts_at).toLocaleString("en", { dateStyle: "long", timeStyle: "short" })}{item.location ? ` · ${item.location}` : ""}</p>}
        {item.ends_at && <p><strong>Ends:</strong> {new Date(item.ends_at).toLocaleString("en", { dateStyle: "long", timeStyle: "short" })}</p>}
        {item.research_axis && <p><strong>Research axis:</strong> {item.research_axis}</p>}{item.laboratory && <p><strong>Laboratory:</strong> {item.laboratory}</p>}{item.lead_name && <p><strong>Research lead:</strong> {item.lead_name}</p>}
        {item.publications?.length > 0 && <div className="article-related-info"><h2>Publications</h2><ul>{item.publications.map((value: string, index: number) => <li key={`${value}-${index}`}>{value}</li>)}</ul></div>}
        {Array.isArray(item.image_paths) && item.image_paths.length > 0 && <div className="detail-image-grid">{item.image_paths.map((image: string, index: number) => <img key={`${image}-${index}`} src={image} alt={`${title} image ${index + 1}`} />)}</div>}
        {item.external_url && <p><a className="text-link" href={item.external_url} target="_blank" rel="noreferrer">Related information <ArrowUpRight size={14} /></a></p>}
        {item.document_url && <p><a className="text-link" href={item.document_url} target="_blank" rel="noreferrer">Open document <ArrowUpRight size={14} /></a></p>}
      </div>
      <aside className="detail-context"><p className="section-kicker">Department content</p><h2>{department.name}</h2>{specialty && <p><strong>Specialty:</strong> {specialty.name}</p>}{item.cycle && <p><strong>Study cycle:</strong> {item.cycle}</p>}{item.degree && <p><strong>Degree:</strong> {item.degree}</p>}{item.level && <p><strong>Level:</strong> {item.level}</p>}{item.storage_path && <a className="text-link" href={item.external_url || item.storage_path} target="_blank" rel="noreferrer">Open or download resource <ArrowUpRight size={14} /></a>}</aside>
      <Link className="text-link" href={`/departments/${department.slug}/${backPath}`}><ArrowLeft size={14} /> Back to {department.name} {backPath === "news-events" ? "News & Events" : backPath}</Link>
    </article></section>
  </>;
}
