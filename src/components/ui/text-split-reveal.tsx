"use client";

import * as React from "react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useTranslation } from "@/components/language-provider";

export interface TextSplitRevealProps {
  /** The text string to animate (or passed as children if string) */
  text?: string;
  children?: React.ReactNode;
  /** Granularity of splitting: 'words' (default) or 'characters' */
  splitBy?: "words" | "characters";
  /** HTML tag wrapper (default 'span') */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  /** CSS class applied to the outer wrapper */
  className?: string;
  /** CSS class applied to each split token */
  tokenClassName?: string;
  /** Initial delay before animation starts in seconds */
  delay?: number;
  /** Stagger time between words/characters in seconds */
  stagger?: number;
  /** Duration of single token reveal in seconds */
  duration?: number;
  /** Whether the animation triggers only once when entering view */
  once?: boolean;
}

export function TextSplitReveal({
  text,
  children,
  splitBy = "words",
  as: Component = "span",
  className = "",
  tokenClassName = "",
  delay = 0.1,
  stagger = 0.045,
  duration = 0.65,
  once = true,
}: TextSplitRevealProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const isInView = useInView(ref, { once, margin: "0px 0px -20px 0px" });
  const shouldReduceMotion = useReducedMotion();
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  const { t } = useTranslation();
  const rawContent = typeof text === "string" ? text : typeof children === "string" ? children : "";
  const content = React.useMemo(() => {
    // Render rawContent on SSR & first paint to eliminate any client/server hydration text mismatch
    if (!hasMounted) return rawContent;
    return rawContent ? t(rawContent) : "";
  }, [rawContent, t, hasMounted]);

  // Split tokens based on preference
  const tokens = React.useMemo(() => {
    if (!content) return [];
    if (splitBy === "characters") {
      return Array.from(content);
    }
    // Split by words, preserving whitespace
    return content.split(/(\s+)/).filter(Boolean);
  }, [content, splitBy]);

  const containerVariants: Variants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : stagger,
        delayChildren: shouldReduceMotion ? 0 : delay,
      },
    },
  };

  const childVariants: Variants = {
    hidden: {
      y: shouldReduceMotion ? "0%" : "120%",
      opacity: shouldReduceMotion ? 1 : 0,
      rotateZ: shouldReduceMotion ? 0 : 2,
    },
    visible: {
      y: "0%",
      opacity: 1,
      rotateZ: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : duration,
        ease: [0.16, 1, 0.3, 1], // fluid ease-out cubic
      },
    },
  };

  // If complex React children were passed (e.g. <em>, <br/>) and no plain text string
  if (!content && children) {
    return (
      <Component className={className} ref={ref as any}>
        {children}
      </Component>
    );
  }

  const MotionComponent = (motion as any).create
    ? (motion as any).create(Component as any)
    : motion(Component as any);

  return (
    <MotionComponent
      ref={ref}
      aria-label={content}
      suppressHydrationWarning
      className={`split-text-reveal-wrapper ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      style={{
        display: Component === "span" ? "inline" : "block",
        lineHeight: "inherit",
      }}
    >
      <span aria-hidden="true" style={{ display: "inline", lineHeight: "inherit" }} suppressHydrationWarning>
        {tokens.map((token, index) => {
          // If pure whitespace, preserve standard space
          if (/^\s+$/.test(token)) {
            return (
              <span key={`space-${index}`} style={{ display: "inline" }}>
                {token}
              </span>
            );
          }

          return (
            <span
              key={`token-${index}`}
              className="split-text-mask"
              suppressHydrationWarning
              style={{
                display: "inline-block",
                overflow: "hidden",
                verticalAlign: "bottom",
                lineHeight: "1.15",
                paddingBottom: "0.08em",
                marginBottom: "-0.08em",
              }}
            >
              <motion.span
                variants={childVariants}
                suppressHydrationWarning
                className={`split-text-token ${tokenClassName}`}
                style={{
                  display: "inline-block",
                  willChange: "transform, opacity",
                }}
              >
                {token}
              </motion.span>
            </span>
          );
        })}
      </span>
    </MotionComponent>
  );
}

export default TextSplitReveal;

