"use client";

import { useEffect, useRef } from "react";

interface Ripple {
  x: number;
  y: number;
  t: number;
}

export function GlobalEffects() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const ripplesRef   = useRef<Ripple[]>([]);
  const mouseRef     = useRef({ x: -9999, y: -9999 });
  const targetRef    = useRef({ x: -9999, y: -9999 });
  const rafRef       = useRef<number>(0);

  useEffect(() => {
    const spotlight = spotlightRef.current;
    const canvas    = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const onClick = (e: MouseEvent) => {
      ripplesRef.current.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const DURATION = 600;

    const tick = () => {
      /* spotlight lerp */
      mouseRef.current.x = lerp(mouseRef.current.x, targetRef.current.x, 0.12);
      mouseRef.current.y = lerp(mouseRef.current.y, targetRef.current.y, 0.12);
      if (spotlight) {
        spotlight.style.left = `${mouseRef.current.x}px`;
        spotlight.style.top  = `${mouseRef.current.y}px`;
      }

      /* grid ripple */
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = performance.now();
      ripplesRef.current = ripplesRef.current.filter(r => now - r.t < DURATION);

      for (const ripple of ripplesRef.current) {
        const elapsed  = now - ripple.t;
        const progress = elapsed / DURATION;
        const radius   = progress * 240;
        const opacity  = 0.15 * (1 - progress);

        const gradient = ctx.createRadialGradient(
          ripple.x, ripple.y, 0,
          ripple.x, ripple.y, radius
        );
        gradient.addColorStop(0,   `rgba(59,234,59,${opacity})`);
        gradient.addColorStop(0.6, `rgba(59,234,59,${opacity * 0.4})`);
        gradient.addColorStop(1,   "rgba(59,234,59,0)");

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      <div id="tactical-spotlight" ref={spotlightRef} aria-hidden="true" />
      <canvas id="grid-ripple-canvas" ref={canvasRef} aria-hidden="true" />
    </>
  );
}
