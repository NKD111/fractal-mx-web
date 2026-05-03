"use client";

import { useEffect, useRef, useState } from "react";

const TRAIL_LENGTH = 12;

export function NeonCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const mouse = useRef({ x: -200, y: -200 });
  const ring = useRef({ x: -200, y: -200 });
  const trail = useRef<{ x: number; y: number }[]>(
    Array.from({ length: TRAIL_LENGTH }, () => ({ x: -200, y: -200 }))
  );
  const rafId = useRef<number>(0);
  const hoverState = useRef<"default" | "button" | "text" | "image">("default");
  const labelAngle = useRef(0);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.innerWidth < 768) return;

    setVisible(true);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };

      const target = e.target as HTMLElement;
      const isButton =
        target.closest("button") !== null ||
        target.closest("a") !== null ||
        target.closest('[role="button"]') !== null;
      const isText =
        !isButton &&
        (target.tagName === "H1" ||
          target.tagName === "H2" ||
          target.tagName === "H3" ||
          target.tagName === "P");
      const isImage =
        !isButton &&
        (target.tagName === "IMG" ||
          target.closest("[data-cursor='image']") !== null);

      hoverState.current = isButton
        ? "button"
        : isText
        ? "text"
        : isImage
        ? "image"
        : "default";
    };

    window.addEventListener("mousemove", onMove);

    let orbSize = 12;
    let orbTarget = 12;
    let ringSize = 44;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* update trail */
      trail.current.unshift({ ...mouse.current });
      trail.current.length = TRAIL_LENGTH;

      /* draw trail */
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        const t = trail.current[i];
        const ratio = 1 - i / TRAIL_LENGTH;
        const size = 8 * ratio + 1;
        const alpha = 0.55 * ratio * ratio;

        ctx.beginPath();
        ctx.arc(t.x, t.y, size / 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,234,59,${alpha})`;
        ctx.shadowBlur = 8 * ratio;
        ctx.shadowColor = "#3BEA3B";
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      rafId.current = requestAnimationFrame(draw);
    };

    draw();

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    let animId: number;
    const animateDOM = () => {
      /* lerp ring */
      ring.current.x = lerp(ring.current.x, mouse.current.x, 0.08);
      ring.current.y = lerp(ring.current.y, mouse.current.y, 0.08);

      /* orb size */
      orbTarget =
        hoverState.current === "button"
          ? 60
          : hoverState.current === "text"
          ? 4
          : 12;
      orbSize = lerp(orbSize, orbTarget, 0.12);
      ringSize =
        hoverState.current === "button"
          ? lerp(ringSize, 80, 0.1)
          : lerp(ringSize, 44, 0.1);

      const orb = orbRef.current;
      const ringEl = ringRef.current;
      const label = labelRef.current;

      if (orb) {
        orb.style.transform = `translate(${mouse.current.x - orbSize / 2}px, ${
          mouse.current.y - orbSize / 2
        }px)`;
        orb.style.width = `${orbSize}px`;
        orb.style.height =
          hoverState.current === "text" ? "2px" : `${orbSize}px`;
        orb.style.borderRadius = hoverState.current === "text" ? "0" : "50%";
        orb.style.mixBlendMode =
          hoverState.current === "button" ? "difference" : "normal";
      }

      if (ringEl) {
        ringEl.style.transform = `translate(${
          ring.current.x - ringSize / 2
        }px, ${ring.current.y - ringSize / 2}px)`;
        ringEl.style.width = `${ringSize}px`;
        ringEl.style.height = `${ringSize}px`;
        ringEl.style.opacity =
          hoverState.current === "button" ? "0" : "1";
      }

      if (label && hoverState.current === "image") {
        labelAngle.current += 0.5;
        label.style.display = "block";
        label.style.transform = `translate(${mouse.current.x - 30}px, ${
          mouse.current.y - 30
        }px) rotate(${labelAngle.current}deg)`;
      } else if (label) {
        label.style.display = "none";
      }

      animId = requestAnimationFrame(animateDOM);
    };

    animateDOM();

    const hide = () => setVisible(false);
    const show = () => setVisible(true);
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);

    return () => {
      cancelAnimationFrame(rafId.current);
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <>
      {/* trail canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[9997]"
        style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s" }}
      />

      {/* orb */}
      <div
        ref={orbRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full"
        style={{
          width: 12,
          height: 12,
          background: "#3BEA3B",
          filter: "blur(2px)",
          boxShadow: "0 0 8px 2px rgba(59,234,59,0.8)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s",
          willChange: "transform, width, height",
        }}
      />

      {/* ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] rounded-full"
        style={{
          width: 44,
          height: 44,
          border: "1.5px solid rgba(59,234,59,0.4)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s",
          willChange: "transform, width, height",
        }}
      />

      {/* image label */}
      <div
        ref={labelRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
        style={{
          display: "none",
          width: 60,
          height: 60,
          fontFamily: "monospace",
          fontSize: 9,
          letterSpacing: "0.2em",
          color: "#3BEA3B",
          textAlign: "center",
          lineHeight: "60px",
          whiteSpace: "nowrap",
        }}
      >
        VER +
      </div>
    </>
  );
}
