"use client";
import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  once?: boolean;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function CountUp({
  from = 0,
  to,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  once = true,
}: CountUpProps) {
  const [value, setValue] = useState(from);
  const rafRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const hasRunRef = useRef(false);

  const startAnimation = () => {
    startRef.current = null;
    cancelAnimationFrame(rafRef.current);
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = (now - startRef.current) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      setValue(from + (to - from) * easeOutCubic(progress));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (once && hasRunRef.current) return;
          hasRunRef.current = true;
          startAnimation();
        }
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [from, to, duration, once]);

  return (
    <span ref={containerRef} className={className}>
      {prefix}
      {decimals > 0 ? value.toFixed(decimals) : Math.floor(value)}
      {suffix}
    </span>
  );
}
