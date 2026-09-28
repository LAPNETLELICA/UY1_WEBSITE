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
    client.from("programs").select("id,name,slug,degree,level,description").eq("specialization_id",specialty.id).eq("is_active",true),
    client.from("research_projects").select("id,title,slug,summary").eq("specialization_id",specialty.id).eq("status","published"),
    client.from("news").select("id,title,slug,excerpt").eq("specialization_id",specialty.id).eq("status","published"),
    client.from("events").select("id,title,slug,description,starts_at").eq("specialization_id",specialty.id).eq("status","published"),
    client.from("gallery_items").select("id,title,description,image_path").eq("specialization_id",specialty.id).eq("status","published"),
    client.from("documents").select("id,title,description,storage_path").eq("specialization_id",specialty.id).eq("status","published"),
    client.from("timetables").select("id,level,semester,academic_year").eq("specialization_id",specialty.id).eq("status","published"),
  ]);
  const groups=[
    {title:"Programmes",items:programs.data??[],href:"/programs",label:(x:any)=>x.name,detail:(x:any)=>`${x.degree}${x.level?` · ${x.level}`:""}`,link:(x:any)=>`/programs/${x.slug}`},
    {title:"Research",items:research.data??[],href:"/research",label:(x:any)=>x.title,detail:(x:any)=>x.summary,link:(x:any)=>`/research/${x.slug}`},
    {title:"News",items:news.data??[],href:"/news",label:(x:any)=>x.title,detail:(x:any)=>x.excerpt,link:(x:any)=>`/news/${x.slug}`},
    {title:"Events",items:events.data??[],href:"/events",label:(x:any)=>x.title,detail:(x:any)=>x.description,link:(x:any)=>`/events/${x.slug}`},
    {title:"Gallery",items:gallery.data??[],href:"/gallery",label:(x:any)=>x.title,detail:(x:any)=>x.description,link:(x:any)=>x.image_path||"/gallery"},{title:"Documentation",items:docs.data??[],href:"/documents",label:(x:any)=>x.title,detail:(x:any)=>x.description,link:(x:any)=>x.storage_path},
    {title:"Timetables",items:tables.data??[],href:"/timetables",label:(x:any)=>`${x.level} · ${x.semester}`,detail:(x:any)=>x.academic_year,link:()=>`/timetables?department=${department.id}&specialty=${specialty.id}`},
  ];
  return <><section className="page-hero"><div className="wrap"><p className="section-kicker"><Link href={`/departments/${department.slug}`}>{department.name}</Link> / Specialty</p><h1>{specialty.name}</h1><p>{specialty.description||"Explore programmes and academic work connected to this specialty."}</p></div></section><section className="content-section"><div className="wrap"><div className="hierarchy-trail"><span>FACULTY</span><ArrowRight size={13}/><Link href={`/departments/${department.slug}`}>{department.name}</Link><ArrowRight size={13}/><strong>{specialty.name}</strong></div>{specialty.mission&&<div className="content-block"><h2>Specialty overview</h2><p>{specialty.mission}</p></div>}{groups.map(g=><section className="nested-section" key={g.title}><div className="section-head-row"><h2 className="section-heading">{g.title}</h2><Link className="text-link" href={g.href}>Browse all <ArrowRight size={14}/></Link></div>{g.items.length?<div className="simple-list">{g.items.map((x:any)=><article key={x.id}><h3><Link href={g.link(x)}>{g.label(x)}</Link></h3><p>{g.detail(x)}</p></article>)}</div>:<p className="empty-inline">No published {g.title.toLowerCase()} are linked to this specialty yet.</p>}</section>)}</div></section></>;
}
