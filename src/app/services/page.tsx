import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Building2 } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";
import { PublicPageBlocks } from "@/components/public-page-blocks";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Faculty Services", description: "Meet the administrative and academic services of the Faculty of Science at the University of Yaoundé I." };

export default async function FacultyServicesPage() {
  const client = createPublicClient();
  const [{ data: services }, { data: departments }] = client ? await Promise.all([
    client.from("faculty_services").select("*,department:departments(name,slug)").eq("status", "published").order("sort_order").order("name"),
    client.from("departments").select("id,name,slug,head_name,head_title,head_bio,head_image_path").eq("is_active", true).order("name"),
  ]) : [{ data: [] as any[] }, { data: [] as any[] }];
  return <>
    <section className="page-hero"><div className="wrap"><p className="section-kicker">Faculty of Science · University of Yaoundé I</p><h1>Faculty services</h1><p>Meet the people and offices supporting academic leadership, administration and student services across the Faculty.</p></div></section>
    <section className="content-section"><div className="wrap"><div className="content-block"><p className="section-kicker">Administrative organization</p><h2>People and services behind the Faculty</h2><p>This directory presents published faculty offices, responsible people and departmental leadership. Contact details and roles can be maintained by authorized staff in the administration dashboard.</p></div>
      {services?.length ? <div className="resource-grid faculty-service-grid">{services.map((service: any) => <article className="resource-card faculty-service-card" key={service.id}>{service.image_path ? <img src={service.image_path} alt={service.responsible_name || service.name}/> : <div className="service-image-placeholder"><Building2 size={30}/><span>Service image</span></div>}<p className="section-kicker">{service.title || "Faculty service"}{service.department?.name ? ` · ${service.department.name}` : " · Faculty-wide"}</p><h2>{service.name}</h2>{service.responsible_name&&<h3>{service.responsible_name}</h3>}{service.biography&&<p>{service.biography}</p>}<p>{service.description}</p><div className="service-contact">{service.contact_email&&<a href={`mailto:${service.contact_email}`}>{service.contact_email}</a>}{service.contact_phone&&<a href={`tel:${service.contact_phone.replace(/[^+0-9]/g, "")}`}>{service.contact_phone}</a>}</div><PublicPageBlocks scope="service" pageKey={service.slug} serviceId={service.id} departmentId={service.department_id||undefined}/></article>)}</div> : <div className="department-section-empty"><span className="department-media-placeholder"><Building2 size={28}/>Faculty service profiles</span><div><p className="section-kicker">Directory content</p><h2>Faculty service information will appear here</h2><p>Published offices, responsible staff, descriptions, photos and contact details will be listed here.</p></div></div>}
      {departments?.some((department: any) => department.head_name)&&<section className="nested-section"><div className="section-head-row"><div><p className="section-kicker">Academic organization</p><h2 className="section-heading">Department leadership</h2></div></div><div className="resource-grid">{departments.filter((department:any)=>department.head_name).map((department:any)=><article className="resource-card department-lead-card" key={department.id}>{department.head_image_path&&<img src={department.head_image_path} alt={department.head_name}/>}<p className="section-kicker">{department.name}</p><h3>{department.head_name}</h3>{department.head_title&&<p><strong>{department.head_title}</strong></p>}{department.head_bio&&<p>{department.head_bio}</p>}<Link className="text-link" href={`/departments/${department.slug}`}>Visit department <ArrowRight size={14}/></Link></article>)}</div></section>}
      <div className="department-section-end"><Link className="text-link" href="/contact">Contact the Faculty <ArrowUpRight size={14}/></Link></div>
    </div></section><PublicPageBlocks scope="faculty" pageKey="services"/>
  </>;
}
