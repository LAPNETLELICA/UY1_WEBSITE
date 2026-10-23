import Link from "next/link";
import { ArrowRight, ArrowUpRight, Microscope, BookOpen, FlaskConical, Calendar, Download, CheckCircle2, GraduationCap } from "lucide-react";
import { DEPARTMENT_IMAGES, getActiveDepartments, getPublicRows } from "@/lib/content";
import type { ContentRow } from "@/lib/content";
import { PublicPageBlocks } from "@/components/public-page-blocks";
import { createPublicClient } from "@/lib/supabase/public";
import { LocalizedDate } from "@/components/language-provider";
import { HomeHero } from "@/components/home-hero";
import { facultyLeaders, resolveDepartmentCover } from "@/lib/department-media";
import { ScrollImageReveal } from "@/components/scroll-image-reveal";
import { TextSplitReveal } from "@/components/ui/text-split-reveal";
import { HomeStats } from "@/components/home-stats";
import { ParallaxImageReveal } from "@/components/parallax-image-reveal";
import { ResearchParallaxSection } from "@/components/research-parallax-section";

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

const defaultPrograms = [
  {
    id: "prog-cs",
    name: "Bachelor in Computer Science",
    degree: "Licence / Bachelor",
    cycle: "Cycle Fondamental",
    level: "Niveau 1–3",
    description: "Algorithms, software engineering, systems and digital innovation.",
    image_path: "/images/faculty/edb7fdd738804800b060c69e59d1b6d8.png",
    department: { name: "Computer Science", slug: "computer-science" },
    slug: "computer-science",
  },
  {
    id: "prog-bioch",
    name: "Master in Biochemistry & Biotechnology",
    degree: "Master of Science",
    cycle: "Cycle Approfondi",
    level: "Niveau 4–5",
    description: "Molecular biology, pharmacology and natural bioresources valorization.",
    image_path: "/images/faculty/5cf327f811d74be29b075eb21c38a5ff (Edited 2).png",
    department: { name: "Biochemistry", slug: "biochemistry" },
    slug: "biochemistry",
  },
  {
    id: "prog-phys",
    name: "Doctorate in Materials Physics & Energy",
    degree: "Doctorat / Ph.D.",
    cycle: "Recherche Doctorale",
    level: "Thèse",
    description: "Nanomaterials, renewable energy systems and computational physics.",
    image_path: "/images/faculty/5919450fabb14b379a92af9f8575e49f (Edited 3).png",
    department: { name: "Physics", slug: "physics" },
    slug: "physics",
  },
];

