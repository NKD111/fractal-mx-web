"use client";
import { useEffect, useRef } from "react";

interface LightningProps {
  hue?: number;
  xOffset?: number;
  speed?: number;
  intensity?: number;
  size?: number;
  className?: string;
}

function buildBranch(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  depth: number,
  hue: number,
  alpha: number
) {
  if (depth <= 0) return;
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * 80 * (depth / 5);
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * 20;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(mx, my, x2, y2);
  ctx.strokeStyle = `hsla(${hue}, 100%, 75%, ${alpha})`;
  ctx.lineWidth = depth * 0.5;
  ctx.shadowBlur = depth * 4;
  ctx.shadowColor = `hsla(${hue}, 100%, 75%, 0.8)`;
  ctx.stroke();

  if (depth > 2 && Math.random() > 0.5) {
    const bx = mx + (Math.random() - 0.5) * 60;
    const by = my + 40 + Math.random() * 60;
    buildBranch(ctx, mx, my, bx, by, depth - 2, hue, alpha * 0.6);
  }

  buildBranch(ctx, x1, y1, mx, my, depth - 1, hue, alpha);
  buildBranch(ctx, mx, my, x2, y2, depth - 1, hue, alpha);
}

export function Lightning({
  hue = 130,
  xOffset = 0,
  speed = 1,
  intensity = 0.7,
  size = 1,
  className = "",
}: LightningProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let frame = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      frame++;
      if (frame % Math.max(1, Math.round(8 / speed)) !== 0) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (Math.random() > 1 - intensity * 0.3) {
        const startX = canvas.width / 2 + xOffset + (Math.random() - 0.5) * 40;
        buildBranch(
          ctx,
          startX,
          0,
          startX + (Math.random() - 0.5) * canvas.width * 0.4,
          canvas.height,
          Math.round(4 * size),
          hue,
          0.8
        );
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [hue, xOffset, speed, intensity, size]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
