"use client";
import { useEffect, useRef } from "react";

interface LaserFlowProps {
  count?: number;
  color?: string;
  speed?: number;
  thickness?: number;
  className?: string;
}

interface Beam {
  x: number;
  y: number;
  angle: number;
  length: number;
  speed: number;
  opacity: number;
  life: number;
  maxLife: number;
}

function newBeam(w: number, h: number, color: string): Beam {
  const edge = Math.floor(Math.random() * 4);
  let x = 0, y = 0, angle = 0;
  if (edge === 0) { x = Math.random() * w; y = 0; angle = Math.PI * 0.4 + Math.random() * Math.PI * 0.2; }
  else if (edge === 1) { x = w; y = Math.random() * h; angle = Math.PI * 0.9 + Math.random() * Math.PI * 0.2; }
  else if (edge === 2) { x = Math.random() * w; y = h; angle = -Math.PI * 0.4 - Math.random() * Math.PI * 0.2; }
  else { x = 0; y = Math.random() * h; angle = Math.random() * Math.PI * 0.2 - 0.1; }

  const maxLife = 80 + Math.random() * 120;
  return { x, y, angle, length: 60 + Math.random() * 120, speed: 2 + Math.random() * 3, opacity: 0, life: 0, maxLife };
}

export function LaserFlow({
  count = 6,
  color = "#3BEA3B",
  speed = 1,
  thickness = 1.5,
  className = "",
}: LaserFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };
    const [r, g, b] = hexToRgb(color.startsWith("#") ? color : "#3BEA3B");

    const beams: Beam[] = Array.from({ length: count }, () =>
      newBeam(canvas.width, canvas.height, color)
    );

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      beams.forEach((beam, i) => {
        beam.life += speed;
        const progress = beam.life / beam.maxLife;
        beam.opacity = progress < 0.2 ? progress / 0.2 : progress > 0.8 ? (1 - progress) / 0.2 : 1;
        beam.x += Math.cos(beam.angle) * beam.speed * speed;
        beam.y += Math.sin(beam.angle) * beam.speed * speed;

        if (beam.life >= beam.maxLife) {
          beams[i] = newBeam(w, h, color);
          return;
        }

        const tailX = beam.x - Math.cos(beam.angle) * beam.length;
        const tailY = beam.y - Math.sin(beam.angle) * beam.length;

        const grad = ctx.createLinearGradient(tailX, tailY, beam.x, beam.y);
        grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
        grad.addColorStop(0.7, `rgba(${r},${g},${b},${beam.opacity * 0.6})`);
        grad.addColorStop(1, `rgba(${r},${g},${b},${beam.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(beam.x, beam.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = thickness;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Head glow dot
        ctx.beginPath();
        ctx.arc(beam.x, beam.y, thickness * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${beam.opacity})`;
        ctx.fill();
      });
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [count, color, speed, thickness]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
