"use client";
import { useEffect, useRef } from "react";

interface RibbonsProps {
  colors?: string[];
  count?: number;
  thickness?: number;
  spring?: number;
  friction?: number;
  offsetFactor?: number;
  className?: string;
}

export function Ribbons({
  colors = ["#3BEA3B", "#2fd132", "#ffffff"],
  count = 3,
  thickness = 24,
  spring = 0.03,
  friction = 0.9,
  offsetFactor = 0.06,
  className = "",
}: RibbonsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: any, scene: any, camera: any;
    let polylines: any[] = [];
    let raf = 0;
    let cleanup: (() => void) | undefined;

    const mouseRef = { x: 0, y: 0 };

    (async () => {
      const { Renderer, Camera, Transform, Color, Vec3, Polyline } = await import("ogl");

      renderer = new Renderer({ alpha: true, antialias: true });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      container.appendChild(gl.canvas);
      Object.assign(gl.canvas.style, {
        position: "absolute", inset: "0",
        width: "100%", height: "100%",
        pointerEvents: "none",
      });

      camera = new Camera(gl, { fov: 15 });
      camera.position.z = 20;
      scene = new Transform();

      const resize = () => {
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
      };
      resize();
      window.addEventListener("resize", resize);

      const TRAIL = 80;

      polylines = Array.from({ length: count }, (_, i) => {
        const pts = Array.from({ length: TRAIL }, () => new Vec3());
        const poly = new Polyline(gl, {
          points: pts,
          vertex: `
            precision highp float;
            attribute vec3 position;
            attribute vec3 next;
            attribute vec3 prev;
            attribute float side;
            uniform vec2 uResolution;
            uniform float uDPR;
            uniform float uThickness;
            uniform mat4 projectionMatrix;
            uniform mat4 modelViewMatrix;
            void main() {
              mat4 m = projectionMatrix * modelViewMatrix;
              vec4 cur = m * vec4(position, 1);
              vec4 nx  = m * vec4(next, 1);
              vec4 pv  = m * vec4(prev, 1);
              vec2 asp = vec2(uResolution.x / uResolution.y, 1.0);
              vec2 cs = cur.xy / cur.w * asp;
              vec2 ns = nx.xy  / nx.w  * asp;
              vec2 ps = pv.xy  / pv.w  * asp;
              vec2 toNext = normalize(ns - cs);
              vec2 toPrev = normalize(cs - ps);
              vec2 tan = normalize(toNext + toPrev);
              vec2 norm = vec2(-tan.y, tan.x) / asp;
              norm /= dot(norm, vec2(-tan.y, tan.x) / asp);
              float pw = cur.w * (1.0 / (uResolution.y / uDPR));
              norm *= pw * uThickness;
              cur.xy -= norm * side;
              gl_Position = cur;
            }
          `,
          fragment: `
            precision highp float;
            uniform vec3 uColor;
            uniform float uOpacity;
            void main() { gl_FragColor = vec4(uColor, uOpacity); }
          `,
          uniforms: {
            uColor:   { value: new Color(colors[i % colors.length]) },
            uOpacity: { value: 0.85 - i * 0.08 },
            uThickness: { value: thickness * (1 - i * 0.1) },
          },
        });
        poly.mesh.setParent(scene);
        return { poly, pts, vx: 0, vy: 0, cx: 0, cy: 0, i };
      });

      const onMove = (e: MouseEvent | TouchEvent) => {
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
        mouseRef.x = (clientX / window.innerWidth) * 2 - 1;
        mouseRef.y = -(clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchmove", onMove, { passive: true });

      const tick = () => {
        raf = requestAnimationFrame(tick);
        const aspect = camera.aspect ?? 1;
        const fovRad = (camera.fov * Math.PI) / 180;
        const halfH = camera.position.z * Math.tan(fovRad / 2);
        const halfW = halfH * aspect;

        polylines.forEach(({ poly, pts, i: idx }) => {
          const tx = mouseRef.x * halfW + (idx - count / 2) * offsetFactor * halfW * 2;
          const ty = mouseRef.y * halfH;

          for (let j = pts.length - 1; j > 0; j--) {
            pts[j].lerp(pts[j - 1], friction);
          }
          pts[0].x += (tx - pts[0].x) * spring;
          pts[0].y += (ty - pts[0].y) * spring;

          poly.updateGeometry();
        });

        renderer.render({ scene, camera });
      };
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("touchmove", onMove);
        if (gl.canvas.parentNode) container.removeChild(gl.canvas);
      };
    })();

    return () => cleanup?.();
  }, [count, thickness, spring, friction, offsetFactor]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    />
  );
}
