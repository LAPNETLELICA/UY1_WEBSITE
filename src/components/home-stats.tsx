"use client";

import * as React from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface StatItem {
  id: string;
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  duration?: number;
  delay?: number;
}

const statsData: StatItem[] = [
  {
    id: "departments",
    value: 10,
    label: "Academic departments",
    duration: 1.4,
    delay: 0.05,
  },
  {
    id: "programs",
    value: 20,
    label: "Study pathways",
    duration: 1.6,
    delay: 0.12,
  },
  {
    id: "years",
    value: 60,
    prefix: "+",
    label: "Years of discovery",
    duration: 1.8,
    delay: 0.2,
  },
  {
    id: "community",
    value: 1,
    label: "Community, many disciplines",
    duration: 1.0,
    delay: 0.28,
  },
];

function CounterNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1.6,
  delay = 0,
  hasTriggered,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
  hasTriggered: boolean;
}) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const shouldReduceMotion = useReducedMotion();
  const animatedOnceRef = React.useRef(false);

  React.useEffect(() => {
    if (!hasTriggered) return;
    if (animatedOnceRef.current) return;
    animatedOnceRef.current = true;

    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp: number | null = null;
    let frameId: number;

    const timeoutId = setTimeout(() => {
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = (timestamp - startTimestamp) / 1000;
        const progress = Math.min(elapsed / duration, 1);

        // Fluid cubic ease-out
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(easeOut * value);

        setDisplayValue(current);

        if (progress < 1) {
          frameId = requestAnimationFrame(step);
        } else {
          setDisplayValue(value);
        }
      };

      frameId = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [hasTriggered, value, duration, delay, shouldReduceMotion]);

  return (
    <strong className="home-stat-number" suppressHydrationWarning>
      {prefix && <span className="stat-affix stat-prefix">{prefix}</span>}
      <span className="stat-digit">{hasTriggered ? displayValue : 0}</span>
      {suffix && <span className="stat-affix stat-suffix">{suffix}</span>}
    </strong>
  );
}

export function HomeStats() {
  const containerRef = React.useRef<HTMLElement | null>(null);
  const [hasTriggered, setHasTriggered] = React.useState(false);

  // Trigger as soon as the element enters the viewport (amount: 0.1, margin for early prep)
  const isInView = useInView(containerRef, {
    once: true,
    amount: 0.1,
    margin: "0px 0px -20px 0px",
  });

  React.useEffect(() => {
    if (isInView && !hasTriggered) {
      setHasTriggered(true);
    }
  }, [isInView, hasTriggered]);

  return (
    <section
      ref={containerRef}
      className="stats-band home-stats-band"
      aria-label="Key faculty figures"
    >
      <div className="wrap">
        <div className="stats-grid home-stats-grid">
          {statsData.map((item, index) => (
            <div
              key={item.id}
              className={`stat home-stat-item stat-item-${index + 1}`}
            >
              <CounterNumber
                value={item.value}
                prefix={item.prefix}
                suffix={item.suffix}
                duration={item.duration}
                delay={item.delay}
                hasTriggered={hasTriggered}
              />
              <span className="home-stat-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomeStats;
