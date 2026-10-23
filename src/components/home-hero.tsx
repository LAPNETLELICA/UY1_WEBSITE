"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Building2,
  FlaskConical,
  BookOpen,
  FileText,
  Search,
  X,
  GraduationCap,
} from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { TextSplitReveal } from "@/components/ui/text-split-reveal";
import { useTranslation } from "@/components/language-provider";

const slides = [
  {
    image: "/images/faculty/Home/21.png",
    titleFirst: { en: "Welcome to", fr: "Bienvenue à" },
    titleSecond: { en: "Ngoa-Ekélé", fr: "Ngoa-Ekélé" },
    description: {
      en: "Discover the Faculty of Science at the heart of the University of Yaoundé I, where curiosity opens new paths for Cameroon and beyond.",
      fr: "Découvrez la Faculté des Sciences au cœur de l’Université de Yaoundé I, où la curiosité ouvre de nouvelles voies pour le Cameroun et le monde.",
    },
    action: { en: "Discover the Faculty", fr: "Découvrir la Faculté" },
    href: "/about",
  },
  {
    image: "/images/faculty/Home/2.png",
    titleFirst: { en: "A campus open", fr: "Un campus ouvert" },
    titleSecond: { en: "to the world", fr: "sur le monde" },
    description: {
      en: "Join a vibrant university community in Ngoa-Ekélé and build your future through science, learning and collaboration.",
      fr: "Rejoignez une communauté universitaire vivante à Ngoa-Ekélé et construisez votre avenir par les sciences, l’apprentissage et le partage.",
    },
    action: { en: "Explore our departments", fr: "Explorer nos départements" },
    href: "/departments",
  },
  {
    image: "/images/faculty/Home/3.png",
    titleFirst: { en: "Learn science.", fr: "Apprendre les sciences." },
    titleSecond: { en: "Shape tomorrow.", fr: "Préparer demain." },
    description: {
      en: "Eight scientific departments bring together teaching, practical learning and new ideas for the next generation.",
      fr: "Huit départements scientifiques réunissent enseignement, pratique et nouvelles idées pour accompagner la prochaine génération.",
    },
    action: { en: "View our programmes", fr: "Voir nos programmes" },
    href: "/programs",
  },
  {
    image: "/images/faculty/Home/4.png",
    titleFirst: { en: "Innovation for", fr: "Innover pour" },
    titleSecond: { en: "Africa’s future", fr: "l’avenir de l’Afrique" },
    description: {
      en: "From digital technologies to engineering, our researchers and students turn scientific ideas into practical solutions.",
      fr: "Du numérique à l’ingénierie, nos chercheurs et étudiants transforment les idées scientifiques en solutions concrètes.",
    },
    action: { en: "Explore our research", fr: "Explorer notre recherche" },
    href: "/research",
  },
  {
    image: "/images/faculty/Home/5.png",
    titleFirst: { en: "Research that", fr: "Une recherche" },
    titleSecond: { en: "serves society", fr: "au service de la société" },
    description: {
      en: "Our laboratories investigate health, biodiversity, materials and the environment to address challenges that matter to our communities.",
      fr: "Nos laboratoires étudient la santé, la biodiversité, les matériaux et l’environnement pour répondre aux défis de nos communautés.",
    },
    action: { en: "Discover our research", fr: "Découvrir notre recherche" },
    href: "/research",
  },
];

const quickGateways = [
  { label: "Class timetables", href: "/timetables", icon: Calendar },
  { label: "All departments", href: "/departments", icon: Building2 },
  { label: "Our research", href: "/research", icon: FlaskConical },
  { label: "All programmes", href: "/programs", icon: BookOpen },
  { label: "Documents & resources", href: "/documents", icon: FileText },
];

interface SearchItem {
  id: string;
  title: string;
  category: "Departments" | "Programs" | "Timetables" | "Research" | "Documents";
  description: string;
  href: string;
  keywords: string[];
}

