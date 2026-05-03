"use client";

import { useEffect, useRef } from "react";

export function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseX = useRef(0.5);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const BARS = 80;
    const H = 60;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = H;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouseX.current = e.clientX / window.innerWidth;
    };
    window.addEventListener("mousemove", onMove);

    let raf: number;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, H);
      const W = canvas.width;
      const barW = W / BARS;

      for (let i = 0; i < BARS; i++) {
        const norm = i / BARS;
        const mouseDist = Math.abs(norm - mouseX.current);
        const mouseEffect = Math.max(0, 1 - mouseDist * 4) * 18;
        const h =
          12 +
          Math.abs(Math.sin(norm * Math.PI * 4 + t)) * 14 +
          Math.abs(Math.sin(norm * Math.PI * 7 - t * 1.3)) * 8 +
          mouseEffect;

        const edgeFade = 1 - Math.pow(Math.abs(norm - 0.5) * 2, 2.5);
        const alpha = 0.08 + edgeFade * 0.22;

        const x = i * barW;
        const y = (H - h) / 2;

        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, `rgba(59,234,59,${alpha * 0.3})`);
        grad.addColorStop(0.5, `rgba(59,234,59,${alpha})`);
        grad.addColorStop(1, `rgba(59,234,59,${alpha * 0.3})`);

        ctx.fillStyle = grad;
        ctx.fillRect(x + 1, y, barW - 2, h);
      }

      t += 0.04;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full pointer-events-none"
      style={{ height: 60 }}
    />
  );
}
