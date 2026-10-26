"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useTranslation } from "@/components/language-provider";

type CurtainPhase = "idle" | "covering" | "holding" | "revealing";

interface CurtainContextValue {
  phase: CurtainPhase;
  triggerCurtain: (targetHref: string) => void;
  isTransitioning: boolean;
}

const CurtainContext = React.createContext<CurtainContextValue | null>(null);

export function useCurtainTransition() {
  const context = React.useContext(CurtainContext);
  if (!context) {
    throw new Error("useCurtainTransition must be used within a CurtainTransitionProvider");
  }
  return context;
}

const easeCurve: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Motion+ Clip Wipe polygon vertices:
// 4-point polygon with an elegant slant angle on the leading wipe edge
const clipVariants: Variants = {
  idle: {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
  },
  covering: {
    clipPath: [
      "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      "polygon(0% 0%, 100% 0%, 100% 60%, 0% 48%)",
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    ],
    transition: {
      duration: 0.52,
      ease: easeCurve,
    },
  },
  holding: {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    transition: { duration: 0.01 },
  },
  revealing: {
    clipPath: [
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      "polygon(0% 52%, 100% 40%, 100% 100%, 0% 100%)",
      "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    ],
    transition: {
      duration: 0.52,
      ease: easeCurve,
    },
  },
};

const goldAccentVariants: Variants = {
  idle: {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
  },
  covering: {
    clipPath: [
      "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      "polygon(0% 0%, 100% 0%, 100% 66%, 0% 54%)",
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    ],
    transition: {
      duration: 0.48,
      ease: easeCurve,
    },
  },
  holding: {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    transition: { duration: 0.01 },
  },
  revealing: {
    clipPath: [
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      "polygon(0% 46%, 100% 34%, 100% 100%, 0% 100%)",
      "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    ],
    transition: {
      duration: 0.55,
      delay: 0.04,
      ease: easeCurve,
    },
  },
};

export function CurtainTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const { locale } = useTranslation();

  const [phase, setPhase] = React.useState<CurtainPhase>("idle");
  const [destination, setDestination] = React.useState<string | null>(null);
  const pendingRef = React.useRef(false);

  // Prefetch timetable page into Next.js router cache
  React.useEffect(() => {
    try {
      router.prefetch("/timetables");
    } catch {
      // ignore
    }
  }, [router]);

  const triggerCurtain = React.useCallback(
    (targetHref: string) => {
      if (pendingRef.current || phase !== "idle") return;
      pendingRef.current = true;
      setDestination(targetHref);

      if (shouldReduceMotion) {
        // Reduced motion: direct instant transition without wiping
        router.push(targetHref);
        pendingRef.current = false;
        return;
      }

      // Step 1: Start cover wipe
      setPhase("covering");

      // Step 2: Once covered, switch to holding and perform router navigation
      const coverTimer = window.setTimeout(() => {
        setPhase("holding");
        router.push(targetHref);
      }, 530);

      return () => window.clearTimeout(coverTimer);
    },
    [phase, router, shouldReduceMotion]
  );

  // Step 3: When pathname changes to destination (or holding phase), trigger reveal wipe
  React.useEffect(() => {
    if ((phase === "holding" || phase === "covering") && destination) {
      if (pathname === destination || pathname.startsWith(destination)) {
        // Wait a frame for React 19 / Next.js to render the destination DOM
        const frame = window.requestAnimationFrame(() => {
          setPhase("revealing");

          const revealTimer = window.setTimeout(() => {
            setPhase("idle");
            setDestination(null);
            pendingRef.current = false;
          }, 540);

          return () => window.clearTimeout(revealTimer);
        });

        return () => window.cancelAnimationFrame(frame);
      }
    }
  }, [pathname, phase, destination]);

  // Safety fallback: if navigation gets held up for any reason, release curtain after 2.8s
  React.useEffect(() => {
    if (phase !== "idle") {
      const timeout = window.setTimeout(() => {
        setPhase("idle");
        setDestination(null);
        pendingRef.current = false;
      }, 2800);
      return () => window.clearTimeout(timeout);
    }
  }, [phase]);

  const value = React.useMemo(
    () => ({
      phase,
      triggerCurtain,
      isTransitioning: phase !== "idle",
    }),
    [phase, triggerCurtain]
  );

  return (
    <CurtainContext.Provider value={value}>
      {children}

      {/* Motion+ Curtains: Clip Wipe Overlay */}
      {phase !== "idle" && (
        <div
          className="curtain-wipe-stage"
          aria-hidden="false"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            pointerEvents: phase === "revealing" ? "none" : "all",
          }}
        >
          {/* Layer 1: Golden Accent Leading Curtain */}
          <motion.div
            className="curtain-wipe-accent"
            initial="idle"
            animate={phase}
            variants={goldAccentVariants}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(135deg, #d6bd8f 0%, #b89355 40%, #e2caa2 70%, #9c7536 100%)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.45)",
              willChange: "clip-path",
            }}
          />

          {/* Layer 2: Primary Royal Plum Institutional Curtain */}
          <motion.div
            className="curtain-wipe-panel"
            initial="idle"
            animate={phase}
            variants={clipVariants}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              background: "radial-gradient(ellipse at 50% 45%, #2a113a 0%, #1a0824 60%, #12041b 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              willChange: "clip-path",
            }}
          >
            {/* Ambient institutional watermark/grain */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(circle at 50% 50%, rgba(214, 189, 143, 0.08) 0%, transparent 65%)",
                pointerEvents: "none",
              }}
            />

            {/* Inner Institutional Badge & Stage Content */}
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={
                phase === "covering" || phase === "holding"
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: -10, scale: 0.98 }
              }
              transition={{ duration: 0.28, delay: phase === "covering" ? 0.16 : 0 }}
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "24px 32px",
                maxWidth: "520px",
              }}
            >
              {/* UY1 Seal */}
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(214, 189, 143, 0.4)",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: 16,
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
                }}
              >
                <img src="/uy1-seal-transparent.png" alt="" aria-hidden="true" style={{ width: 42, height: 52, objectFit: "contain", filter: "brightness(0) invert(1)" }} />
              </div>

              {/* Kicker */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#d6bd8f",
                  marginBottom: 8,
                }}
              >
                UNIVERSITÉ DE YAOUNDÉ I · FACULTÉ DES SCIENCES
              </span>

              {/* Title */}
              <h2
                style={{
                  fontFamily: "var(--serif, 'Playfair Display', Georgia, serif)",
                  fontSize: "clamp(22px, 2.8vw, 30px)",
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.25,
                  margin: "0 0 16px",
                  letterSpacing: "-0.015em",
                }}
              >
                {locale === "fr" ? "Emplois du Temps & Horaires" : "Academic Timetables & Schedules"}
              </h2>

              {/* Animated Gold Shimmer Line */}
              <div
                style={{
                  width: 72,
                  height: 2,
                  background: "rgba(255, 255, 255, 0.18)",
                  overflow: "hidden",
                  position: "relative",
                  borderRadius: 1,
                }}
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.05, ease: "easeInOut" }}
                  style={{
                    width: "48%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, #d6bd8f, #f7eddd, transparent)",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </CurtainContext.Provider>
  );
}

// Dedicated Button that triggers the Curtains: Clip Wipe transition to /timetables
interface CurtainLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

export function CurtainLink({ href, children, className, onClick, ...rest }: CurtainLinkProps) {
  const router = useRouter();
  const { triggerCurtain, isTransitioning } = useCurtainTransition();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Let meta/ctrl clicks open in new tab normally
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    onClick?.(event);
    triggerCurtain(href);
  };

  const handleMouseEnter = () => {
    try {
      router.prefetch(href);
    } catch {
      // ignore
    }
  };

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      aria-disabled={isTransitioning}
      {...rest}
    >
      {children}
    </a>
  );
}

