"use client";
import { useEffect, useRef } from "react";

interface LiquidChromeProps {
  baseColor?: [number, number, number];
  speed?: number;
  amplitude?: number;
  frequencyX?: number;
  frequencyY?: number;
  interactive?: boolean;
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
  uniform vec2  uResolution;
  uniform vec3  uBaseColor;
  uniform float uAmplitude;
  uniform float uFreqX;
  uniform float uFreqY;
  uniform vec2  uMouse;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    uv.x *= aspect;

    vec2 mouseDist = uv - vec2(uMouse.x * aspect, uMouse.y);
    float mouseEffect = exp(-length(mouseDist) * 3.0) * 0.3;

    float t = uTime * 0.5;
    float wave1 = sin(uv.x * uFreqX + t) * uAmplitude;
    float wave2 = cos(uv.y * uFreqY + t * 0.7) * uAmplitude;
    float wave3 = sin((uv.x + uv.y) * uFreqX * 0.5 + t * 1.3) * uAmplitude * 0.5;
    float wave4 = cos(length(uv - 0.5) * uFreqY * 2.0 - t * 0.9) * uAmplitude * (1.0 + mouseEffect);

    float dist = wave1 + wave2 + wave3 + wave4;

    vec3 chrome1 = vec3(0.8, 0.9, 1.0);
    vec3 chrome2 = uBaseColor;
    vec3 chrome3 = vec3(0.1, 0.15, 0.2);

    float n = dist * 0.5 + 0.5;
    vec3 col = mix(chrome3, mix(chrome2, chrome1, n), n);

    // Specular highlight
    float spec = pow(max(0.0, sin(dist * 8.0 + t)), 16.0) * 0.4;
    col += spec;

    gl_FragColor = vec4(col, 0.95);
  }
`;

export function LiquidChrome({
  baseColor = [0.235, 0.918, 0.235],
  speed = 1,
  amplitude = 0.3,
  frequencyX = 3,
  frequencyY = 3,
  interactive = true,
  className = "",
}: LiquidChromeProps) {
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
      if (interactive) window.addEventListener("mousemove", onMove);

      const geometry = new Geometry(gl, {
        position: { size: 2, data: new Float32Array([-1,-1, 3,-1, -1, 3]) },
      });
      const program = new Program(gl, {
        vertex: VERTEX, fragment: FRAGMENT,
        uniforms: {
          uTime:       { value: 0 },
          uResolution: { value: [container.clientWidth, container.clientHeight] },
          uBaseColor:  { value: baseColor },
          uAmplitude:  { value: amplitude },
          uFreqX:      { value: frequencyX },
          uFreqY:      { value: frequencyY },
          uMouse:      { value: [0.5, 0.5] },
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
        program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
        program.uniforms.uMouse.value = [mouseRef.x, mouseRef.y];
        renderer.render({ scene, camera });
      };
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        if (interactive) window.removeEventListener("mousemove", onMove);
        if (gl.canvas.parentNode) container.removeChild(gl.canvas);
      };
    })();

    return () => cleanup?.();
  }, [speed, amplitude, frequencyX, frequencyY, interactive]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    />
  );
}
