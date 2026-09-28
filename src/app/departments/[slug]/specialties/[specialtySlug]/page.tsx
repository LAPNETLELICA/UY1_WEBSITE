import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";
export default async function SpecialtyPage({params}:{params:Promise<{slug:string;specialtySlug:string}>}) {
  const {slug,specialtySlug}=await params; const client=createPublicClient(); if(!client) notFound();
  const {data:department}=await client.from("departments").select("id,name,slug").eq("slug",slug).eq("is_active",true).maybeSingle();
  if(!department) notFound();
  const {data:specialty}=await client.from("specializations").select("*").eq("department_id",department.id).eq("slug",specialtySlug).eq("is_active",true).maybeSingle();
  if(!specialty) notFound();
  const [programs,research,news,events,gallery,docs,tables]=await Promise.all([
    client.from("programs").select("id,name,slug,degree,level,description,image_path,details").eq("specialization_id",specialty.id).eq("is_active",true),
    client.from("research_projects").select("id,title,slug,summary,image_path,details").eq("specialization_id",specialty.id).eq("status","published"),
    client.from("news").select("id,title,slug,excerpt,image_path").eq("specialization_id",specialty.id).eq("status","published"),
    client.from("events").select("id,title,slug,description,starts_at,image_path").eq("specialization_id",specialty.id).eq("status","published"),
    client.from("gallery_items").select("id,title,slug,description,image_path").eq("specialization_id",specialty.id).eq("status","published"),
    client.from("documents").select("id,title,description,storage_path").eq("specialization_id",specialty.id).eq("status","published"),
    client.from("timetables").select("id,level,semester,academic_year").eq("specialization_id",specialty.id).eq("status","published"),
  ]);
  const updates=[...(news.data??[]).map((x:any)=>({...x,_kind:"news"})),...(events.data??[]).map((x:any)=>({...x,_kind:"events"}))];
  const groups=[
    {title:"Programmes",items:programs.data??[],href:`/departments/${department.slug}/programs`,label:(x:any)=>x.name,detail:(x:any)=>`${x.degree}${x.level?` · ${x.level}`:""}`,link:(x:any)=>`/departments/${department.slug}/programs/${x.slug}`},
    {title:"Research",items:research.data??[],href:`/departments/${department.slug}/research`,label:(x:any)=>x.title,detail:(x:any)=>x.summary,link:(x:any)=>`/departments/${department.slug}/research/${x.slug}`},
    {title:"News & Events",items:updates,href:`/departments/${department.slug}/news-events`,label:(x:any)=>x.title,detail:(x:any)=>x.excerpt||x.description,link:(x:any)=>`/departments/${department.slug}/${x._kind}/${x.slug}`},
    {title:"Gallery",items:gallery.data??[],href:`/departments/${department.slug}/gallery`,label:(x:any)=>x.title,detail:(x:any)=>x.description,link:(x:any)=>`/departments/${department.slug}/gallery/${x.id}`},{title:"Documentation",items:docs.data??[],href:`/departments/${department.slug}/documents`,label:(x:any)=>x.title,detail:(x:any)=>x.description,link:(x:any)=>`/departments/${department.slug}/documents/${x.id}`},
    {title:"Timetables",items:tables.data??[],href:`/departments/${department.slug}/timetables`,label:(x:any)=>`${x.level} · ${x.semester}`,detail:(x:any)=>x.academic_year,link:()=>`/departments/${department.slug}/timetables?specialty=${specialty.id}`},
  ];
  return <><section className="page-hero"><div className="wrap"><p className="section-kicker"><Link href={`/departments/${department.slug}`}>{department.name}</Link> / <Link href={`/departments/${department.slug}#specialties`}>Specialties</Link></p><h1>{specialty.name}</h1><p>{specialty.description||"Explore programmes and academic work connected to this specialty."}</p><Link className="button button-primary" href={`/departments/${department.slug}/timetables?specialty=${specialty.id}`}>View specialty timetable</Link></div></section><section className="content-section"><div className="wrap"><div className="hierarchy-trail"><span>FACULTY</span><ArrowRight size={13}/><Link href={`/departments/${department.slug}`}>{department.name}</Link><ArrowRight size={13}/><strong>{specialty.name}</strong></div>{specialty.mission&&<div className="content-block"><h2>Specialty overview</h2><p>{specialty.mission}</p></div>}{groups.map(g=><section className="nested-section" key={g.title}><div className="section-head-row"><h2 className="section-heading">{g.title}</h2><Link className="text-link" href={g.href}>Browse all <ArrowRight size={14}/></Link></div>{g.items.length?<div className="simple-list">{g.items.map((x:any)=><article key={x.id}><h3><Link href={g.link(x)}>{g.label(x)}</Link></h3>{x.image_path&&<img className="resource-card-image" src={x.image_path} alt={g.label(x)}/>}<p>{g.detail(x)}</p></article>)}</div>:<p className="empty-inline">No published {g.title.toLowerCase()} are linked to this specialty yet.</p>}</section>)}</div></section></>;
}
