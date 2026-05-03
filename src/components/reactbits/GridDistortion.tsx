"use client";
import { useEffect, useRef } from "react";

interface GridDistortionProps {
  imageSrc?: string;
  grid?: number;
  mouse?: number;
  strength?: number;
  relaxation?: number;
  className?: string;
}

const VERTEX = `
  precision highp float;
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform vec2  uMouse;
  uniform float uStrength;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 dist = uv - uMouse;
    float d = length(dist);
    float falloff = exp(-d * 3.5) * uStrength;
    uv += dist * falloff * 0.15;

    // Subtle wave
    uv.x += sin(uv.y * 8.0 + uTime * 0.5) * 0.003 * uStrength;
    uv.y += cos(uv.x * 8.0 + uTime * 0.4) * 0.003 * uStrength;

    vec4 col = texture2D(uTexture, clamp(uv, 0.0, 1.0));
    gl_FragColor = col;
  }
`;

export function GridDistortion({
  imageSrc = "",
  grid = 15,
  mouse = 0.1,
  strength = 0.15,
  relaxation = 0.9,
  className = "",
}: GridDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let renderer: any, raf = 0;
    let cleanup: (() => void) | undefined;
    const mouseRef = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    (async () => {
      const { Renderer, Camera, Transform, Geometry, Program, Mesh, Texture } = await import("ogl");

      renderer = new Renderer({ alpha: true, antialias: false, dpr: 1 });
      const gl = renderer.gl;
      gl.clearColor(0,0,0,0);
      container.appendChild(gl.canvas);
      Object.assign(gl.canvas.style, {
        position: "absolute", inset: "0", width: "100%", height: "100%",
      });

      const resize = () => renderer.setSize(container.clientWidth, container.clientHeight);
      resize();
      window.addEventListener("resize", resize);

      const texture = new Texture(gl);
      if (imageSrc) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => { texture.image = img; };
        img.src = imageSrc;
      }

      const onMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        mouseRef.tx = (e.clientX - rect.left) / rect.width;
        mouseRef.ty = 1 - (e.clientY - rect.top) / rect.height;
      };
      window.addEventListener("mousemove", onMove);

      const geometry = new Geometry(gl, {
        position: { size: 2, data: new Float32Array([-1,-1, 3,-1, -1, 3]) },
        uv: { size: 2, data: new Float32Array([0,0, 2,0, 0,2]) },
      });
      const program = new Program(gl, {
        vertex: VERTEX, fragment: FRAGMENT,
        uniforms: {
          uTexture:  { value: texture },
          uMouse:    { value: [0.5, 0.5] },
          uStrength: { value: strength },
          uTime:     { value: 0 },
        },
        transparent: true,
      });

      const camera = new Camera(gl);
      const scene = new Transform();
      new Mesh(gl, { geometry, program }).setParent(scene);

      let t = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        t += 0.016;
        mouseRef.x += (mouseRef.tx - mouseRef.x) * (1 - relaxation);
        mouseRef.y += (mouseRef.ty - mouseRef.y) * (1 - relaxation);
        program.uniforms.uMouse.value = [mouseRef.x, mouseRef.y];
        program.uniforms.uTime.value = t;
        renderer.render({ scene, camera });
      };
      raf = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", resize);
        window.removeEventListener("mousemove", onMove);
        if (gl.canvas.parentNode) container.removeChild(gl.canvas);
      };
    })();

    return () => cleanup?.();
  }, [imageSrc, grid, mouse, strength, relaxation]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    />
  );
}