const SEARCH_DATABASE: SearchItem[] = [
  // Departments
  {
    id: "dep-cs",
    title: "Computer Science",
    category: "Departments",
    description: "Algorithmique, génie logiciel, IA, réseaux et cybersécurité",
    href: "/departments/computer-science",
    keywords: ["informatique", "computer", "science", "software", "programmation", "code", "ai", "ia", "algorithme", "data"],
  },
  {
    id: "dep-math",
    title: "Mathematics",
    category: "Departments",
    description: "Mathématiques fondamentales et appliquées, statistiques et modélisation",
    href: "/departments/mathematics",
    keywords: ["mathematiques", "mathematics", "maths", "statistiques", "analyse", "algebre", "probabilites"],
  },
  {
    id: "dep-phys",
    title: "Physics",
    category: "Departments",
    description: "Physique des matériaux, mécanique, optique, électronique, énergie",
    href: "/departments/physics",
    keywords: ["physique", "physics", "energie", "materiaux", "optique", "mecanique", "electronique"],
  },
  {
    id: "dep-chem",
    title: "Chemistry",
    category: "Departments",
    description: "Chimie organique, inorganique, environnement et phytochimie",
    href: "/departments/chemistry",
    keywords: ["chimie", "chemistry", "organique", "minerale", "substances naturelles", "laboratoire"],
  },
  {
    id: "dep-bioch",
    title: "Biochemistry",
    category: "Departments",
    description: "Biologie moléculaire, pharmacologie, biotechnologies et nutrition",
    href: "/departments/biochemistry",
    keywords: ["biochimie", "biochemistry", "biotechnologies", "moleculaire", "sante", "pharmacologie"],
  },
  {
    id: "dep-anibio",
    title: "Animal Biology and Physiology",
    category: "Departments",
    description: "Zoologie, écologie animale, parasitologie et physiologie",
    href: "/departments/animal-biology-and-physiology",
    keywords: ["biologie animale", "animal biology", "zoologie", "parasitologie", "physiologie", "biodiversite"],
  },
  {
    id: "dep-plntbio",
    title: "Plant Biology and Physiology",
    category: "Departments",
    description: "Botanique, pathologie végétale, biotechnologie végétale",
    href: "/departments/plant-biology-and-physiology",
    keywords: ["biologie vegetale", "plant biology", "botanique", "plantes", "foret", "agronomie"],
  },
  {
    id: "dep-earth",
    title: "Earth Sciences",
    category: "Departments",
    description: "Géologie, géophysique, hydrologie et ressources minières",
    href: "/departments/earth-sciences",
    keywords: ["sciences de la terre", "earth sciences", "geologie", "mines", "geophysique", "eau", "environnement"],
  },
  // Programs
  {
    id: "prog-lic-cs",
    title: "Bachelor in Computer Science",
    category: "Programs",
    description: "Licence en Informatique Fondamentale et Appliquée (L1, L2, L3)",
    href: "/programs",
    keywords: ["licence", "informatique", "bachelor", "l1", "l2", "l3", "developpeur", "systeme"],
  },
  {
    id: "prog-msc-bioch",
    title: "Master in Biochemistry & Biotechnology",
    category: "Programs",
    description: "Master recherche et professionnel en biotechnologies et santé",
    href: "/programs",
    keywords: ["master", "biochimie", "biotechnologies", "m1", "m2", "sante"],
  },
  {
    id: "prog-phd-phys",
    title: "Doctorate in Materials Physics & Energy",
    category: "Programs",
    description: "Doctorat / Ph.D. en nanosciences et énergies renouvelables",
    href: "/programs",
    keywords: ["doctorat", "phd", "physique", "materiaux", "these", "recherche"],
  },
  {
    id: "prog-all",
    title: "All Academic Programmes",
    category: "Programs",
    description: "Explorer l'ensemble des parcours Licence, Master et Doctorat",
    href: "/programs",
    keywords: ["formations", "programmes", "cursus", "etudes", "diplomes", "licence", "master", "doctorat"],
  },
  // Timetables
  {
    id: "time-all",
    title: "Class timetables",
    category: "Timetables",
    description: "Consulter les emplois du temps par département, niveau et semestre",
    href: "/timetables",
    keywords: ["emplois du temps", "emploi du temps", "timetables", "cours", "horaires", "salle", "planning", "agenda"],
  },
  // Research
  {
    id: "res-all",
    title: "Our research & laboratories",
    category: "Research",
    description: "Unités de recherche, laboratoires d'excellence et publications scientifiques",
    href: "/research",
    keywords: ["recherche", "laboratoire", "research", "laboratoires", "publications", "projets", "scientifiques"],
  },
  // Documents
  {
    id: "doc-all",
    title: "Academic calendar & regulations",
    category: "Documents",
    description: "Calendrier académique officiel, guides de l'étudiant et formulaires",
    href: "/documents",
    keywords: ["documents", "calendrier", "guide", "formulaires", "reglement", "inscription", "notes"],
  },
];

