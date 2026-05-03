"use client";

import { useEffect, useRef } from "react";

const C = "#3BEA3B";
const TRAIL_MAX = 16;

type HoverType = "button" | "image" | null;

export function NeonCursor() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const ringRef     = useRef<HTMLDivElement>(null);
  const verTextRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) return;
    if ("ontouchstart" in window) return;

    const canvas = canvasRef.current;
    const ring   = ringRef.current;
    const verEl  = verTextRef.current;
    if (!canvas || !ring || !verEl) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* --- state --- */
    const mouse  = { x: -999, y: -999 };
    const orb    = { x: -999, y: -999 };
    const ringP  = { x: -999, y: -999 };
    const trail: { x: number; y: number }[] = [];
    let   hover: HoverType = null;
    let   spinAngle = 0;
    let   raf = 0;

    /* --- resize --- */
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    /* --- mouse move --- */
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      trail.push({ x: e.clientX, y: e.clientY });
      if (trail.length > TRAIL_MAX) trail.shift();

      const target = e.target as HTMLElement;
      const isBtn = !!target.closest("button, a, [role='button'], .magnetic-btn");
      const isImg = !!target.closest("img, [data-cursor='image'], .portfolio-card");
      hover = isBtn ? "button" : isImg ? "image" : null;
    };
    window.addEventListener("mousemove", onMove);

    /* --- lerp --- */
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    /* --- raf loop --- */
    const tick = () => {
      const { x, y } = mouse;

      /* orb follows fast */
      orb.x = lerp(orb.x, x, 0.22);
      orb.y = lerp(orb.y, y, 0.22);

      /* ring follows with lerp 0.08 */
      ringP.x = lerp(ringP.x, x, 0.08);
      ringP.y = lerp(ringP.y, y, 0.08);

      /* --- canvas: trail + orb --- */
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* trail points */
      for (let i = 0; i < trail.length; i++) {
        const p   = trail[i];
        const t   = i / trail.length;
        const r   = t * 4;
        const op  = t * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.1, r), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,234,59,${op})`;
        ctx.fill();
      }

      /* orb */
      ctx.save();
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = C;
      ctx.shadowColor = C;
      ctx.shadowBlur  = 8;
      ctx.fill();
      ctx.restore();

      /* --- ring DOM --- */
      const isBtn = hover === "button";
      const isImg = hover === "image";
      const ringSize = isBtn ? 70 : 40;

      ring.style.left   = `${ringP.x}px`;
      ring.style.top    = `${ringP.y}px`;
      ring.style.width  = `${ringSize}px`;
      ring.style.height = `${ringSize}px`;
      ring.style.mixBlendMode = isBtn ? "difference" : "normal";

      /* --- VER + SVG text --- */
      verEl.style.opacity = isImg ? "1" : "0";
      if (isImg) {
        verEl.style.left = `${x}px`;
        verEl.style.top  = `${y}px`;
        spinAngle += 0.5;
        const svgEl = verEl.querySelector(".ver-svg") as SVGElement | null;
        if (svgEl) svgEl.style.transform = `rotate(${spinAngle}deg)`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <>
      {/* trail + orb canvas */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0,
          pointerEvents: "none", zIndex: 9997,
        }}
      />

      {/* ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          width: 40, height: 40,
          borderRadius: "50%",
          border: `1.5px solid rgba(59,234,59,0.5)`,
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
          zIndex: 9999,
          transition: "width 0.25s cubic-bezier(0.16,1,0.3,1), height 0.25s cubic-bezier(0.16,1,0.3,1)",
          willChange: "left, top",
        }}
      />

      {/* VER + rotating text */}
      <div
        ref={verTextRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          width: 80, height: 80,
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0,
          transition: "opacity 0.25s",
        }}
      >
        <svg
          className="ver-svg"
          viewBox="0 0 80 80"
          width="80" height="80"
          fill="none"
          style={{ transformOrigin: "40px 40px" }}
        >
          <path id="ver-path" d="M40,8 A32,32 0 1,1 39.99,8" fill="none" />
          <text>
            <textPath
              href="#ver-path"
              style={{
                fill: C,
                fontSize: 9,
                fontFamily: "monospace",
                letterSpacing: "4px",
                textTransform: "uppercase",
              }}
            >
              VER + VER + VER + VER +{" "}
            </textPath>
          </text>
        </svg>
      </div>
    </>
  );
}
