"use client";
import { useEffect, useRef } from "react";

interface RadarProps {
  color?: string;
  rings?: number;
  blips?: number;
  speed?: number;
  size?: number;
  className?: string;
}

interface Blip {
  angle: number;
  r: number;
  alpha: number;
  age: number;
}

export function Radar({
  color = "#3BEA3B",
  rings = 4,
  blips: blipCount = 8,
  speed = 1,
  size = 200,
  className = "",
}: RadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = size;
    canvas.height = size;

    let angle = 0;
    let raf = 0;

    const blips: Blip[] = Array.from({ length: blipCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      r: (0.2 + Math.random() * 0.75) * (size / 2 - 8),
      alpha: 0,
      age: Math.random() * Math.PI * 2,
    }));

    const cx = size / 2;
    const cy = size / 2;
    const R = size / 2 - 4;

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r},${g},${b}`;
    };
    const rgb = hexToRgb(color.startsWith("#") ? color : "#3BEA3B");

    const tick = () => {
      raf = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, size, size);

      // Background
      ctx.fillStyle = `rgba(0,0,0,0.85)`;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      // Rings
      for (let i = 1; i <= rings; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (R / rings) * i, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rgb},0.2)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Cross hairs
      ctx.strokeStyle = `rgba(${rgb},0.15)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();

      // Sweep arc (fallback for all environments)
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, angle - Math.PI / 2.5, angle);
      ctx.closePath();
      const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      sweepGrad.addColorStop(0, `rgba(${rgb},0.18)`);
      sweepGrad.addColorStop(1, `rgba(${rgb},0.02)`);
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R);
      ctx.strokeStyle = `rgba(${rgb},0.9)`;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = color;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Blips
      blips.forEach((b) => {
        const diff = ((b.angle - angle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (diff < 0.15) b.alpha = 1;
        else b.alpha = Math.max(0, b.alpha - 0.008);
        if (b.alpha <= 0) return;

        const bx = cx + Math.cos(b.angle) * b.r;
        const by = cy + Math.sin(b.angle) * b.r;
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${b.alpha})`;
        ctx.shadowBlur = 8 * b.alpha;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Clip to circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();
      ctx.restore();

      angle += 0.02 * speed;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [color, rings, blipCount, speed, size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size, borderRadius: "50%" }}
    />
  );
}
