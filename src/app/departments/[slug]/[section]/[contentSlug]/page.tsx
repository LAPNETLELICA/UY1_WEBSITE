import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";
const tables:Record<string,{table:string;titleField:string;bodyFields:string[];active?:string;image?:boolean;file?:boolean}>={
 programs:{table:"programs",titleField:"name",bodyFields:["details","description"],active:"is_active",image:true},
 research:{table:"research_projects",titleField:"title",bodyFields:["details","summary"],image:true},
 news:{table:"news",titleField:"title",bodyFields:["body","excerpt"],image:true},
 events:{table:"events",titleField:"title",bodyFields:["description"],image:true},
 gallery:{table:"gallery_items",titleField:"title",bodyFields:["description"],image:true},
 documents:{table:"documents",titleField:"title",bodyFields:["description"],file:true},
};
export default async function DepartmentContentDetail({params}:{params:Promise<{slug:string;section:string;contentSlug:string}>}){
 const {slug,section,contentSlug}=await params;const config=tables[section];const client=createPublicClient();if(!config||!client)notFound();
 const {data:department}=await client.from("departments").select("id,name,slug").eq("slug",slug).eq("is_active",true).maybeSingle();if(!department)notFound();
 let query=client.from(config.table).select("*").eq("department_id",department.id);
 query=contentSlug.match(/^[0-9a-f-]{36}$/i)?query.eq("id",contentSlug):query.eq("slug",contentSlug);
 const {data:item}=config.active?await query.eq(config.active,true).maybeSingle():await query.eq("status","published").maybeSingle();if(!item)notFound();
 const body=config.bodyFields.map(field=>item[field]).find(Boolean);
 return <><section className="page-hero"><div className="wrap"><p className="section-kicker"><Link href={`/departments/${slug}`}>{department.name}</Link> · <Link href={`/departments/${slug}/${section}`}>{section}</Link></p><h1>{item[config.titleField]}</h1><p>{item.excerpt||item.summary||item.description||department.name}</p></div></section><section className="content-section"><article className="wrap detail-layout"><div className="content-block"><h2>Overview</h2><p className="detail-body">{body}</p>{item.degree&&<p><strong>Degree:</strong> {item.degree}</p>}{item.level&&<p><strong>Level:</strong> {item.level}</p>}{item.starts_at&&<p><strong>Date:</strong> {new Date(item.starts_at).toLocaleString("en",{dateStyle:"long",timeStyle:"short"})}{item.location?` · ${item.location}`:""}</p>}</div><aside className="detail-context"><p className="section-kicker">Department context</p><h2>{department.name}</h2>{config.image&&item.image_path&&<img className="detail-image" src={item.image_path} alt={item[config.titleField]}/>}{config.file&&item.storage_path&&<a className="text-link" href={item.storage_path} target="_blank" rel="noreferrer">Open document</a>}</aside><Link className="text-link" href={`/departments/${slug}/${section}`}>Back to {section}</Link></article></section></>;
}
