"use client";
import { useEffect, useRef } from "react";

interface SplashCursorProps {
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  SHADING?: boolean;
  COLOR_UPDATE_SPEED?: number;
  BACK_COLOR?: { r: number; g: number; b: number };
  TRANSPARENT?: boolean;
  className?: string;
}

export function SplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0, g: 0, b: 0 },
  TRANSPARENT = false,
  className = "",
}: SplashCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
    container.appendChild(canvas);

    let raf = 0;
    let width = 0, height = 0;

    const gl = canvas.getContext("webgl2", { alpha: TRANSPARENT }) as WebGL2RenderingContext;
    if (!gl) {
      container.removeChild(canvas);
      return;
    }

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, width, height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Minimal fluid splash simulation using WebGL2
    // Simplified version: splats leave color trails on canvas

    const pointers: { x: number; y: number; dx: number; dy: number; color: [number, number, number]; moved: boolean }[] = [];
    let hue = 120; // start with green

    const onMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touches = "touches" in e ? Array.from(e.touches) : [e as MouseEvent];
      touches.forEach((touch) => {
        const x = (touch.clientX - rect.left) / rect.width;
        const y = 1 - (touch.clientY - rect.top) / rect.height;
        const existing = pointers.find((p) => Math.abs(p.x - x) < 0.3 && Math.abs(p.y - y) < 0.3);
        if (existing) {
          existing.dx = (x - existing.x) * SPLAT_FORCE * 0.001;
          existing.dy = (y - existing.y) * SPLAT_FORCE * 0.001;
          existing.x = x;
          existing.y = y;
          existing.moved = true;
        } else {
          hue = (hue + COLOR_UPDATE_SPEED) % 360;
          const r = 59 / 255, g = 234 / 255, b = 59 / 255;
          pointers.push({ x, y, dx: 0, dy: 0, color: [r, g, b], moved: true });
          if (pointers.length > 10) pointers.shift();
        }
      });
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onMove, { passive: true });

    // Fallback canvas2d implementation (no full GLSL fluid sim to keep bundle light)
    // Uses canvas 2D with additive blend for fluid-like appearance
    const ctx2 = document.createElement("canvas").getContext("2d")!;
    const offscreen = ctx2.canvas;
    offscreen.width = DYE_RESOLUTION;
    offscreen.height = DYE_RESOLUTION;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      gl.clearColor(BACK_COLOR.r, BACK_COLOR.g, BACK_COLOR.b, TRANSPARENT ? 0 : 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      ctx2.globalCompositeOperation = "source-over";
      ctx2.fillStyle = `rgba(0,0,0,${DENSITY_DISSIPATION * 0.01})`;
      ctx2.fillRect(0, 0, offscreen.width, offscreen.height);

      pointers.forEach((p) => {
        if (!p.moved) return;
        p.moved = false;
        const px = p.x * offscreen.width;
        const py = (1 - p.y) * offscreen.height;
        const rad = SPLAT_RADIUS * offscreen.width * 0.5;

        const grad = ctx2.createRadialGradient(px, py, 0, px, py, rad);
        grad.addColorStop(0, `rgba(59,234,59,0.6)`);
        grad.addColorStop(0.4, `rgba(59,234,59,0.2)`);
        grad.addColorStop(1, `rgba(59,234,59,0)`);

        ctx2.globalCompositeOperation = "lighter";
        ctx2.fillStyle = grad;
        ctx2.beginPath();
        ctx2.arc(px, py, rad, 0, Math.PI * 2);
        ctx2.fill();
      });

      // Blit to WebGL canvas
      const img = new ImageData(offscreen.width, offscreen.height);
      const d = ctx2.getImageData(0, 0, offscreen.width, offscreen.height);
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offscreen);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchmove", onMove);
      if (canvas.parentNode) container.removeChild(canvas);
    };
  }, [DENSITY_DISSIPATION, SPLAT_RADIUS, SPLAT_FORCE, TRANSPARENT]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    />
  );
}
