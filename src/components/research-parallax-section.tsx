"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

export function ResearchParallaxSection({ children }: { children: React.ReactNode }) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.35 });
  const imageY = useTransform(progress, [0, 1], ["-2%", "2%"]);
  const captionOpacity = useTransform(progress, [0, 0.2, 0.74, 1], [0, 0.78, 0.78, 0]);

  return (
    <section ref={sectionRef} className="section home-research-section research-parallax-section" aria-labelledby="research-heading">
      <div className="research-parallax-background" aria-hidden="true">
        <motion.img src="/images/faculty/5cf327f811d74be29b075eb21c38a5ff (Edited 3).png" alt="" style={reduceMotion ? undefined : { y: imageY }} />
      </div>
      <div className="research-parallax-scrim" aria-hidden="true" />
      <motion.div
        className="research-parallax-arrival"
        aria-hidden="true"
        initial={reduceMotion ? false : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
        whileInView={reduceMotion ? undefined : { opacity: 1, clipPath: "inset(0 0 0% 0)" }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.p className="research-parallax-caption" aria-hidden="true" style={reduceMotion ? { opacity: 0.72 } : { opacity: captionOpacity }}>
        Faculty of Science · UY1
      </motion.p>
      <div className="research-parallax-content">{children}</div>
    </section>
  );
}
