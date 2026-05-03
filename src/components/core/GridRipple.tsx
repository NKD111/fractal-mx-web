"use client";

import { useEffect, useRef } from "react";

interface Ripple {
  x: number;
  y: number;
  t: number;
}

const DURATION = 600;
const MAX_R    = 200;

export function GridRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ripples: Ripple[] = [];
    let raf = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onClick = (e: MouseEvent) => {
      ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    };
    window.addEventListener("click", onClick);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = performance.now();

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const elapsed  = now - r.t;
        if (elapsed > DURATION) { ripples.splice(i, 1); continue; }

        const progress = elapsed / DURATION;
        const radius   = progress * MAX_R;
        const opacity  = 0.12 * (1 - progress);

        const grad = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, radius);
        grad.addColorStop(0,   `rgba(59,234,59,${opacity})`);
        grad.addColorStop(0.5, `rgba(59,234,59,${opacity * 0.5})`);
        grad.addColorStop(1,   "rgba(59,234,59,0)");

        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        /* grid intensification ring */
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59,234,59,${opacity * 0.6})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed", inset: 0,
        pointerEvents: "none", zIndex: 9994,
      }}
    />
  );
}