const defaultResearch = [
  {
    id: "res-phyto",
    title: "Natural Substances & Phyto-Chemistry",
    lead_name: "Unité Phytochimie & Pharmacognosie",
    summary: "Extraction of bioactive agents from Cameroon medicinal plants and bio-control.",
    image_path: "/images/faculty/4192ff7d4e9a442ab2de89125a75f87b.png",
    department: { name: "Chemistry", slug: "chemistry" },
    slug: "natural-substances",
  },
  {
    id: "res-ai",
    title: "Artificial Intelligence & Modeling",
    lead_name: "Lab. de Recherche en Informatique (LRI)",
    summary: "Machine learning for environmental monitoring and health diagnostics.",
    image_path: "/images/faculty/edb7fdd738804800b060c69e59d1b6d8.png",
    department: { name: "Computer Science", slug: "computer-science" },
    slug: "artificial-intelligence",
  },
  {
    id: "res-earth",
    title: "Georesources, Water & Environment",
    lead_name: "Équipe Géosciences Appliquées",
    summary: "Aquifer dynamics, seismic risk mapping and sustainable resources in Central Africa.",
    image_path: "/images/faculty/8ce3ed7f2968499eaf7b365c61955c35 (Edited 2).png",
    department: { name: "Earth Sciences", slug: "earth-sciences" },
    slug: "georesources-and-water",
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createPublicClient();
  const servicesRequest = supabase
    ? supabase
        .from("faculty_services")
        .select("id,name,title,responsible_name,description,image_path,slug")
        .eq("status", "published")
        .order("sort_order")
        .limit(3)
    : Promise.resolve({ data: [] as ContentRow[] });

  const [
    activeDepartments,
    livePrograms,
    liveResearch,
    liveNews,
    liveEvents,
    liveGallery,
    liveDocuments,
    servicesResult,
  ] = await Promise.all([
    getActiveDepartments(),
    getPublicRows("programs"),
    getPublicRows("research_projects"),
    getPublicRows("news"),
    getPublicRows("events"),
    getPublicRows("gallery_items"),
    getPublicRows("documents"),
    servicesRequest,
  ]);

  const liveServices = servicesResult.data ?? [];

  const departmentItems = activeDepartments.map((d: ContentRow, i) => [
    String(i + 1).padStart(2, "0"),
    d.name,
    d.description || "Explore teaching, research and academic life in this department.",
    d.slug,
    resolveDepartmentCover(
      d.image_path,
      d.slug,
      DEPARTMENT_IMAGES[d.slug] || DEPARTMENT_IMAGES[Object.keys(DEPARTMENT_IMAGES)[i % Object.keys(DEPARTMENT_IMAGES).length]]
    ),
  ] as const);

  const newsItems = liveNews.length
    ? liveNews.slice(0, 3).map((x: ContentRow) => [
        x.category || "FACULTY",
        x.title,
        x.published_at || "Latest faculty update",
        x.slug,
      ] as const)
    : updates.map(([tag, title, date]) => [tag, title, date, ""] as const);

  const displayPrograms = livePrograms.length ? livePrograms.slice(0, 3) : defaultPrograms;
  const displayResearch = liveResearch.length ? liveResearch.slice(0, 3) : defaultResearch;

  return (
    <div className="home-page">
      {/* 1. Hero & Fast Access Ribbon */}
      <HomeHero />

      {/* 2. Key Figures & Scale of Discovery (Stanford Style with Scroll-Triggered Animated Counters) */}
      <HomeStats />

      {/* 3. Purpose & Heritage (Oxford / Harvard / UCL Editorial Layout) */}
      <section className="section home-intro-section" aria-labelledby="intro-heading">
        <div className="wrap intro-grid home-intro-grid">
          <div className="intro-copy home-intro-copy">
            <div className="home-intro-kicker-wrap">
              <span className="home-intro-kicker-dot" aria-hidden="true" />
              <p className="section-kicker home-intro-kicker">A place for possibility</p>
            </div>
            <h2 id="intro-heading" className="section-heading home-intro-heading">
              <span className="home-intro-line">Science with purpose.</span>
              <span className="home-intro-line home-intro-line-accent">Learning for life.</span>
            </h2>
            <p className="home-intro-lead-text">
              Rooted in the University of Yaoundé I, our faculty brings together dedicated educators, emerging researchers and curious minds. We connect rigorous teaching with the questions that matter to our communities.
            </p>
            <div className="home-intro-actions">
              <Link className="home-intro-cta-button" href="/about">
                <span>Meet the Faculty</span>
                <ArrowRight size={16} className="cta-arrow" />
              </Link>
            </div>
          </div>

          <div className="intro-art home-intro-art">
            <div className="home-art-frame">
              <ScrollImageReveal
                src="/images/faculty/5cf327f811d74be29b075eb21c38a5ff (Edited 4).png"
                alt="Students and staff working in a UY1 science laboratory"
                direction="up"
                className="home-intro-reveal"
              />
            </div>
            <div className="intro-note home-intro-note">
              <strong>1962</strong>
              <span>Rooted in a tradition of higher learning</span>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Transition: Parallax Fullscreen Reveal */}
      <ParallaxImageReveal />

      {/* 4. Academic Disciplines Directory (MIT / Stanford Visual Cards) */}
      <section className="section dept-section home-dept-section" id="departments" aria-labelledby="dept-heading">
        <div className="wrap">
          <div className="section-head-row home-section-head">
            <div>
              <p className="section-kicker">Explore our disciplines</p>
              <h2 id="dept-heading" className="section-heading">
                A world of science,<br />under one faculty.
              </h2>
            </div>
            <Link className="text-link home-head-link" href="/departments">
              All departments <ArrowRight size={15} />
            </Link>
          </div>

          <div className="card-grid home-dept-grid">
            {departmentItems.map(([n, title, desc, slug, image]) => (
              <Link
                href={slug ? `/departments/${slug}` : "/departments"}
                className="dept-card department-visual-card home-dept-card"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(31,17,45,.25) 0%, rgba(31,17,45,.92) 80%), url("${image}")`,
                }}
                key={n}
              >
                <div className="home-dept-card-top">
                  <span className="card-number">DEPARTMENT {n}</span>
                </div>
                <div className="home-dept-card-body">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <span className="card-arrow home-dept-card-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Public Timetable Access (Utilitarian Highlight) */}
      <section className="timetable-band home-timetable-band" aria-labelledby="timetable-heading">
        <div className="wrap timetable-inner home-timetable-inner">
          <div className="home-timetable-copy">
            <span className="eyebrow">Made for your day</span>
            <h2 id="timetable-heading">Your next class, just a few clicks away.</h2>
            <p>
              Find the latest timetable by department, level, semester and academic year—no account required.
            </p>
            <div className="home-timetable-highlights">
              <span><CheckCircle2 size={14} /> Open access for all students</span>
              <span><CheckCircle2 size={14} /> Downloadable PDF documents</span>
              <span><CheckCircle2 size={14} /> Official academic schedules</span>
            </div>
          </div>
          <div className="home-timetable-cta">
            <Link href="/timetables" className="button button-gold button-sweep">
              Find your timetable <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Scientific Discovery & Academic Pathways (Harvard / MIT Feature Grid) */}
      <section className="section home-feature-split-section" aria-labelledby="horizons-heading">
        <div className="wrap">
          <div className="section-head-row home-section-head">
            <div>
              <p className="section-kicker">Learn · Investigate · Contribute</p>
              <h2 id="horizons-heading" className="section-heading">
                Ideas that move<br />knowledge forward.
              </h2>
            </div>
            <Link className="text-link home-head-link" href="/research">
              Discover our research <ArrowRight size={15} />
            </Link>
          </div>

          <div className="feature-grid home-feature-grid">
            <article className="feature-card home-feature-card">
              <div className="home-feature-icon-wrap">
                <Microscope size={24} />
              </div>
              <h3>Research that matters</h3>
              <p>Meet the people, laboratories and ideas shaping research across our disciplines.</p>
              <Link className="text-link" href="/research">
                Our research <ArrowRight size={14} />
              </Link>
            </article>

            <article className="feature-card home-feature-card">
              <div className="home-feature-icon-wrap">
                <BookOpen size={24} />
              </div>
              <h3>Learning without limits</h3>
              <p>Explore programmes designed to build deep understanding and practical capability.</p>
              <Link className="text-link" href="/programs">
                Find a programme <ArrowRight size={14} />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* 7. Editorial Chronicle: News & Events (MIT Style Spotlight) */}
      <section className="section updates-section home-chronicle-section" aria-labelledby="updates-heading">
        <div className="wrap updates-grid home-updates-grid">
          {/* Left Column: News Items */}
          <div className="home-news-column">
            <div className="section-head-row home-section-head">
              <div>
                <p className="section-kicker">From the faculty</p>
                <h2 id="updates-heading" className="section-heading">Latest updates</h2>
              </div>
              <Link className="text-link home-head-link" href="/news-events">
                All news & events <ArrowRight size={14} />
              </Link>
            </div>

            <div className="updates-list home-updates-list">
              {newsItems.map(([tag, title, date, slug]) => (
                <Link
                  href={slug ? `/news/${slug}` : "/news-events"}
                  className="update-item home-update-item"
                  key={title}
                >
                  <span className="update-date">{tag}</span>
                  <div className="home-update-content">
                    <h3>{title}</h3>
                    <p>
                      {/^\d{4}-\d{2}-\d{2}/.test(date) ? (
                        <LocalizedDate value={date} dateStyle="medium" />
                      ) : (
                        date
                      )}
                    </p>
                  </div>
                  <span className="home-update-arrow">
                    <ArrowUpRight size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Events & Calendar */}
          <div className="home-events-column">
            <div className="section-head-row home-section-head">
              <div>
                <p className="section-kicker">Save the date</p>
                <h2 className="section-heading">Coming together.</h2>
              </div>
            </div>

            <article className="event-box home-event-box">
              <div className="home-event-date-stamp">
                <Calendar size={14} />
                <span className="event-date">
                  {liveEvents[0]?.starts_at ? (
                    <LocalizedDate value={liveEvents[0].starts_at} dateStyle="long" />
                  ) : (
                    "FACULTY CALENDAR"
                  )}
                </span>
              </div>
              <h3>
                {liveEvents[0]?.title ?? "Faculty research & innovation day"}
              </h3>
              <p>
                {liveEvents[0]?.description ??
                  "A day of talks, demonstrations and exchange across our scientific community."}
              </p>
              {liveEvents[0]?.slug && (
                <div className="home-event-action">
                  <Link className="text-link" href={`/events/${liveEvents[0].slug}`}>
                    Event details <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </article>

            <div className="home-events-footer">
              <Link className="text-link" href="/news-events">
                Explore faculty news & events <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Academic Pathways & Degrees (Visual Showcase with Images & Animations) */}
      <section className="section home-programs-section" aria-labelledby="programs-heading">
        <div className="wrap">
          <div className="section-head-row home-section-head">
            <div>
              <p className="section-kicker">Study at the Faculty</p>
              <h2 id="programs-heading" className="section-heading">
                Programmes with purpose.
              </h2>
              <p className="section-lead">
                Explore pathways across departments, from foundational study to advanced specialisation.
              </p>
            </div>
            <Link className="text-link home-head-link" href="/programs">
              All programmes <ArrowRight size={14} />
            </Link>
          </div>

          <div className="resource-grid home-academic-grid">
            {displayPrograms.map((p: any, index: number) => {
              const coverImg =
                p.image_path ||
                (p.department?.slug && DEPARTMENT_IMAGES[p.department.slug]) ||
                "/images/faculty/edb7fdd738804800b060c69e59d1b6d8.png";
              const targetHref = p.slug ? (p.department?.slug ? `/departments/${p.department.slug}/programs` : `/programs/${p.slug}`) : "/programs";

              return (
                <article
                  className="resource-card home-academic-card"
                  key={p.id || index}
                  style={{ "--card-index": index } as React.CSSProperties}
                >
                  <Link href={targetHref} className="home-academic-media-link" tabIndex={-1} aria-hidden="true">
                    <div className="home-academic-img-wrap">
                      <ScrollImageReveal
                        src={coverImg}
                        alt={p.name}
                        direction="up"
                        className="home-card-reveal"
                        overlay={
                          <span className="home-card-floating-badge">
                            <GraduationCap size={12} />
                            {p.degree || "Licence / Master"}
                          </span>
                        }
                      />
                    </div>
                  </Link>

                  <div className="home-academic-card-body">
                    <div className="home-card-context-row">
                      <span className="home-card-dept-tag">
                        {p.department?.name ?? "Faculty-wide"}
                        {p.specialty?.name ? ` · ${p.specialty.name}` : ""}
                      </span>
                    </div>

                    <h2>
                      <Link href={targetHref}>{p.name}</Link>
                    </h2>

                    <p>{p.description || "Discover high-level academic training and research opportunities in this discipline."}</p>

                    <div className="home-academic-card-footer">
                      <Link className="text-link" href={targetHref}>
                        View programme <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Scientific Research Activity (Visual Showcase with Images & Animations) */}
      <ResearchParallaxSection>
        <div className="wrap">
          <div className="section-head-row home-section-head">
            <div>
              <p className="section-kicker">Scientific activity</p>
              <h2 id="research-heading" className="section-heading">
                Research and discovery.
              </h2>
              <p className="section-lead">
                Explore faculty research by department and specialty, and meet the teams working on local and global questions.
              </p>
            </div>
            <Link className="text-link home-head-link" href="/research">
              All research <ArrowRight size={14} />
            </Link>
          </div>

          <div className="resource-grid home-academic-grid">
            {displayResearch.map((r: any, index: number) => {
              const coverImg =
                r.image_path ||
                (r.department?.slug && DEPARTMENT_IMAGES[r.department.slug]) ||
                "/images/faculty/4192ff7d4e9a442ab2de89125a75f87b.png";
              const targetHref = r.slug ? `/research/${r.slug}` : "/research";

              return (
                <article
                  className="resource-card home-academic-card"
                  key={r.id || index}
                  style={{ "--card-index": index } as React.CSSProperties}
                >
                  <Link href={targetHref} className="home-academic-media-link" tabIndex={-1} aria-hidden="true">
                    <div className="home-academic-img-wrap">
                      <ScrollImageReveal
                        src={coverImg}
                        alt={r.title}
                        direction="up"
                        className="home-card-reveal"
                        overlay={
                          <span className="home-card-floating-badge home-research-floating-badge">
                            <FlaskConical size={12} />
                            {r.lead_name || "Research Team"}
                          </span>
                        }
                      />
                    </div>
                  </Link>

                  <div className="home-academic-card-body">
                    <div className="home-card-context-row">
                      <span className="home-card-dept-tag">
                        {r.department?.name ?? "Faculty-wide"}
                        {r.specialty?.name ? ` · ${r.specialty.name}` : ""}
                      </span>
                    </div>

                    <h2>
                      <Link href={targetHref}>{r.title}</Link>
                    </h2>

                    <p>{r.summary || "Advancing frontiers of science with impactful research addressing contemporary challenges."}</p>

                    <div className="home-academic-card-footer">
                      <Link className="text-link" href={targetHref}>
                        Discover project <ArrowUpRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </ResearchParallaxSection>

      {/* 10. Leadership & Faculty Services Governance */}
      <section className="section faculty-services-home home-leadership-section" aria-labelledby="services-heading">
        <div className="wrap">
          <div className="section-head-row home-section-head">
            <div>
              <p className="section-kicker">Leadership · Administration · Student support</p>
              <h2 id="services-heading" className="section-heading">
                Faculty services and administration.
              </h2>
              <p className="section-lead">
                Meet the offices and people who support the academic and administrative life of the Faculty.
              </p>
            </div>
            <Link className="text-link home-head-link" href="/services">
              View Faculty Services <ArrowRight size={14} />
            </Link>
          </div>

          {/* Distinguished Academic Governance (Rector / Dean) */}
          <div className="faculty-leader-grid faculty-leadership-in-services home-governance-grid">
            {facultyLeaders.map((leader) => (
              <article className="faculty-leader-card home-leader-card" key={leader.role}>
                <div className="home-leader-photo-wrap">
                  <img src={leader.imagePath} alt={`${leader.name}, ${leader.role}`} />
                </div>
                <div className="home-leader-details">
                  <p className="section-kicker">{leader.role}</p>
                  <h3>{leader.name}</h3>
                  <p>{leader.summary}</p>
                  <Link className="text-link" href="/services">
                    Learn about administration <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Published University Services */}
          {liveServices.length ? (
            <div className="resource-grid home-services-grid">
              {liveServices.map((service: ContentRow) => (
                <article className="resource-card faculty-service-home-card home-service-card" key={service.id}>
                  {service.image_path && (
                    <img src={service.image_path} alt={service.responsible_name || service.name} />
                  )}
                  <p className="section-kicker">{service.title || "Faculty service"}</p>
                  <h3>{service.name}</h3>
                  {service.responsible_name && (
                    <p className="home-service-officer">
                      <strong>{service.responsible_name}</strong>
                    </p>
                  )}
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="section-lead">
              Faculty leadership, academic administration and student support services will appear here when published.
            </p>
          )}
        </div>
      </section>

      {/* 11. Campus Life Gallery & Official Documentation Depository */}
      <section className="section home-campus-section" aria-labelledby="gallery-heading">
        <div className="wrap">
          <div className="section-head-row home-section-head">
            <div className="home-campus-intro-card">
              <p className="section-kicker">Campus life</p>
              <h2 id="gallery-heading" className="section-heading">
                A community at work.
              </h2>
              <p className="section-lead home-campus-intro-lead">
                Discover teaching, research and community activities through the Faculty gallery.
              </p>
            </div>
            <Link className="text-link home-head-link" href="/gallery">
              See the full gallery <ArrowRight size={14} />
            </Link>
          </div>

          {liveGallery.length ? (
            <div className="resource-grid home-gallery-grid">
              {liveGallery.slice(0, 3).map((g: ContentRow) => (
                <article className="resource-card home-gallery-card" key={g.id}>
                  <Link
                    href={
                      g.related_event?.slug
                        ? `/events/${g.related_event.slug}`
                        : g.related_research?.slug
                        ? `/research/${g.related_research.slug}`
                        : g.specialty?.slug && g.department?.slug
                        ? `/departments/${g.department.slug}/specialties/${g.specialty.slug}`
                        : g.department?.slug
                        ? `/departments/${g.department.slug}`
                        : "/gallery"
                    }
                    className="home-gallery-link"
                  >
                    {g.image_path && (
                      <div className="home-gallery-img-wrap">
                        <ScrollImageReveal
                          src={g.image_path}
                          alt={g.title}
                          direction="up"
                          className="home-card-reveal"
                        />
                      </div>
                    )}
                  </Link>
                  <p className="section-kicker">{g.category}</p>
                  <h2>{g.title}</h2>
                  <p>{g.description}</p>
                  {(g.related_event || g.related_research || g.department) && (
                    <p className="resource-context">
                      {g.related_event?.title ??
                        g.related_research?.title ??
                        g.specialty?.name ??
                        g.department?.name}
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : null}

          {/* Official Documentation Banner */}
          <div className="document-callout home-document-callout">
            <div className="home-doc-copy">
              <p className="section-kicker">Student resources</p>
              <h2 className="section-heading">Documentation and academic information.</h2>
              <p>Find public calendars, guides, forms and faculty notices.</p>
            </div>
            <div className="home-doc-actions">
              <Link className="button button-primary button-sweep" href="/documents">
                Browse documentation <ArrowRight size={15} />
              </Link>
              <span className="document-count">
                {liveDocuments.length
                  ? `${liveDocuments.length} published resources`
                  : "Public resources"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Dynamic CMS Sections */}
      <PublicPageBlocks scope="faculty" pageKey="home" />
    </div>
  );
}