export function HomeHero() {
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { locale } = useTranslation();

  const [active, setActive] = useState(0);
  const activeSlide = slides[active];

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchListboxId = useId();

  // Touch gesture state for horizontal swipe on mobile
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const goTo = (next: number) => {
    setActive((next + slides.length) % slides.length);
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => goTo(active + 1), 6000);
    return () => window.clearInterval(timer);
  }, [active]);

  // Handle outside clicks to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter items based on query
  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_DATABASE.filter((item) => {
      if (item.title.toLowerCase().includes(q)) return true;
      if (item.description.toLowerCase().includes(q)) return true;
      return item.keywords.some((k) => k.toLowerCase().includes(q));
    }).slice(0, 7);
  }, [searchQuery]);

  const handleSelectResult = (item: SearchItem) => {
    setIsOpen(false);
    setSearchQuery("");
    router.push(item.href);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
      handleSelectResult(filteredResults[selectedIndex]);
      return;
    }
    if (filteredResults.length > 0) {
      handleSelectResult(filteredResults[0]);
      return;
    }
    const q = searchQuery.trim();
    if (q) {
      setIsOpen(false);
      router.push(`/departments?search=${encodeURIComponent(q)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      goTo(active + 1); // Swipe left -> next slide
    } else if (distance < -50) {
      goTo(active - 1); // Swipe right -> prev slide
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const getCategoryIcon = (category: SearchItem["category"]) => {
    switch (category) {
      case "Departments":
        return <Building2 size={15} className="hero-search-item-icon" />;
      case "Programs":
        return <GraduationCap size={15} className="hero-search-item-icon" />;
      case "Timetables":
        return <Calendar size={15} className="hero-search-item-icon" />;
      case "Research":
        return <FlaskConical size={15} className="hero-search-item-icon" />;
      case "Documents":
        return <FileText size={15} className="hero-search-item-icon" />;
      default:
        return <Search size={15} className="hero-search-item-icon" />;
    }
  };

  return (
    <section
      className="hero home-hero"
      aria-roledescription="carousel"
      aria-label="Faculty highlights"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* HORIZONTAL SLIDING IMAGE TRACK (VISIBILITY ENHANCED) */}
      <div className="home-hero-media" aria-hidden="true">
        <div
          className="home-hero-track"
          style={{ transform: `translate3d(-${active * 100}%, 0, 0)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.image}
              className={`home-hero-slide ${index === active ? "is-active" : ""}`}
              style={{ backgroundImage: `url("${slide.image}")` }}
            />
          ))}
        </div>
      </div>

      {/* REFINED SCRIM - ALLOWS IMAGES TO BE VIBRANT & FULLY VISIBLE */}
      <div className="home-hero-scrim" aria-hidden="true" />

      {/* EXTREME LEFT DIRECTION ARROW (BORDS CARRÉS / SQUARE BORDERS) */}
      <button
        type="button"
        className="hero-edge-arrow hero-edge-arrow--left"
        aria-label="Previous slide"
        onClick={() => goTo(active - 1)}
      >
        <ChevronLeft size={28} />
      </button>

      {/* EXTREME RIGHT DIRECTION ARROW (BORDS CARRÉS / SQUARE BORDERS) */}
      <button
        type="button"
        className="hero-edge-arrow hero-edge-arrow--right"
        aria-label="Next slide"
        onClick={() => goTo(active + 1)}
      >
        <ChevronRight size={28} />
      </button>

      {/* HERO CONTENT: SPANS GENEROUSLY FROM THE BEGINNING OF THE PAGE WIDTH */}
      <div className="hero-content">
        {/* TOP BAR: INSTITUTIONAL BADGE ON THE LEFT, SEARCH BAR SHIFTED TO THE RIGHT */}
        <div className="hero-top-bar">
          {/* SEARCH BAR SHIFTED TO THE RIGHT (BORDS CARRÉS / SQUARE BORDERS) */}
          <div className="hero-search-container hero-search-right" ref={searchContainerRef}>
            <form className="hero-search-box" onSubmit={handleSearchSubmit} role="search">
              <span className="hero-search-icon-slot" aria-hidden="true">
                <Search size={18} className="hero-search-icon" />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                className="hero-search-input"
                placeholder="Search programs, departments, research, timetables..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsOpen(true);
                  setSelectedIndex(-1);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) {
                    setIsOpen(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                aria-autocomplete="list"
                aria-controls={searchListboxId}
                aria-expanded={isOpen && searchQuery.trim().length > 0}
                role="combobox"
                aria-label="Search the faculty..."
              />
              {searchQuery && (
                <button
                  type="button"
                  className="hero-search-clear"
                  onClick={() => {
                    setSearchQuery("");
                    setIsOpen(false);
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
              <button type="submit" className="hero-search-btn">
                <span>Search</span>
                <ArrowRight size={14} className="hero-search-btn-arrow" />
              </button>
            </form>

            {/* INTERACTIVE PREDICTIVE SEARCH DROPDOWN (SQUARE BORDERS) */}
            {isOpen && searchQuery.trim().length > 0 && (
              <div
                id={searchListboxId}
                role="listbox"
                className="hero-search-dropdown"
                aria-label="Search results"
              >
                {filteredResults.length > 0 ? (
                  <div className="hero-search-results-list">
                    {filteredResults.map((item, index) => (
                      <button
                        type="button"
                        key={item.id}
                        role="option"
                        aria-selected={index === selectedIndex}
                        className={`hero-search-item ${index === selectedIndex ? "is-selected" : ""}`}
                        onClick={() => handleSelectResult(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        {getCategoryIcon(item.category)}
                        <div className="hero-search-item-copy">
                          <strong>{item.title}</strong>
                          <small>{item.description}</small>
                        </div>
                        <span className="hero-search-item-cat">{item.category}</span>
                        <ArrowRight size={13} className="hero-search-item-arrow" />
                      </button>
                    ))}
                    <div className="hero-search-footer">
                      <span>Press Enter to search all departments</span>
                    </div>
                  </div>
                ) : (
                  <div className="hero-search-empty">
                    <p>
                      No results found for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                    </p>
                    <div className="hero-search-empty-actions">
                      <Link href="/departments" className="hero-search-empty-link" onClick={() => setIsOpen(false)}>
                        All departments →
                      </Link>
                      <Link href="/programs" className="hero-search-empty-link" onClick={() => setIsOpen(false)}>
                        All programmes →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Slide copy changes in step with the background image. */}
        <h1 aria-live="polite">
          <TextSplitReveal key={`${active}-first`} text={activeSlide.titleFirst[locale]} as="span" delay={0.08} />
          <br />
          <em>
            <TextSplitReveal key={`${active}-second`} text={activeSlide.titleSecond[locale]} as="span" delay={0.18} />
          </em>
        </h1>

        <p className="hero-description" aria-live="polite">
          <TextSplitReveal
            key={`${active}-description`}
            text={activeSlide.description[locale]}
            as="span"
            delay={0.26}
            stagger={0.015}
          />
        </p>

        {/* ACTION BUTTONS */}
        <div className="button-row">
          <Link href={activeSlide.href} className="button button-light button-sweep">
            {activeSlide.action[locale]} <ArrowRight size={16} />
          </Link>
          <Link href="/departments" className="button button-outline button-sweep">
            Explore departments
          </Link>
          <Link href="/research" className="button button-outline button-sweep hero-btn-research">
            Scientific research
          </Link>
        </div>
      </div>

      <div className="hero-index">
        <strong>{String(active + 1).padStart(2, "0")}</strong>
        <span>/</span> A LEGACY OF LEARNING
      </div>

      {/* BOTTOM SLIDE DOTS */}
      <div className="home-hero-controls" aria-label="Hero slides">
        {slides.map((_, index) => (
          <button
            type="button"
            key={index}
            className={`hero-dot-btn ${index === active ? "is-active" : ""}`}
            aria-label={`Show slide ${index + 1}`}
            aria-current={index === active}
            onClick={() => goTo(index)}
          >
            <span className="hero-dot-fill" />
          </button>
        ))}
      </div>

      {/* FAST ACCESS RIBBON (ACCÈS RAPIDE) - SQUARE BORDERS & HOVER ANIMATION */}
      <nav className="hero-quick-strip" aria-label="Quick academic gateways">
        <div className="wrap hero-quick-inner">
          <span className="hero-quick-kicker">Fast Access</span>
          <div className="hero-quick-links">
            {quickGateways.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} className="hero-quick-chip">
                  <Icon size={14} className="hero-quick-icon" />
                  <span>{item.label}</span>
                  <ArrowRight size={12} className="hero-quick-arrow" />
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </section>
  );
}

export default HomeHero;
