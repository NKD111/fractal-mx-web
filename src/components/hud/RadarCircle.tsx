"use client";

import { useEffect, useRef } from "react";

export function RadarCircle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const S = 200;
    canvas.width = S;
    canvas.height = S;
    const cx = S / 2, cy = S / 2;

    const dots = Array.from({ length: 4 }, () => ({
      r: 30 + Math.random() * 55,
      a: Math.random() * Math.PI * 2,
      blink: Math.random(),
    }));

    let angle = 0;
    const trail = new Float32Array(360).fill(0);
    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, S, S);

      // rings
      [80, 55, 30].forEach((r, i) => {
        const opacities = [0.06, 0.10, 0.16];
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59,234,59,${opacities[i]})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // sweep trail
      const deg = Math.floor((angle * 180) / Math.PI) % 360;
      trail[deg] = 1;
      for (let i = 0; i < 360; i++) {
        trail[i] *= 0.975;
      }

      for (let i = 0; i < 360; i++) {
        if (trail[i] < 0.01) continue;
        const a = (i * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, 80, a, a + 0.035);
        ctx.closePath();
        ctx.fillStyle = `rgba(59,234,59,${trail[i] * 0.18})`;
        ctx.fill();
      }

      // sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 80, cy + Math.sin(angle) * 80);
      ctx.strokeStyle = "rgba(59,234,59,0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // blinking dots
      dots.forEach((d) => {
        d.blink += 0.02;
        const alpha = (Math.sin(d.blink * 3) * 0.5 + 0.5) * 0.8 + 0.1;
        const x = cx + Math.cos(d.a) * d.r;
        const y = cy + Math.sin(d.a) * d.r;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,234,59,${alpha})`;
        ctx.fill();
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#3BEA3B";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      angle += 0.022; // ~2rpm
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 pointer-events-none select-none">
      <canvas ref={canvasRef} width={200} height={200} />
      <span className="font-mono text-[9px] text-[#3BEA3B] tracking-widest opacity-50">
        SYS.04
      </span>
    </div>
  );
}
