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
    duration: 0.75,
    delay: 0,
  },
  {
    id: "programs",
    value: 20,
    label: "Study pathways",
    duration: 0.8,
    delay: 0.08,
  },
  {
    id: "years",
    value: 60,
    label: "Years of discovery",
    duration: 0.85,
    delay: 0.16,
  },
  {
    id: "community",
    value: 1,
    label: "Community, many disciplines",
    duration: 0.7,
    delay: 0.24,
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

  React.useEffect(() => {
    if (!hasTriggered) return;

    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    let startTimestamp: number | null = null;
    let frameId: number | undefined;
    let cancelled = false;

    const timeoutId = setTimeout(() => {
      const step = (timestamp: number) => {
        if (cancelled) return;
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
      cancelled = true;
      clearTimeout(timeoutId);
      if (frameId !== undefined) cancelAnimationFrame(frameId);
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
