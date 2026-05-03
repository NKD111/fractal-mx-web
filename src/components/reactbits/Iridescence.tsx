"use client";
import { useEffect, useRef } from "react";

interface IridescenceProps {
  color?: [number, number, number];
  speed?: number;
  amplitude?: number;
  mouseReactive?: boolean;
  className?: string;
}

const VERTEX = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT = `
  precision highp float;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform vec3  uColor;
  uniform float uAmplitude;
  varying vec2 vUv;

  vec3 hsl2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0, 0.0, 1.0);
    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
  }

  void main() {
    vec2 uv = vUv;
    float dist = length(uv - uMouse);
    float t = uTime * 0.4;

    float angle = atan(uv.y - 0.5, uv.x - 0.5);
    float r = length(uv - 0.5);

    float wave1 = sin(angle * 4.0 + t + r * 8.0) * 0.5 + 0.5;
    float wave2 = cos(r * 12.0 - t * 1.3 + angle * 2.0) * 0.5 + 0.5;
    float wave3 = sin((uv.x + uv.y) * 6.0 + t * 0.7) * 0.5 + 0.5;
    float mouseWave = exp(-dist * 4.0) * sin(dist * 20.0 - t * 3.0) * 0.5;

    float hue = wave1 * 0.4 + wave2 * 0.3 + wave3 * 0.2 + mouseWave * 0.1;
    hue = mod(uColor.x * 0.3 + hue * uAmplitude, 1.0);

    float sat = 0.7 + wave2 * 0.3;
    float lum = 0.4 + wave1 * 0.2 + mouseWave * 0.15;

    vec3 col = hsl2rgb(vec3(hue, sat, lum));
    gl_FragColor = vec4(col, 0.9);
  }
`;

export function Iridescence({
  color = [0.235, 0.918, 0.235],
  speed = 1,
  amplitude = 1,
  mouseReactive = true,
  className = "",
}: IridescenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let renderer: any, raf = 0;
    let cleanup: (() => void) | undefined;
    const mouseRef = { x: 0.5, y: 0.5 };

    (async () => {
      const { Renderer, Camera, Transform, Geometry, Program, Mesh } = await import("ogl");

      renderer = new Renderer({ alpha: false, antialias: false, dpr: 1 });
      const gl = renderer.gl;
      container.appendChild(gl.canvas);
      Object.assign(gl.canvas.style, {
        position: "absolute", inset: "0", width: "100%", height: "100%",
      });

      const resize = () => renderer.setSize(container.clientWidth, container.clientHeight);
      resize();
      window.addEventListener("resize", resize);

      const onMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        mouseRef.x = (e.clientX - rect.left) / rect.width;
        mouseRef.y = 1 - (e.clientY - rect.top) / rect.height;
      };
      if (mouseReactive) window.addEventListener("mousemove", onMove);

      const geometry = new Geometry(gl, {
        position: { size: 2, data: new Float32Array([-1,-1, 3,-1, -1, 3]) },
      });
      const program = new Program(gl, {
        vertex: VERTEX, fragment: FRAGMENT,
        uniforms: {
          uTime:      { value: 0 },
          uMouse:     { value: [0.5, 0.5] },
          uColor:     { value: color },
          uAmplitude: { value: amplitude },
        },
      });

      const camera = new Camera(gl);
      const scene = new Transform();
      new Mesh(gl, { geometry, program }).setParent(scene);

      let t = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        t += 0.016 * speed;
        program.uniforms.uTime.value = t;
        program.uniforms.uMouse.value = [mouseRef.x, mouseRef.y];
        renderer.render({ scene, camera });
      };
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        if (mouseReactive) window.removeEventListener("mousemove", onMove);
        if (gl.canvas.parentNode) container.removeChild(gl.canvas);
      };
    })();

    return () => cleanup?.();
  }, [speed, amplitude, mouseReactive]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    />
  );
}
