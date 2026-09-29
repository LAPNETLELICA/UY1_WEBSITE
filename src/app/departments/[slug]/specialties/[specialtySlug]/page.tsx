import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Clock3, FileText, FlaskConical, Images, Newspaper, type LucideIcon } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { PublicPageBlocks } from "@/components/public-page-blocks";

export const dynamic = "force-dynamic";
export default async function SpecialtyPage({params}:{params:Promise<{slug:string;specialtySlug:string}>}) {
  const {slug,specialtySlug}=await params; const client=createPublicClient(); if(!client) notFound();
  const {data:department}=await client.from("departments").select("*").eq("slug",slug).eq("is_active",true).maybeSingle();
  if(!department) notFound();
  const {data:specialty}=await client.from("specializations").select("*").eq("department_id",department.id).eq("slug",specialtySlug).eq("is_active",true).maybeSingle();
  if(!specialty) notFound();
  const [programs,research,news,events,gallery,docs,tables]=await Promise.all([
    client.from("programs").select("*").eq("specialization_id",specialty.id).eq("is_active",true),
    client.from("research_projects").select("*").eq("specialization_id",specialty.id).in("status",["published","completed"]),
    client.from("news").select("*").eq("specialization_id",specialty.id).eq("status","published"),
    client.from("events").select("*").eq("specialization_id",specialty.id).eq("status","published"),
    client.from("gallery_items").select("*").eq("specialization_id",specialty.id).eq("status","published"),
    client.from("documents").select("id,title,description,storage_path").eq("specialization_id",specialty.id).eq("status","published"),
    client.from("timetables").select("id,level,semester,academic_year").eq("specialization_id",specialty.id).eq("status","published"),
  ]);
  const updates=[...(news.data??[]).map((x:any)=>({...x,_kind:"news"})),...(events.data??[]).map((x:any)=>({...x,_kind:"events"}))];
  const groups:{id:string;title:string;items:any[];href:string;Icon:LucideIcon;label:(x:any)=>string;detail:(x:any)=>string;link:(x:any)=>string;media?:(x:any)=>string|undefined}[]=[
    {id:"programmes",title:"Programmes",items:programs.data??[],href:`/departments/${department.slug}/programs?specialty=${specialty.id}`,Icon:BookOpen,label:(x)=>x.name,detail:(x)=>[x.degree,x.cycle,x.level,x.description].filter(Boolean).join(" · "),link:(x)=>`/departments/${department.slug}/programs/${x.slug}`,media:(x)=>x.image_path},
    {id:"research",title:"Research",items:research.data??[],href:`/departments/${department.slug}/research?specialty=${specialty.id}`,Icon:FlaskConical,label:(x)=>x.title,detail:(x)=>x.summary||x.details||"Research connected to this specialty.",link:(x)=>`/departments/${department.slug}/research/${x.slug}`,media:(x)=>x.image_path},
    {id:"news-events",title:"News & Events",items:updates,href:`/departments/${department.slug}/news-events?specialty=${specialty.id}`,Icon:Newspaper,label:(x)=>x.title,detail:(x)=>x.excerpt||x.description||"Updates from this specialty.",link:(x)=>`/departments/${department.slug}/${x._kind}/${x.slug}`,media:(x)=>x.image_path},
    {id:"gallery",title:"Gallery",items:gallery.data??[],href:`/departments/${department.slug}/gallery?specialty=${specialty.id}`,Icon:Images,label:(x)=>x.title,detail:(x)=>x.description||"Images from teaching, research and specialty activities.",link:(x)=>`/departments/${department.slug}/gallery/${x.id}`,media:(x)=>x.image_path},
    {id:"documentation",title:"Documentation",items:docs.data??[],href:`/departments/${department.slug}/documents?specialty=${specialty.id}`,Icon:FileText,label:(x)=>x.title,detail:(x)=>x.description||"Documents and learning resources for this specialty.",link:(x)=>`/departments/${department.slug}/documents/${x.id}`},
    {id:"timetables",title:"Timetables",items:tables.data??[],href:`/departments/${department.slug}/timetables?specialty=${specialty.id}`,Icon:Clock3,label:(x)=>`${x.level} · ${x.semester}`,detail:(x)=>`Academic year ${x.academic_year}`,link:()=>`/departments/${department.slug}/timetables?specialty=${specialty.id}`,media:()=>undefined},
  ];
  return <>
    <section className="page-hero specialty-hero"><div className="wrap">
      <p className="section-kicker"><Link href={`/departments/${department.slug}`}>{department.name}</Link> <span aria-hidden="true">/</span> Specialty</p>
      <h1>{specialty.name}</h1><p>{specialty.description||"Explore this specialty’s programmes, research, news, events and learning resources."}</p>
      <div className="button-row specialty-hero-actions"><Link className="button button-primary" href={`/departments/${department.slug}/timetables?specialty=${specialty.id}`}>View specialty timetable <ArrowRight size={15}/></Link><Link className="button button-quiet" href={`/departments/${department.slug}#specialties`}>All {department.name} specialties</Link></div>
    </div></section>
    <section className="content-section"><div className="wrap specialty-layout">
      <div className="specialty-main">
        <nav className="specialty-section-nav" aria-label="Specialty content sections">{groups.map(g=><a key={g.id} href={`#${g.id}`}>{g.title}</a>)}</nav>
        <div className="specialty-intro"><div><p className="section-kicker">Specialty overview</p><h2>{specialty.name}</h2><p>{specialty.mission||specialty.description||`Learn about the teaching and research work of ${specialty.name} in the ${department.name} department.`}</p>{specialty.teaching_areas?.length>0&&<p><strong>Teaching areas:</strong> {specialty.teaching_areas.join(", ")}</p>}{specialty.research_areas?.length>0&&<p><strong>Research areas:</strong> {specialty.research_areas.join(", ")}</p>}{specialty.objectives&&<p><strong>Objectives:</strong> {specialty.objectives}</p>}{specialty.career_paths?.length>0&&<p><strong>Career pathways:</strong> {specialty.career_paths.join(", ")}</p>}{specialty.teaching_staff?.length>0&&<p><strong>Teaching staff:</strong> {specialty.teaching_staff.join(", ")}</p>}{specialty.laboratories?.length>0&&<p><strong>Laboratories:</strong> {specialty.laboratories.join(", ")}</p>}</div>{specialty.image_path?<img src={specialty.image_path} alt={`${specialty.name} specialty`}/>:<div className="specialty-image-placeholder"><Images size={28}/><span>Specialty image</span></div>}</div>
        {groups.map(g=>{const Icon=g.Icon;return <section className="specialty-content-section" id={g.id} key={g.id}><div className="section-head-row"><div className="specialty-section-title"><span className="specialty-section-icon"><Icon size={19}/></span><div><p className="section-kicker">{department.name} · {specialty.name}</p><h2 className="section-heading">{g.title}</h2></div></div><Link className="text-link" href={g.href}>Browse this section <ArrowRight size={14}/></Link></div>
          {g.items.length?<div className="specialty-resource-grid">{g.items.map((item:any)=><article className="specialty-resource-card" key={item.id}><Link className="specialty-resource-media" href={g.link(item)} aria-label={`Open ${g.label(item)}`}>{g.media?.(item)?<img src={g.media!(item)!} alt={g.label(item)}/>:<span><Icon size={26}/><small>Image or media area</small></span>}</Link><div className="specialty-resource-copy"><p className="section-kicker">{g.title}</p><h3><Link href={g.link(item)}>{g.label(item)}</Link></h3><p>{g.detail(item)}</p><Link className="text-link" href={g.link(item)}>View details <ArrowUpRight size={14}/></Link></div></article>)}</div>:<div className="specialty-empty-card"><span className="specialty-resource-media empty"><Icon size={26}/><small>Image or media area</small></span><div><h3>{g.title} for {specialty.name}</h3><p>Published {g.title.toLowerCase()} and images added for this specialty will appear in this section.</p><Link className="text-link" href={g.href}>Open {g.title.toLowerCase()} section <ArrowRight size={14}/></Link></div></div>}
        </section>})}
      </div>
      <aside className="specialty-context"><p className="section-kicker">Academic context</p>{department.image_path?<img src={department.image_path} alt={department.name}/>:<div className="specialty-context-placeholder"><Images size={22}/><span>Department image</span></div>}<h2>{department.name}</h2><p>{specialty.name} is one of the specialties in this department.</p><Link className="text-link" href={`/departments/${department.slug}#specialties`}>View all department specialties <ArrowRight size={14}/></Link><Link className="text-link" href={`/departments/${department.slug}/timetables?specialty=${specialty.id}`}>Specialty timetable <ArrowRight size={14}/></Link></aside>
    </div></section><PublicPageBlocks scope="specialty" pageKey={specialty.slug} departmentId={department.id} specialtyId={specialty.id}/>
  </>;
}
