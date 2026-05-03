"use client";

import { useEffect, useRef } from "react";

export function FrequencyBars({ width = 200, height = 40 }: { width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = width;
    canvas.height = height;

    const BARS = 40;
    const targets = Array.from({ length: BARS }, () => Math.random());
    const current = Array.from({ length: BARS }, () => Math.random());
    let raf: number;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const barW = width / BARS;

      for (let i = 0; i < BARS; i++) {
        // smoothly chase random target
        if (Math.random() < 0.04) {
          targets[i] =
            0.1 +
            Math.abs(Math.sin(i * 0.4 + t * 2)) * 0.5 +
            Math.random() * 0.4;
          targets[i] = Math.min(1, targets[i]);
        }
        current[i] += (targets[i] - current[i]) * 0.12;

        const h = current[i] * height;
        const x = i * barW;
        const y = height - h;

        const grad = ctx.createLinearGradient(0, y, 0, height);
        grad.addColorStop(0, "rgba(59,234,59,0.7)");
        grad.addColorStop(1, "rgba(0,255,102,0.1)");

        ctx.fillStyle = grad;
        ctx.fillRect(x + 1, y, barW - 2, h);
      }

      t += 0.016;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pointer-events-none"
    />
  );
}
