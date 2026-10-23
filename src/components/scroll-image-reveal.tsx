"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef, useMemo } from "react";

export interface ScrollImageRevealProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  direction?: "up" | "down" | "left" | "right";
  scaleStart?: number;
  scaleEnd?: number;
  aspectRatio?: string;
  overlay?: React.ReactNode;
  children?: React.ReactNode;
}

export function ScrollImageReveal({
  src,
  alt,
  className = "",
  imgClassName = "",
  direction = "up",
  scaleStart = 1.15,
  scaleEnd = 1.0,
  aspectRatio,
  overlay,
  children,
}: ScrollImageRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // useScroll with element targeting and tuned viewport range
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 92%", "start 35%"],
  });

  // Calculate clip-path curtain effect based on direction
  const clipPathValues = useMemo(() => {
    switch (direction) {
      case "up":
        return ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"];
      case "down":
        return ["inset(0% 0% 100% 0%)", "inset(0% 0% 0% 0%)"];
      case "left":
        return ["inset(0% 0% 0% 100%)", "inset(0% 0% 0% 0%)"];
      case "right":
        return ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"];
      default:
        return ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"];
    }
  }, [direction]);

  const clipPath = useTransform(scrollYProgress, [0, 1], clipPathValues);
  const scale = useTransform(scrollYProgress, [0, 1], [scaleStart, scaleEnd]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [0.6, 1]);

  if (shouldReduceMotion) {
    return (
      <div
        ref={containerRef}
        className={`scroll-reveal-container ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <div className="scroll-reveal-curtain">
          <img src={src} alt={alt} className={`scroll-reveal-img ${imgClassName}`} />
          {overlay}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`scroll-reveal-container ${className}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <motion.div
        className="scroll-reveal-curtain"
        style={{
          clipPath,
          opacity,
        }}
      >
        <motion.img
          src={src}
          alt={alt}
          className={`scroll-reveal-img ${imgClassName}`}
          style={{ scale }}
        />
        {overlay}
        {children}
      </motion.div>
    </div>
  );
}

export default ScrollImageReveal;

