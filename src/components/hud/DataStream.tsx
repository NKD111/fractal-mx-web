"use client";

import { useEffect, useRef } from "react";

const CHARS = "0123456789ABCDEF.-+°NWSE";

export function DataStream({ side = "left" }: { side?: "left" | "right" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.innerWidth < 768) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = 60;

    const resize = () => {
      canvas.width = W;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COLS = 4;
    const colW = W / COLS;
    const FONT_SIZE = 10;
    const drops = Array.from({ length: COLS }, (_, i) => ({
      y: -Math.random() * canvas.height,
      speed: 0.4 + Math.random() * 0.6,
    }));

    let raf: number;
    const draw = () => {
      ctx.fillStyle = "rgba(8,8,8,0.12)";
      ctx.fillRect(0, 0, W, canvas.height);

      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;

      drops.forEach((drop, col) => {
        const x = col * colW + colW / 2 - FONT_SIZE / 2;
        // draw a few chars
        for (let row = 0; row < 6; row++) {
          const charY = drop.y - row * FONT_SIZE;
          if (charY < 0 || charY > canvas.height) continue;
          const alpha = (1 - row / 6) * 0.12;
          ctx.fillStyle = `rgba(59,234,59,${alpha})`;
          ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, charY);
        }
        drop.y += drop.speed;
        if (drop.y - 6 * FONT_SIZE > canvas.height) {
          drop.y = -Math.random() * 200;
        }
      });

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed top-0 z-[1]"
      style={{
        [side === "left" ? "left" : "right"]: 0,
        opacity: 0.7,
      }}
    />
  );
}
