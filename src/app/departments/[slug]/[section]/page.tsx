import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { TimetableSearch } from "@/app/timetables/timetable-search";
import { DEPARTMENT_FALLBACKS } from "@/lib/content";

export const dynamic = "force-dynamic";
const sections:Record<string,{table:string;title:string;titleField:string;bodyField:string;detailPath:string;image?:boolean;file?:boolean;activeField?:string}>={
  programs:{table:"programs",title:"Programmes",titleField:"name",bodyField:"description",detailPath:"programs",activeField:"is_active",image:true},
  research:{table:"research_projects",title:"Research",titleField:"title",bodyField:"summary",detailPath:"research",image:true},
  "news-events":{table:"news",title:"News & Events",titleField:"title",bodyField:"description",detailPath:"news-events",image:true},
  news:{table:"news",title:"News",titleField:"title",bodyField:"excerpt",detailPath:"news",image:true},
  events:{table:"events",title:"Events",titleField:"title",bodyField:"description",detailPath:"events",image:true},
  gallery:{table:"gallery_items",title:"Gallery",titleField:"title",bodyField:"description",detailPath:"gallery",image:true},
  documents:{table:"documents",title:"Documentation",titleField:"title",bodyField:"description",detailPath:"documents",file:true},
};
export default async function DepartmentSectionPage({params,searchParams}:{params:Promise<{slug:string;section:string}>;searchParams:Promise<{specialty?:string}>}){
 const {slug,section}=await params;const selected=await searchParams;const config=sections[section];if(section==="timetables"){
  const client=createPublicClient();const {data:liveDepartment}=client?await client.from("departments").select("id,name,slug").eq("slug",slug).eq("is_active",true).maybeSingle():{data:null};
  const department=liveDepartment??DEPARTMENT_FALLBACKS.find(x=>x.slug===slug);if(!department)notFound();
  return <><section className="page-hero"><div className="wrap"><p className="section-kicker"><Link href={`/departments/${slug}`}>{department.name}</Link> · Student services</p><h1>{department.name} timetables</h1><p>View the whole department schedule or narrow it by specialty, level, semester and academic year.</p></div></section><section className="content-section"><div className="wrap"><TimetableSearch initialDepartment={department.id||""} initialSpecialty={selected.specialty??""}/></div></section></>;
 }
 if(!config)notFound();const client=createPublicClient();
 const {data:liveDepartment}=client?await client.from("departments").select("id,name,slug").eq("slug",slug).eq("is_active",true).maybeSingle():{data:null};
 const department=liveDepartment??DEPARTMENT_FALLBACKS.find(x=>x.slug===slug);if(!department)notFound();
 if(!client||!department.id)return <><section className="page-hero"><div className="wrap"><p className="section-kicker"><Link href={`/departments/${slug}`}>{department.name}</Link> · Department resources</p><h1>{config.title} · {department.name}</h1><p>This department content will appear here when it has been added in the admin dashboard.</p></div></section></>;
 let rows:any[]=[];
 if(section==="news-events"){
  const [news,events]=await Promise.all([client.from("news").select("*").eq("department_id",department.id).eq("status","published"),client.from("events").select("*").eq("department_id",department.id).eq("status","published")]);
  rows=[...(news.data??[]).map(row=>({...row,_kind:"news"})),...(events.data??[]).map(row=>({...row,_kind:"events"}))].sort((a,b)=>String(b.published_at||b.starts_at||"").localeCompare(String(a.published_at||a.starts_at||"")));
 }else{
  let query=client.from(config.table).select("*").eq("department_id",department.id);
  const result=config.activeField?await query.eq(config.activeField,true).order("name"):await query.eq("status","published").order("created_at",{ascending:false});rows=result.data??[];
 }
 return <><section className="page-hero"><div className="wrap"><p className="section-kicker"><Link href={`/departments/${slug}`}>{department.name}</Link> · Department resources</p><h1>{config.title} · {department.name}</h1><p>This listing shows content assigned to this department.</p></div></section><section className="content-section"><div className="wrap"><div className="department-resource-grid">{rows?.length?rows.map((row:any)=><article className="resource-card" key={row.id}>{config.image&&row.image_path&&<img src={row.image_path} alt={row.title}/>}<p className="section-kicker">{department.name}{row.specialization_id?" · Specialty content":""}</p><h2><Link href={`/departments/${slug}/${row._kind||section}/${row.slug||row.id}`}>{row[config.titleField]}</Link></h2><p>{row[config.bodyField]||row.excerpt}</p>{row.degree&&<p className="resource-context">{row.degree}{row.level?` · ${row.level}`:""}</p>}{config.file&&row.storage_path&&<a className="text-link" href={row.storage_path} target="_blank" rel="noreferrer">Open document <ArrowRight size={14}/></a>}</article>):<p className="empty-inline">No published {config.title.toLowerCase()} are available for this department yet.</p>}</div><Link className="text-link" href={`/departments/${slug}`}>Back to {department.name}</Link></div></section></>;
}
