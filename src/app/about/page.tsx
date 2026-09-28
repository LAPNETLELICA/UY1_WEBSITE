import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getActiveDepartments } from "@/lib/content";
import { createPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";
export const metadata = { title: "About Us", description: "The mission, vision, history and academic organization of the Faculty of Science at the University of Yaoundé I." };
export default async function AboutPage() {
  const [departments, infoResult] = await Promise.all([
    getActiveDepartments(),
    createPublicClient()?.from("faculty_information").select("key,title,content").eq("is_public",true) ?? Promise.resolve({data:[]}),
  ]);
  const info=infoResult.data??[];
  const contentFor=(key:string,fallback:string)=>{const row=info.find((x:any)=>x.key===key);const value=row?.content;return typeof value==="string"?value:typeof value?.text==="string"?value.text:typeof value?.body==="string"?value.body:fallback;};
  return <><section className="page-hero"><div className="wrap"><p className="section-kicker">About Us · University of Yaoundé I</p><h1>Science in service of society.</h1><p>Discover the Faculty’s identity, mission, vision and the departments that bring its scientific community together.</p></div></section>
    <section className="content-section"><div className="wrap"><div className="about-grid"><article className="content-block"><h2>{contentFor("presentation_title","Our story and purpose")}</h2><p>{contentFor("presentation","The Faculty of Science is part of the University of Yaoundé I, a public institution for higher education and research in Cameroon. Its academic community brings together teaching, scientific inquiry and service.")}</p><p>{contentFor("history","Across its disciplines, the Faculty prepares students to investigate important questions and apply scientific knowledge with integrity, imagination and care.")}</p><p>{contentFor("objectives","Institutional history, objectives and official figures should be confirmed by the Faculty before publication.")}</p></article><div className="about-values"><article><span>01</span><h3>Mission</h3><p>{contentFor("mission","Deliver rigorous, relevant science education and advance research that responds to local and global challenges.")}</p></article><article><span>02</span><h3>Vision</h3><p>{contentFor("vision","A welcoming, connected centre of scientific learning, discovery and public service.")}</p></article><article><span>03</span><h3>Organization</h3><p>{contentFor("organization","Departments and specialties connect teaching, programmes, research and student resources.")}</p></article></div></div></div></section>
    <section className="section dept-section"><div className="wrap"><div className="section-head-row"><div><p className="section-kicker">Academic organization</p><h2 className="section-heading">Our departments</h2><p className="section-lead">Choose a department to explore its programmes, specialties, research and resources.</p></div><Link className="text-link" href="/departments">All departments <ArrowRight size={15}/></Link></div>{departments.length ? <div className="card-grid">{departments.map((d)=><Link className="dept-card" href={`/departments/${d.slug}`} key={d.id || d.slug}><span className="card-number">DEPARTMENT</span><h3>{d.name}</h3><p>{d.description || "Explore teaching, research and academic resources."}</p><span className="card-arrow"><ArrowUpRight size={17}/></span></Link>)}</div> : <div className="timetable-placeholder">Department profiles will appear here as they are published in the faculty content system.</div>}</div></section>
  </>;
}
