"use client";

import { useEffect } from "react";

export function SiteMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("motion-ready");
    const reveal = (element: Element) => element.classList.add("reveal-target");
    const targets = () => Array.from(document.querySelectorAll("main > .section, main > .content-section, main > .stats-band, main > .timetable-band")).filter((element) => !element.classList.contains("reveal-target"));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer.unobserve(entry.target); } }), { threshold: 0.12 });
    const observeTargets = () => targets().forEach((element) => { reveal(element); observer.observe(element); });
    observeTargets();
    const mutations = new MutationObserver(observeTargets);
    mutations.observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true });
    const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]"));
    let frame = 0;
    const updateParallax = () => { frame = 0; parallax.forEach((element) => element.style.setProperty("--parallax-y", `${Math.min(22, window.scrollY * 0.025)}px`)); };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(updateParallax); };
    updateParallax(); window.addEventListener("scroll", onScroll, { passive: true });
    return () => { observer.disconnect(); mutations.disconnect(); window.removeEventListener("scroll", onScroll); if (frame) window.cancelAnimationFrame(frame); root.classList.remove("motion-ready"); };
  }, []);
  return null;
}
