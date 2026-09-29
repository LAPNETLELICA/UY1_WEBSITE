import Link from "next/link";
import { ArrowUpRight, Image as ImageIcon } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";

type Scope = "faculty" | "department" | "specialty";
type Block = { id:string; title:string; section_key:string; block_type:string; content:Record<string,unknown>; image_path:string|null; link_label:string|null; link_url:string|null; sort_order:number };

export async function PublicPageBlocks({scope,pageKey,departmentId,specialtyId}:{scope:Scope;pageKey:string;departmentId?:string;specialtyId?:string}) {
  const client=createPublicClient();
  if(!client||((scope==="department"||scope==="specialty")&&!departmentId)||(scope==="specialty"&&!specialtyId))return null;
  let query=client.from("page_content_blocks").select("*").eq("scope",scope).eq("page_key",pageKey).eq("is_enabled",true).order("sort_order");
  if(departmentId)query=query.eq("department_id",departmentId);
  if(specialtyId)query=query.eq("specialization_id",specialtyId);
  const {data}=await query;
  const blocks=(data??[]) as Block[];
  const includeContacts=scope!=="faculty"||pageKey==="contact";
  const [contactsResult,linksResult]=includeContacts?await Promise.all([
    client.from("site_contacts").select("id,label,contact_type,value").eq("scope",scope).eq("is_enabled",true).order("sort_order").match({...(departmentId?{department_id:departmentId}:{}),...(specialtyId?{specialization_id:specialtyId}:{})}),
    client.from("site_links").select("id,label,url,category").eq("scope",scope).eq("is_enabled",true).order("sort_order").match({...(departmentId?{department_id:departmentId}:{}),...(specialtyId?{specialization_id:specialtyId}:{})})
  ]):[{data:[]},{data:[]}];
  const contacts=contactsResult.data??[];const links=linksResult.data??[];
  if(!blocks.length&&!contacts.length&&!links.length)return null;
  return <div className="cms-page-blocks">{blocks.map((block)=>{
    const content=block.content??{};
    const description=String(content.description??content.body??content.text??"");
    const items=Array.isArray(content.items)?content.items as Record<string,unknown>[]:[];
    const stats=Array.isArray(content.stats)?content.stats as Record<string,unknown>[]:[];
    return <section className={`cms-block cms-block-${block.block_type}`} id={block.section_key} key={block.id}><div className="wrap">
      <p className="section-kicker">{String(content.eyebrow??block.section_key.replaceAll("-"," "))}</p>
      <div className="cms-block-grid"><div><h2 className="section-heading">{block.title}</h2>{description&&<p className="section-lead">{description}</p>}{Array.isArray(content.paragraphs)&&content.paragraphs.map((paragraph,index)=><p className="cms-block-paragraph" key={index}>{String(paragraph)}</p>)}
        {block.link_url&&<Link className="text-link" href={block.link_url}>{block.link_label||"Learn more"} <ArrowUpRight size={14}/></Link>}
      </div>{block.image_path?<img className="cms-block-image" src={block.image_path} alt={String(content.image_alt??block.title)}/>:block.block_type==="image_text"?<div className="cms-block-placeholder"><ImageIcon size={28}/><span>Image area · add an image from the dashboard</span></div>:null}</div>
      {stats.length>0&&<div className="cms-stat-grid">{stats.map((item,index)=><article key={index}><strong>{String(item.value??"")}</strong><span>{String(item.label??"")}</span></article>)}</div>}
      {items.length>0&&<div className="cms-card-grid">{items.map((item,index)=><article className="cms-content-card" key={index}>{typeof item.image==="string"&&<img src={item.image} alt={String(item.title??"")}/>}<p className="section-kicker">{String(item.eyebrow??"")}</p><h3>{String(item.title??"Content item")}</h3><p>{String(item.description??"")}</p>{typeof item.href==="string"&&<Link className="text-link" href={item.href}>{String(item.link_label??"Explore")} <ArrowUpRight size={14}/></Link>}</article>)}</div>}
    </div></section>;
  })}{includeContacts&&(contacts.length>0||links.length>0)&&<section className="cms-block cms-contact-links" id="contact"><div className="wrap"><p className="section-kicker">Contact & useful links</p><h2 className="section-heading">Get in touch and explore.</h2><div className="cms-card-grid">{contacts.map((item:any)=><article className="cms-content-card" key={item.id}><p className="section-kicker">{item.contact_type}</p><h3>{item.label}</h3><p>{item.value}</p></article>)}{links.map((item:any)=><article className="cms-content-card" key={item.id}><p className="section-kicker">{item.category}</p><h3>{item.label}</h3><Link className="text-link" href={item.url} target={item.url.startsWith("http")?"_blank":undefined} rel={item.url.startsWith("http")?"noreferrer":undefined}>Open link <ArrowUpRight size={14}/></Link></article>)}</div></div></section>}</div>;
}
