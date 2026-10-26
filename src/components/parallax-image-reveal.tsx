"use client";

import * as React from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useTranslation } from "@/components/language-provider";

interface ParallaxImageRevealProps {
  imageSrc?: string;
  imageAlt?: string;
  kicker?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
}

export function ParallaxImageReveal({
  imageSrc = "/images/faculty/4192ff7d4e9a442ab2de89125a75f87b.png",
  imageAlt = "Campus de Ngoa-Ekellé - Faculté des Sciences, Université de Yaoundé I",
  kicker = "CAMPUS DE NGOA-EKELLÉ · UNIVERSITÉ DE YAOUNDÉ I",
  title = "L'Excellence Scientifique en Action.",
  subtitle = "Au cœur du premier pôle d'enseignement supérieur et de recherche scientifique d'Afrique centrale.",
  badge = "Faculté des Sciences · Fondée en 1962",
}: ParallaxImageRevealProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const { t } = useTranslation();

  // Track scroll progress through this specific 240vh section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth transforms synchronized with scroll
  // Phase 1 (0 to 0.65): Expand from centered framed card to 100vw x 100vh fullscreen
  // Phase 2 (0.65 to 0.88): Stabilize at fullscreen for immersion
  // Phase 3 (0.88 to 1.0): Gentle fade transition into the next section
  const cardWidth = useTransform(
    scrollYProgress,
    [0, 0.65, 1],
    shouldReduceMotion ? ["100vw", "100vw", "100vw"] : ["min(920px, 68vw)", "100vw", "100vw"]
  );

  const cardHeight = useTransform(
    scrollYProgress,
    [0, 0.65, 1],
    shouldReduceMotion ? ["100vh", "100vh", "100vh"] : ["min(560px, 58vh)", "100vh", "100vh"]
  );

  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.65, 1],
    shouldReduceMotion ? [1, 1, 1] : [1.22, 1.0, 1.04]
  );

  const cardOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.88, 1],
    [0.75, 1, 1, 0.9]
  );

  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 0.88, 0.98],
    [0, 0.8, 1, 1, 0]
  );

  const contentY = useTransform(
    scrollYProgress,
    [0.2, 0.65, 0.88, 1],
    [32, 0, 0, -24]
  );

  const indicatorOpacity = useTransform(
    scrollYProgress,
    [0, 0.25],
    [1, 0]
  );

  return (
    <section
      ref={containerRef}
      className="parallax-reveal-wrapper"
      aria-label="Campus visual transition"
    >
      <div className="parallax-reveal-sticky">
        <motion.div
          className="parallax-reveal-card"
          style={{
            width: cardWidth,
            height: cardHeight,
            opacity: cardOpacity,
          }}
        >
          {/* Inner image with counter-parallax zoom */}
          <motion.div
            className="parallax-reveal-img-wrapper"
            style={{
              scale: imageScale,
            }}
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              className="parallax-reveal-img"
              loading="lazy"
            />
          </motion.div>

          {/* Academic gradient overlay for cinematic contrast */}
          <div className="parallax-reveal-scrim" />

          {/* Overlay Typography & Institutional Hallmarks */}
          <motion.div
            className="parallax-reveal-content"
            style={{
              opacity: contentOpacity,
              y: contentY,
            }}
          >
            <div className="parallax-reveal-inner">
              <span className="parallax-reveal-kicker">
                {t(kicker)}
              </span>

              <h2 className="parallax-reveal-title">
                {t(title)}
              </h2>

              <p className="parallax-reveal-subtitle">
                {t(subtitle)}
              </p>

              <div className="parallax-reveal-badge-strip">
                <span className="parallax-reveal-badge">
                  {t(badge)}
                </span>
                <span className="parallax-reveal-badge">
                  {t("40+ Laboratoires de recherche")}
                </span>
                <span className="parallax-reveal-badge">
                  {t("8 Départements scientifiques")}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Subtle scroll progress cue at the bottom before expansion */}
          <motion.div
            className="parallax-reveal-hint"
            style={{ opacity: indicatorOpacity }}
          >
            <span className="parallax-reveal-hint-text">
              {t("Défiler pour explorer")}
            </span>
            <ArrowDown size={14} className="parallax-reveal-hint-arrow" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default ParallaxImageReveal;

