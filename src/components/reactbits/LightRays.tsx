"use client";
import { useEffect, useRef } from "react";

interface LightRaysProps {
  rayCount?: number;
  color?: string;
  speed?: number;
  intensity?: number;
  className?: string;
}

export function LightRays({
  rayCount = 12,
  color = "#3BEA3B",
  speed = 0.3,
  intensity = 0.15,
  className = "",
}: LightRaysProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const angles = Array.from({ length: rayCount }, (_, i) => ({
      base: (i / rayCount) * Math.PI * 2,
      offset: Math.random() * 0.5,
      width: 0.04 + Math.random() * 0.06,
      amp: 0.6 + Math.random() * 0.8,
    }));

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };
    const [r, g, b] = hexToRgb(color.startsWith("#") ? color : "#3BEA3B");

    const tick = () => {
      raf = requestAnimationFrame(tick);
      t += 0.01 * speed;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.sqrt(cx * cx + cy * cy);

      ctx.clearRect(0, 0, w, h);

      angles.forEach(({ base, offset, width, amp }) => {
        const a = base + Math.sin(t * amp + offset) * 0.15;
        const a1 = a - width;
        const a2 = a + width;

        const x1 = cx + Math.cos(a1) * maxR;
        const y1 = cy + Math.sin(a1) * maxR;
        const x2 = cx + Math.cos(a2) * maxR;
        const y2 = cy + Math.sin(a2) * maxR;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.closePath();

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
        grad.addColorStop(0, `rgba(${r},${g},${b},${intensity * 3})`);
        grad.addColorStop(0.4, `rgba(${r},${g},${b},${intensity})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grad;
        ctx.fill();
      });
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [rayCount, color, speed, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
