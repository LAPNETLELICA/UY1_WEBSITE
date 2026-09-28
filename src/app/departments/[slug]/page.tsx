import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { DEPARTMENT_FALLBACKS } from "@/lib/content";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const client = createPublicClient();
  const { data } = client ? await client.from("departments").select("name,description").eq("slug", slug).maybeSingle() : { data: null };
  return { title: data?.name ?? "Department", description: data?.description ?? "Explore a Faculty of Science department." };
}
export default async function DepartmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const client = createPublicClient();
  const { data: liveDepartment } = client ? await client.from("departments").select("*").eq("slug", slug).eq("is_active", true).maybeSingle() : { data: null };
  const department = liveDepartment ?? DEPARTMENT_FALLBACKS.find((item)=>item.slug===slug);
  if (!department) notFound();
  const emptyResult={data:[] as any[]};
  const results:any[]=department.id&&client ? await Promise.all([
    client!.from("specializations").select("id,name,slug,description").eq("department_id", department.id).eq("is_active", true).order("sort_order"),
    client!.from("programs").select("id,name,slug,degree,description,specialization_id").eq("department_id", department.id).eq("is_active", true).order("name"),
    client!.from("research_projects").select("id,title,slug,summary,status").eq("department_id", department.id).eq("status", "published").order("created_at", {ascending:false}).limit(4),
    client!.from("news").select("id,title,slug,excerpt").eq("department_id", department.id).eq("status", "published").order("published_at", {ascending:false}).limit(3),
    client!.from("events").select("id,title,slug,description,starts_at").eq("department_id", department.id).eq("status", "published").order("starts_at").limit(3),
    client!.from("gallery_items").select("id,title,description,image_path").eq("department_id", department.id).eq("status", "published").limit(3),
    client!.from("documents").select("id,title,description,storage_path").eq("department_id", department.id).eq("status", "published").limit(3),
    client!.from("timetables").select("id,level,semester,academic_year,specialization_id").eq("department_id", department.id).eq("status", "published").order("academic_year", {ascending:false}).limit(4),
  ]) : Array.from({length:8},()=>emptyResult);
  const [specialtiesResult,programsResult,researchResult,newsResult,eventsResult,galleryResult,docsResult,tablesResult]=results;
  const specialties = specialtiesResult.data ?? [];
  return <><section className="page-hero"><div className="wrap"><p className="section-kicker"><Link href="/departments">Departments</Link> / {department.name}</p><h1>{department.name}</h1><p>{department.description || "Explore this department’s teaching, research and academic resources."}</p><div className="button-row" style={{marginTop:24}}><Link className="button button-primary" href={department.id?`/timetables?department=${department.id}`:"/timetables"}>Department timetables <ArrowRight size={15}/></Link><Link className="button button-quiet" href="/programs">All programmes</Link></div></div></section>
    <section className="content-section"><div className="wrap"><div className="about-grid"><article className="content-block"><h2>Department overview</h2><p>{department.mission || department.description || `${department.name} contributes to scientific education and research across the Faculty.`}</p>{department.teaching_areas?.length>0&&<p><strong>Teaching areas:</strong> {department.teaching_areas.join(", ")}</p>}{department.research_areas?.length>0&&<p><strong>Research areas:</strong> {department.research_areas.join(", ")}</p>}{department.head_name && <p><strong>Head of department:</strong> {department.head_name}</p>}</article><div className="context-panel"><p className="section-kicker">Faculty → Department</p><h2>{department.name}</h2><p>Teaching and research connect through programmes, specialties and academic resources.</p></div></div>
      <ContentSection title="Specialties" eyebrow="Areas of study">{specialties.length ? <div className="card-grid">{specialties.map((s)=><Link href={`/departments/${slug}/specialties/${s.slug}`} className="dept-card" key={s.id}><span className="card-number">SPECIALTY</span><h3>{s.name}</h3><p>{s.description}</p><span className="card-arrow"><ArrowUpRight size={16}/></span></Link>)}</div> : <p className="empty-inline">Specialty profiles will appear when published.</p>}</ContentSection>
      <ContentSection title="Programmes" eyebrow="Study"><div className="simple-list">{(programsResult.data ?? []).map((p)=><article key={p.id}><h3><Link href={`/programs/${p.slug}`}>{p.name}</Link></h3><p>{p.degree}{p.description ? ` · ${p.description}` : ""}</p></article>)}</div>{!(programsResult.data?.length) && <p className="empty-inline">No published programmes yet.</p>}<Link className="text-link" href="/programs">Explore all programmes <ArrowRight size={14}/></Link></ContentSection>
      <ContentSection title="Research" eyebrow="Discover"><div className="simple-list">{(researchResult.data ?? []).map((r)=><article key={r.id}><h3><Link href={`/research/${r.slug}`}>{r.title}</Link></h3><p>{r.summary}</p></article>)}</div>{!(researchResult.data?.length) && <p className="empty-inline">Research projects will appear here when published.</p>}</ContentSection>
      <div className="related-columns"><Related title="News" rows={newsResult.data ?? []} href="/news" detailBase="/news"/><Related title="Events" rows={eventsResult.data ?? []} href="/events" detailBase="/events"/><Related title="Gallery" rows={galleryResult.data ?? []} href="/gallery" imageField="image_path"/><Related title="Documentation" rows={docsResult.data ?? []} href="/documents" fileField="storage_path"/><Related title="Timetables" rows={tablesResult.data ?? []} href={department.id?`/timetables?department=${department.id}`:"/timetables"}/></div>
    </div></section></>;
}
function ContentSection({title,eyebrow,children}:{title:string;eyebrow:string;children:React.ReactNode}){return <section className="nested-section"><div className="section-head-row"><div><p className="section-kicker">{eyebrow}</p><h2 className="section-heading">{title}</h2></div></div>{children}</section>}
function Related({title,rows,href,detailBase,imageField,fileField}:{title:string;rows:any[];href:string;detailBase?:string;imageField?:string;fileField?:string}){return <article className="related-card"><p className="section-kicker">Resources</p><h3>{title}</h3>{rows.slice(0,3).map((r)=><p key={r.id}>{detailBase&&r.slug?<Link href={`${detailBase}/${r.slug}`}>{r.title}</Link>:fileField&&r[fileField]?<a href={r[fileField]} target="_blank" rel="noreferrer">{r.title}</a>:r.title ?? `${r.level} · ${r.semester} · ${r.academic_year}`}{imageField&&r[imageField]&&<a className="related-image-link" href={r[imageField]} target="_blank" rel="noreferrer"><img src={r[imageField]} alt={r.title}/></a>}</p>)}{!rows.length && <p>Published items will appear here.</p>}<Link className="text-link" href={href}>Browse {title.toLowerCase()} <ArrowRight size={13}/></Link></article>}
