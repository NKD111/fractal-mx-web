"use client";

import { useEffect, useRef } from "react";

interface CornerBracketsProps {
  className?: string;
  size?: number;
  color?: string;
  opacity?: number;
}

export function CornerBrackets({
  className = "",
  size = 24,
  color = "#3BEA3B",
  opacity = 0.3,
}: CornerBracketsProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const paths = svg.querySelectorAll<SVGPathElement>("path");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          paths.forEach((p, i) => {
            p.style.animation = `none`;
            void (p as unknown as HTMLElement).offsetHeight;
            p.style.animation = `bracket-draw 0.8s ${i * 0.12}s cubic-bezier(0.16,1,0.3,1) forwards`;
          });
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  const L = size;
  const corners = [
    `M ${L} 0 L 0 0 L 0 ${L}`,          // top-left
    `M calc(100% - ${L}px) 0 L 100% 0 L 100% ${L}px`,  // top-right
    `M 0 calc(100% - ${L}px) L 0 100% L ${L}px 100%`,  // bottom-left
    `M calc(100% - ${L}px) 100% L 100% 100% L 100% calc(100% - ${L}px)`, // bottom-right
  ];

  return (
    <svg
      ref={ref}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        @keyframes bracket-draw {
          from { stroke-dashoffset: 100; opacity: 0; }
          to   { stroke-dashoffset: 0;   opacity: 1; }
        }
      `}</style>
      {corners.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="square"
          strokeDasharray="100"
          strokeDashoffset="100"
          style={{ opacity: 0 }}
        />
      ))}
    </svg>
  );
}
