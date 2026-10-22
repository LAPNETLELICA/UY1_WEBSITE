"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=2200&q=85",
  "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=2200&q=85",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2200&q=85",
];

export function HomeHero() {
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState(-1);
  const goTo = (next: number) => { setPrevious(active); setActive((next + slides.length) % slides.length); };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => goTo(active + 1), 6500);
    return () => window.clearInterval(timer);
  }, [active]);

  return <section className="hero home-hero" aria-roledescription="carousel" aria-label="Faculty highlights">
    <div className="home-hero-media" data-parallax aria-hidden="true">
      {slides.map((image, index) => <div key={image} className={`home-hero-slide ${index === active ? "is-active" : ""} ${index === previous ? "is-leaving" : ""}`} style={{ backgroundImage: `url("${image}")` }} />)}
    </div>
    <div className="hero-content">
      <span className="eyebrow">Knowledge · Discovery · Service</span>
      <h1>Where curiosity<br />becomes <em>discovery.</em></h1>
      <p>At the Faculty of Science, University of Yaoundé I, we ask bold questions, nurture scientific talent and create knowledge for Cameroon and the world.</p>
      <div className="button-row"><Link href="/about" className="button button-light button-sweep">Discover the faculty <ArrowRight size={16} /></Link><Link href="/departments" className="button button-outline button-sweep">Explore departments</Link></div>
    </div>
    <div className="hero-index"><strong>{String(active + 1).padStart(2, "0")}</strong><span>/</span> A LEGACY OF LEARNING</div>
    <div className="home-hero-controls" aria-label="Hero slides"><button type="button" className="home-hero-arrow" aria-label="Previous slide" onClick={() => goTo(active - 1)}><ChevronLeft size={18}/></button>{slides.map((_, index) => <button type="button" key={index} className={index === active ? "is-active" : ""} aria-label={`Show slide ${index + 1}`} aria-current={index === active} onClick={() => goTo(index)} />)}<button type="button" className="home-hero-arrow" aria-label="Next slide" onClick={() => goTo(active + 1)}><ChevronRight size={18}/></button></div>
  </section>;
}
