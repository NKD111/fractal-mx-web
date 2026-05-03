"use client";
import { useEffect, useRef } from "react";

interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
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
  uniform vec3  uColor;
  uniform float uScale;
  uniform float uNoiseIntensity;
  uniform float uRotation;
  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0+h*h);
    vec3 g;
    g.x  = a0.x * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    float c = cos(uRotation);
    float s = sin(uRotation);
    uv = mat2(c, -s, s, c) * (uv - 0.5) + 0.5;

    float t = uTime * 0.3;
    float n1 = snoise(uv * uScale + vec2(t, t * 0.4)) * uNoiseIntensity;
    float n2 = snoise(uv * uScale * 2.1 + vec2(-t * 0.6, t * 0.8)) * uNoiseIntensity * 0.5;
    float n3 = snoise(uv * uScale * 0.5 + vec2(t * 0.3, -t * 0.5)) * uNoiseIntensity * 0.8;

    float silk = n1 + n2 + n3;
    vec3 col = uColor + vec3(silk * 0.4, silk * 0.35, silk * 0.25);
    float alpha = 0.6 + silk * 0.3;
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`;

export function Silk({
  speed = 1,
  scale = 1,
  color = "#3BEA3B",
  noiseIntensity = 1.5,
  rotation = 0,
  className = "",
}: SilkProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: any, raf = 0;
    let cleanup: (() => void) | undefined;

    (async () => {
      const { Renderer, Camera, Transform, Geometry, Program, Mesh } = await import("ogl");

      renderer = new Renderer({ alpha: true, antialias: false, dpr: 1 });
      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);
      container.appendChild(gl.canvas);
      Object.assign(gl.canvas.style, {
        position: "absolute", inset: "0", width: "100%", height: "100%",
      });

      const resize = () => renderer.setSize(container.clientWidth, container.clientHeight);
      resize();
      window.addEventListener("resize", resize);

      const hex = color.startsWith("#") ? color : "#3BEA3B";
      const r = parseInt(hex.slice(1,3),16)/255;
      const g = parseInt(hex.slice(3,5),16)/255;
      const b = parseInt(hex.slice(5,7),16)/255;

      const geometry = new Geometry(gl, {
        position: { size: 2, data: new Float32Array([-1,-1, 3,-1, -1, 3]) },
      });

      const program = new Program(gl, {
        vertex: VERTEX, fragment: FRAGMENT,
        uniforms: {
          uTime:         { value: 0 },
          uResolution:   { value: [container.clientWidth, container.clientHeight] },
          uColor:        { value: [r, g, b] },
          uScale:        { value: scale * 2 },
          uNoiseIntensity: { value: noiseIntensity * 0.15 },
          uRotation:     { value: rotation },
        },
        transparent: true,
      });

      const camera = new Camera(gl);
      const scene = new Transform();
      const mesh = new Mesh(gl, { geometry, program });
      mesh.setParent(scene);

      let t = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        t += 0.016 * speed;
        program.uniforms.uTime.value = t;
        program.uniforms.uResolution.value = [gl.canvas.width, gl.canvas.height];
        renderer.render({ scene, camera });
      };
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        if (gl.canvas.parentNode) container.removeChild(gl.canvas);
      };
    })();

    return () => cleanup?.();
  }, [speed, scale, color, noiseIntensity, rotation]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    />
  );
}
