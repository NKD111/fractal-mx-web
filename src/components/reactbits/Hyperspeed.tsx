"use client";
import { useEffect, useRef } from "react";

interface HyperspeedProps {
  effectOptions?: {
    onSpeedUp?: (ev: Event) => void;
    onSlowDown?: (ev: Event) => void;
    distortion?: string;
    length?: number;
    roadWidth?: number;
    islandWidth?: number;
    lanesPerRoad?: number;
    fov?: number;
    fovSpeedUp?: number;
    speedUp?: number;
    carLightsFade?: number;
    totalSideLightSticks?: number;
    lightPairsPerRoadWay?: number;
    colors?: {
      roadColor?: number;
      islandColor?: number;
      background?: number;
      shoulderLines?: number;
      brokenLines?: number;
      leftCars?: number[];
      rightCars?: number[];
      sticks?: number;
    };
  };
  className?: string;
}

export function Hyperspeed({ effectOptions = {}, className = "" }: HyperspeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let speed = 0;
    let targetSpeed = 0;
    let time = 0;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const STAR_COUNT = 300;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: Math.random(),
      pz: 0,
    }));

    const accelerate = () => { targetSpeed = 1; };
    const decelerate = () => { targetSpeed = 0; };

    window.addEventListener("mousedown", accelerate);
    window.addEventListener("mouseup", decelerate);
    window.addEventListener("touchstart", accelerate);
    window.addEventListener("touchend", decelerate);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      time += 0.016;
      speed += (targetSpeed - speed) * 0.05;
      const baseSpeed = 0.003 + speed * 0.06;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h * 0.52;

      ctx.fillStyle = `rgba(8,8,8,${0.3 + speed * 0.4})`;
      ctx.fillRect(0, 0, w, h);

      const fov = 250 + speed * 80;

      stars.forEach((star) => {
        star.pz = star.z;
        star.z -= baseSpeed;
        if (star.z <= 0) {
          star.x = (Math.random() - 0.5) * 2;
          star.y = (Math.random() - 0.5) * 2;
          star.z = 1;
          star.pz = 1;
        }

        const sx = (star.x / star.z) * fov + cx;
        const sy = (star.y / star.z) * fov + cy;
        const px = (star.x / star.pz) * fov + cx;
        const py = (star.y / star.pz) * fov + cy;

        const size = Math.max(0.5, (1 - star.z) * 2.5);
        const bright = 1 - star.z;
        const r = Math.floor(59 + bright * 60);
        const g = Math.floor(234 + bright * 21);
        const b = Math.floor(59 + bright * 60);
        const alpha = bright * (0.4 + speed * 0.6);

        if (speed > 0.1 && Math.abs(sx - px) + Math.abs(sy - py) > 1) {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.8})`;
          ctx.lineWidth = size * 0.6;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(sx, sy, size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.fill();
        }
      });

      // Center vignette
      if (speed > 0.05) {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w,h) * 0.6);
        grad.addColorStop(0, `rgba(59,234,59,${speed * 0.06})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousedown", accelerate);
      window.removeEventListener("mouseup", decelerate);
      window.removeEventListener("touchstart", accelerate);
      window.removeEventListener("touchend", decelerate);
      if (canvas.parentNode) container.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden", cursor: "pointer" }}
    />
  );
}
