import Link from "next/link";
import { ArrowRight, ArrowUpRight, Microscope, BookOpen, FlaskConical } from "lucide-react";
import { getActiveDepartments, getPublicRows } from "@/lib/content";
import type { ContentRow } from "@/lib/content";
import { PublicPageBlocks } from "@/components/public-page-blocks";
import { createPublicClient } from "@/lib/supabase/public";

const departments = [
  ["01", "Biological Sciences", "From molecular biology to ecosystem stewardship, exploring life at every scale."],
  ["02", "Chemistry", "Building foundational and applied knowledge for a changing world."],
  ["03", "Computer Science", "Developing computational thinking, technology and digital innovation."],
  ["04", "Earth Sciences", "Understanding the planet, its resources and its dynamic systems."],
  ["05", "Mathematics", "Advancing the language of patterns, logic and quantitative discovery."],
  ["06", "Physics", "Investigating the principles that shape matter, energy and the universe."],
];
const updates = [
  ["ACADEMIC LIFE", "Applications open for the new academic year", "Admissions · 12 September 2026"],
  ["RESEARCH", "Faculty researchers present at the Central Africa Science Forum", "Research · 04 September 2026"],
  ["CAMPUS", "Welcome week: information for new students", "Students · 28 August 2026"],
];

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const supabase = createPublicClient();
  const servicesRequest = supabase ? supabase.from("faculty_services").select("id,name,title,responsible_name,description,image_path,slug").eq("status", "published").order("sort_order").limit(3) : Promise.resolve({ data: [] as ContentRow[] });
  const [activeDepartments, livePrograms, liveResearch, liveNews, liveEvents, liveGallery, liveDocuments, servicesResult] = await Promise.all([
    getActiveDepartments(), getPublicRows("programs"), getPublicRows("research_projects"), getPublicRows("news"),
    getPublicRows("events"), getPublicRows("gallery_items"), getPublicRows("documents"), servicesRequest,
  ]);
  const liveServices = servicesResult.data ?? [];
  const departmentItems = activeDepartments.map((d: ContentRow, i) => [String(i + 1).padStart(2, "0"), d.name, d.description || "Explore teaching, research and academic life in this department.", d.slug] as const);
  const newsItems = liveNews.length ? liveNews.slice(0,3).map((x:ContentRow)=>[x.category||"FACULTY",x.title,x.published_at?new Date(x.published_at).toLocaleDateString("en",{dateStyle:"medium"}):"Latest faculty update",x.slug] as const) : updates.map(([tag,title,date])=>[tag,title,date,""] as const);
  return <>
    <section className="hero">
      <div className="hero-content">
        <span className="eyebrow">Knowledge · Discovery · Service</span>
        <h1>Where curiosity<br />becomes <em>discovery.</em></h1>
        <p>At the Faculty of Science, University of Yaoundé I, we ask bold questions, nurture scientific talent and create knowledge for Cameroon and the world.</p>
        <div className="button-row"><Link href="/about" className="button button-light">Discover the faculty <ArrowRight size={16} /></Link><Link href="/departments" className="button button-outline">Explore departments</Link></div>
      </div>
      <div className="hero-index"><strong>01</strong><span>/</span> A LEGACY OF LEARNING</div>
    </section>

    <section className="section faculty-services-home"><div className="wrap"><div className="section-head-row"><div><p className="section-kicker">Leadership · Administration · Student support</p><h2 className="section-heading">Faculty services and administration.</h2><p className="section-lead">Meet the offices and people who support the academic and administrative life of the Faculty.</p></div><Link className="text-link" href="/services">View Faculty Services <ArrowRight size={14}/></Link></div>{liveServices.length?<div className="resource-grid">{liveServices.map((service:ContentRow)=><article className="resource-card faculty-service-home-card" key={service.id}>{service.image_path&&<img src={service.image_path} alt={service.responsible_name||service.name}/>}<p className="section-kicker">{service.title||"Faculty service"}</p><h3>{service.name}</h3>{service.responsible_name&&<p><strong>{service.responsible_name}</strong></p>}<p>{service.description}</p></article>)}</div>:<p className="section-lead">Faculty leadership, academic administration and student support services will appear here when published.</p>}</div></section>

    <section className="section"><div className="wrap intro-grid">
      <div className="intro-copy"><p className="section-kicker">A place for possibility</p><h2 className="section-heading">Science with purpose.<br />Learning for life.</h2><p>Rooted in the University of Yaoundé I, our faculty brings together dedicated educators, emerging researchers and curious minds. We connect rigorous teaching with the questions that matter to our communities.</p><Link className="text-link" href="/about">Meet the Faculty <ArrowRight size={15} /></Link></div>
      <div className="intro-art"><img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80" alt="Researcher working in a science laboratory" /><div className="intro-note"><strong>1962</strong><span>Rooted in a tradition of higher learning</span></div></div>
    </div></section>

    <section className="stats-band"><div className="wrap stats-grid"><div className="stat"><strong>06</strong><span>Academic departments</span></div><div className="stat"><strong>20+</strong><span>Study pathways</span></div><div className="stat"><strong>60+</strong><span>Years of discovery</span></div><div className="stat"><strong>1</strong><span>Community, many disciplines</span></div></div></section>

    <section className="section dept-section"><div className="wrap"><div className="section-head-row"><div><p className="section-kicker">Explore our disciplines</p><h2 className="section-heading">A world of science,<br />under one faculty.</h2></div><Link className="text-link" href="/departments">All departments <ArrowRight size={15} /></Link></div><div className="card-grid">{departmentItems.map(([n, title, desc, slug]) => <Link href={slug ? `/departments/${slug}` : "/departments"} className="dept-card" key={n}><span className="card-number">DEPARTMENT {n}</span><h3>{title}</h3><p>{desc}</p><span className="card-arrow"><ArrowUpRight size={17} /></span></Link>)}</div></div></section>

    <section className="timetable-band"><div className="wrap timetable-inner"><div><span className="eyebrow">Made for your day</span><h2>Your next class, just a few clicks away.</h2><p>Find the latest timetable by department, level, semester and academic year—no account required.</p></div><Link href="/timetables" className="button button-gold">Find your timetable <ArrowRight size={16} /></Link></div></section>

    <section className="section"><div className="wrap"><div className="section-head-row"><div><p className="section-kicker">Learn · Investigate · Contribute</p><h2 className="section-heading">Ideas that move<br />knowledge forward.</h2></div><Link className="text-link" href="/research">Discover our research <ArrowRight size={15} /></Link></div><div className="feature-grid"><article className="feature-card"><Microscope size={22} /><h3>Research that matters</h3><p>Meet the people, laboratories and ideas shaping research across our disciplines.</p><Link className="text-link" href="/research">Our research <ArrowRight size={14} /></Link></article><article className="feature-card"><BookOpen size={22} /><h3>Learning without limits</h3><p>Explore programmes designed to build deep understanding and practical capability.</p><Link className="text-link" href="/programs">Find a programme <ArrowRight size={14} /></Link></article></div></div></section>

    <section className="section updates-section"><div className="wrap updates-grid"><div><div className="section-head-row"><div><p className="section-kicker">From the faculty</p><h2 className="section-heading">Latest updates</h2></div><Link className="text-link" href="/news-events">All news & events <ArrowRight size={14} /></Link></div><div className="updates-list">{newsItems.map(([tag,title,date,slug])=><Link href={slug?`/news/${slug}`:"/news"} className="update-item" key={title}><span className="update-date">{tag}</span><div><h3>{title}</h3><p>{date}</p></div><ArrowUpRight size={16} color="var(--purple)" /></Link>)}</div></div><div><p className="section-kicker">Save the date</p><h2 className="section-heading">Coming together.</h2><article className="event-box"><span className="event-date">{liveEvents[0]?.starts_at ? new Date(liveEvents[0].starts_at).toLocaleDateString("en",{dateStyle:"long"}) : "FACULTY CALENDAR"}</span><h3>{liveEvents[0]?.title ?? "Faculty research & innovation day"}</h3><p>{liveEvents[0]?.description ?? "A day of talks, demonstrations and exchange across our scientific community."}</p>{liveEvents[0]?.slug&&<Link className="text-link" href={`/events/${liveEvents[0].slug}`}>Event details <ArrowRight size={13}/></Link>}</article><p style={{marginTop:18}}><Link className="text-link" href="/news-events">Explore faculty news & events <ArrowRight size={14} /></Link></p></div></div></section>

    <section className="section"><div className="wrap"><div className="section-head-row"><div><p className="section-kicker">Study at the Faculty</p><h2 className="section-heading">Programmes with purpose.</h2></div><Link className="text-link" href="/programs">All programmes <ArrowRight size={14}/></Link></div>{livePrograms.length?<div className="resource-grid">{livePrograms.slice(0,3).map((p:ContentRow)=><article className="resource-card" key={p.id}><p className="section-kicker">{p.degree}</p><h2><Link href={`/programs/${p.slug}`}>{p.name}</Link></h2><p>{p.description}</p><p className="resource-context">{p.department?.name??"Faculty-wide"}{p.specialty?.name?` · ${p.specialty.name}`:""}</p></article>)}</div>:<p className="section-lead">Programmes are organized by department and specialty. Browse the academic pathways available across the Faculty.</p>}</div></section>
    <section className="section updates-section"><div className="wrap"><div className="section-head-row"><div><p className="section-kicker">Scientific activity</p><h2 className="section-heading">Research and discovery.</h2></div><Link className="text-link" href="/research">All research <ArrowRight size={14}/></Link></div>{liveResearch.length?<div className="resource-grid">{liveResearch.slice(0,3).map((r:ContentRow)=><article className="resource-card" key={r.id}><p className="section-kicker">{r.lead_name||"Research project"}</p><h2><Link href={`/research/${r.slug}`}>{r.title}</Link></h2><p>{r.summary}</p><p className="resource-context">{r.department?.name??"Faculty-wide"}{r.specialty?.name?` · ${r.specialty.name}`:""}</p></article>)}</div>:<p className="section-lead">Explore faculty research by department and specialty, and meet the teams working on local and global questions.</p>}</div></section>
    <section className="section"><div className="wrap"><div className="section-head-row"><div><p className="section-kicker">Campus life</p><h2 className="section-heading">A community at work.</h2></div><Link className="text-link" href="/gallery">See the full gallery <ArrowRight size={14}/></Link></div>{liveGallery.length?<div className="resource-grid">{liveGallery.slice(0,3).map((g:ContentRow)=><article className="resource-card" key={g.id}><Link href={g.related_event?.slug?`/events/${g.related_event.slug}`:g.related_research?.slug?`/research/${g.related_research.slug}`:g.specialty?.slug&&g.department?.slug?`/departments/${g.department.slug}/specialties/${g.specialty.slug}`:g.department?.slug?`/departments/${g.department.slug}`:"/gallery"}>{g.image_path&&<img src={g.image_path} alt={g.title} />}</Link><p className="section-kicker">{g.category}</p><h2>{g.title}</h2><p>{g.description}</p>{(g.related_event||g.related_research||g.department)&&<p className="resource-context">{g.related_event?.title??g.related_research?.title??g.specialty?.name??g.department?.name}</p>}</article>)}</div>:<p className="section-lead">Discover teaching, research and community activities through the Faculty gallery.</p>}<div className="document-callout"><div><p className="section-kicker">Student resources</p><h2 className="section-heading">Documentation and academic information.</h2><p>Find public calendars, guides, forms and faculty notices.</p></div><Link className="button button-primary" href="/documents">Browse documentation <ArrowRight size={15}/></Link><span className="document-count">{liveDocuments.length?`${liveDocuments.length} published resources`:"Public resources"}</span></div></div></section>
    <PublicPageBlocks scope="faculty" pageKey="home" />
  </>;
}
