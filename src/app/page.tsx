import Link from "next/link";
import { ArrowRight, ArrowUpRight, Microscope, BookOpen, FlaskConical } from "lucide-react";

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

export default function HomePage() {
  return <>
    <section className="hero">
      <div className="hero-content">
        <span className="eyebrow">Knowledge · Discovery · Service</span>
        <h1>Where curiosity<br />becomes <em>discovery.</em></h1>
        <p>At the Faculty of Science, University of Yaoundé I, we ask bold questions, nurture scientific talent and create knowledge for Cameroon and the world.</p>
        <div className="button-row"><Link href="/faculty" className="button button-light">Discover the faculty <ArrowRight size={16} /></Link><Link href="/departments" className="button button-outline">Explore departments</Link></div>
      </div>
      <div className="hero-index"><strong>01</strong><span>/</span> A LEGACY OF LEARNING</div>
    </section>

    <section className="section"><div className="wrap intro-grid">
      <div className="intro-copy"><p className="section-kicker">A place for possibility</p><h2 className="section-heading">Science with purpose.<br />Learning for life.</h2><p>Rooted in the University of Yaoundé I, our faculty brings together dedicated educators, emerging researchers and curious minds. We connect rigorous teaching with the questions that matter to our communities.</p><Link className="text-link" href="/faculty">Meet the Faculty <ArrowRight size={15} /></Link></div>
      <div className="intro-art"><img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1000&q=80" alt="Researcher working in a science laboratory" /><div className="intro-note"><strong>1962</strong><span>Rooted in a tradition of higher learning</span></div></div>
    </div></section>

    <section className="stats-band"><div className="wrap stats-grid"><div className="stat"><strong>06</strong><span>Academic departments</span></div><div className="stat"><strong>20+</strong><span>Study pathways</span></div><div className="stat"><strong>60+</strong><span>Years of discovery</span></div><div className="stat"><strong>1</strong><span>Community, many disciplines</span></div></div></section>

    <section className="section dept-section"><div className="wrap"><div className="section-head-row"><div><p className="section-kicker">Explore our disciplines</p><h2 className="section-heading">A world of science,<br />under one faculty.</h2></div><Link className="text-link" href="/departments">All departments <ArrowRight size={15} /></Link></div><div className="card-grid">{departments.map(([n, title, desc]) => <Link href="/departments" className="dept-card" key={n}><span className="card-number">DEPARTMENT {n}</span><h3>{title}</h3><p>{desc}</p><span className="card-arrow"><ArrowUpRight size={17} /></span></Link>)}</div></div></section>

    <section className="timetable-band"><div className="wrap timetable-inner"><div><span className="eyebrow">Made for your day</span><h2>Your next class, just a few clicks away.</h2><p>Find the latest timetable by department, level, semester and academic year—no account required.</p></div><Link href="/timetables" className="button button-gold">Find your timetable <ArrowRight size={16} /></Link></div></section>

    <section className="section"><div className="wrap"><div className="section-head-row"><div><p className="section-kicker">Learn · Investigate · Contribute</p><h2 className="section-heading">Ideas that move<br />knowledge forward.</h2></div><Link className="text-link" href="/research">Discover our research <ArrowRight size={15} /></Link></div><div className="feature-grid"><article className="feature-card"><Microscope size={22} /><h3>Research that matters</h3><p>Meet the people, laboratories and ideas shaping research across our disciplines.</p><Link className="text-link" href="/research">Our research <ArrowRight size={14} /></Link></article><article className="feature-card"><BookOpen size={22} /><h3>Learning without limits</h3><p>Explore programmes designed to build deep understanding and practical capability.</p><Link className="text-link" href="/programs">Find a programme <ArrowRight size={14} /></Link></article></div></div></section>

    <section className="section updates-section"><div className="wrap updates-grid"><div><div className="section-head-row"><div><p className="section-kicker">From the faculty</p><h2 className="section-heading">Latest updates</h2></div><Link className="text-link" href="/news">All news <ArrowRight size={14} /></Link></div><div className="updates-list">{updates.map(([tag,title,date])=><article className="update-item" key={title}><span className="update-date">{tag}</span><div><h3>{title}</h3><p>{date}</p></div><ArrowUpRight size={16} color="#704c82" /></article>)}</div></div><div><p className="section-kicker">Save the date</p><h2 className="section-heading">Coming together.</h2><article className="event-box"><span className="event-date">OCTOBER 08 · 2026</span><h3>Faculty research & innovation day</h3><p>A day of talks, demonstrations and exchange across our scientific community.</p></article><p style={{marginTop:18}}><Link className="text-link" href="/events">Explore faculty events <ArrowRight size={14} /></Link></p></div></div></section>
  </>;
}
