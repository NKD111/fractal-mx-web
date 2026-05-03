"use client";
import { useEffect, useRef } from "react";

interface ThreadsProps {
  color?: [number, number, number];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
  className?: string;
}

export function Threads({
  color = [0.235, 0.918, 0.235],
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = true,
  className = "",
}: ThreadsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: any, scene: any, camera: any;
    let raf = 0;
    let cleanup: (() => void) | undefined;

    (async () => {
      const { Renderer, Camera, Transform, Geometry, Program, Mesh } = await import("ogl");

      renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio, 2) });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      container.appendChild(gl.canvas);
      Object.assign(gl.canvas.style, {
        position: "absolute", inset: "0", width: "100%", height: "100%",
      });

      camera = new Camera(gl);
      camera.position.z = 5;
      scene = new Transform();

      const resize = () => {
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      resize();
      window.addEventListener("resize", resize);

      const COUNT = 80;
      const mousePos = { x: 0, y: 0 };

      const onMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mousePos.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      };
      if (enableMouseInteraction) window.addEventListener("mousemove", onMove);

      const vertex = `
        attribute vec2 position;
        attribute float index;
        uniform float uTime;
        uniform float uAmplitude;
        uniform float uDistance;
        uniform vec2 uMouse;
        varying float vIndex;
        varying float vAlpha;
        void main() {
          vIndex = index;
          float t = uTime * 0.4 + index * 0.12;
          float y = position.y;
          float x = position.x;
          float wave = sin(y * 3.0 + t) * 0.08 * uAmplitude;
          wave += cos(y * 5.0 - t * 1.3) * 0.04 * uAmplitude;
          float mx = (uMouse.x - x) * 0.15 * uAmplitude;
          float my = (uMouse.y - y) * 0.06 * uAmplitude;
          float dist = length(vec2(x, y) - uMouse) + 0.0001;
          float pull = 0.06 * uAmplitude / (dist + 0.3);
          x += wave + mx * pull;
          y += my * pull * 0.3;
          vAlpha = 0.15 + abs(sin(index * 0.15 + uTime * 0.2)) * 0.6;
          gl_Position = vec4(x, y, 0.0, 1.0);
        }
      `;
      const fragment = `
        precision highp float;
        uniform vec3 uColor;
        varying float vIndex;
        varying float vAlpha;
        void main() {
          gl_FragColor = vec4(uColor, vAlpha);
        }
      `;

      const SEGMENTS = 120;
      const positions: number[] = [];
      const indices_arr: number[] = [];
      const indexAttr: number[] = [];

      for (let i = 0; i < COUNT; i++) {
        const x = (i / COUNT) * 2.2 - 1.1;
        for (let j = 0; j <= SEGMENTS; j++) {
          const y = (j / SEGMENTS) * 2 - 1;
          positions.push(x, y);
          indexAttr.push(i);
        }
        for (let j = 0; j < SEGMENTS; j++) {
          const base = i * (SEGMENTS + 1) + j;
          indices_arr.push(base, base + 1);
        }
      }

      const geometry = new Geometry(gl, {
        position: { size: 2, data: new Float32Array(positions) },
        index:    { size: 1, data: new Float32Array(indexAttr) },
      });

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime:      { value: 0 },
          uAmplitude: { value: amplitude },
          uDistance:  { value: distance },
          uMouse:     { value: [0, 0] },
          uColor:     { value: color },
        },
        transparent: true,
      });

      const mesh = new Mesh(gl, { mode: gl.LINES, geometry, program });
      mesh.setParent(scene);

      let t = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        t += 0.016;
        program.uniforms.uTime.value = t;
        program.uniforms.uMouse.value = [mousePos.x, mousePos.y];
        renderer.render({ scene, camera });
      };
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        if (enableMouseInteraction) window.removeEventListener("mousemove", onMove);
        if (gl.canvas.parentNode) container.removeChild(gl.canvas);
      };
    })();

    return () => cleanup?.();
  }, [amplitude, distance, enableMouseInteraction]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    />
  );
}
