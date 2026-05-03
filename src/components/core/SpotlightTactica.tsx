"use client";

import { useEffect, useRef } from "react";

export function SpotlightTactica() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const pos   = { x: -9999, y: -9999 };
    const target = { x: -9999, y: -9999 };
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      pos.x = lerp(pos.x, target.x, 0.1);
      pos.y = lerp(pos.y, target.y, 0.1);
      el.style.left = `${pos.x}px`;
      el.style.top  = `${pos.y}px`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: "fixed",
        width: 400,
        height: 400,
        borderRadius: "50%",
        background:
          "radial-gradient(circle, rgba(59,234,59,0.04) 0%, transparent 70%)",
        transform: "translate(-50%,-50%)",
        pointerEvents: "none",
        zIndex: 2,
        willChange: "left, top",
      }}
    />
  );
}
