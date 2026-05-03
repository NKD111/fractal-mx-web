"use client";

import { useEffect, useRef } from "react";

interface ScanningLinesProps {
  count?: number;
  className?: string;
}

export function ScanningLines({ count = 3, className = "" }: ScanningLinesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const lines = Array.from({ length: count }, (_, i) => ({
      y: (i + 1) / (count + 1),
      width: 0,
      speed: 0.004 + i * 0.002,
      thickness: 0.5 + i * 0.4,
      opacity: 0.08 + i * 0.04,
      dir: i % 2 === 0 ? 1 : -1,
      phase: (i / count) * Math.PI * 2,
    }));

    let raf: number;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      lines.forEach((line) => {
        const w = ((Math.sin(t * line.speed + line.phase) * 0.5 + 0.5) * 0.8 + 0.1) * canvas.width;
        const x = line.dir > 0 ? 0 : canvas.width - w;
        const y = line.y * canvas.height;

        const grad = ctx.createLinearGradient(x, 0, x + w, 0);
        if (line.dir > 0) {
          grad.addColorStop(0, `rgba(59,234,59,0)`);
          grad.addColorStop(0.5, `rgba(59,234,59,${line.opacity})`);
          grad.addColorStop(1, `rgba(59,234,59,0)`);
        } else {
          grad.addColorStop(0, `rgba(59,234,59,0)`);
          grad.addColorStop(0.5, `rgba(59,234,59,${line.opacity})`);
          grad.addColorStop(1, `rgba(59,234,59,0)`);
        }

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = line.thickness;
        ctx.stroke();
      });

      t += 1;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
