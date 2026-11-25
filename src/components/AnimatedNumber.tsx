"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: number | null | undefined;
  decimals?: number;
  duration?: number;
  fallback?: string;
}

export default function AnimatedNumber({
  value,
  decimals = 0,
  duration = 450,
  fallback = "--",
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState<number>(value ?? 0);
  const currentRef = useRef<number>(value ?? 0);

  useEffect(() => {
    if (value === null || value === undefined || Number.isNaN(value)) return;

    const from = currentRef.current;
    const to = value;
    if (from === to) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      if (prefersReducedMotion) {
        currentRef.current = to;
        setDisplay(to);
        return;
      }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (to - from) * eased;
      currentRef.current = next;
      setDisplay(next);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        currentRef.current = to;
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);

  if (value === null || value === undefined || Number.isNaN(value)) {
    return <>{fallback}</>;
  }

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString();

  return <>{formatted}</>;
}
