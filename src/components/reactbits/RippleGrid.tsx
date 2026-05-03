"use client";
import { useEffect, useRef } from "react";

interface RippleGridProps {
  gridSize?: number;
  color?: string;
  rippleRadius?: number;
  rippleDuration?: number;
  className?: string;
}

interface Ripple {
  x: number;
  y: number;
  t: number;
}

export function RippleGrid({
  gridSize = 40,
  color = "#3BEA3B",
  rippleRadius = 120,
  rippleDuration = 800,
  className = "",
}: RippleGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const ripples: Ripple[] = [];

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };
    const [r, g, b] = hexToRgb(color.startsWith("#") ? color : "#3BEA3B");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      ) {
        ripples.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() });
        if (ripples.length > 12) ripples.shift();
      }
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cols = Math.ceil(w / gridSize) + 1;
      const rows = Math.ceil(h / gridSize) + 1;

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const gx = col * gridSize;
          const gy = row * gridSize;

          let maxDisplace = 0;
          ripples.forEach((rp) => {
            const elapsed = now - rp.t;
            if (elapsed > rippleDuration) return;
            const progress = elapsed / rippleDuration;
            const ring = progress * rippleRadius;
            const dx = gx - rp.x;
            const dy = gy - rp.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const proximity = Math.max(0, 1 - Math.abs(dist - ring) / 20);
            const fade = 1 - progress;
            maxDisplace = Math.max(maxDisplace, proximity * fade * 6);
          });

          const alpha = 0.12 + maxDisplace * 0.05;
          const size = 1 + maxDisplace * 0.3;

          ctx.beginPath();
          ctx.arc(gx, gy, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fill();
        }
      }

      // Clean stale ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].t > rippleDuration) ripples.splice(i, 1);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      ro.disconnect();
    };
  }, [gridSize, color, rippleRadius, rippleDuration]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
