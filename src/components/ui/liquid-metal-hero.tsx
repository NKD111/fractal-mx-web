"use client";

import { LiquidMetal } from '@paper-design/shaders-react';
import { motion, useSpring } from 'framer-motion';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useAudio } from '@/context/AudioContext';

/* ──────────────────────────────────────────────────────────────────────
   colorBack: "#000000" + mixBlendMode: "screen"
   → negro puro desaparece sobre fondo oscuro, sólo flotan los blobs
   shape: "metaballs" → blobs que se fusionan como lámpara de lava
   softness alta → bordes suaves y orgánicos
   speed muy bajo   → movimiento lento y viscoso
   ────────────────────────────────────────────────────────────────────── */

const BASE = {
  colorBack:  "#000000",
  colorTint:  "#b4b4b8",   /* plata-mercurio */
  shape:      "metaballs" as const,
  repetition: 1.3,
  softness:   0.82,
  shiftRed:  -0.04,
  shiftBlue:  0.08,
};

const S_SM: Parameters<typeof LiquidMetal>[0] = {
  colorBack: "#000000", colorTint: "#8a8a8e",
  shape: "metaballs", repetition: 1.1,
  distortion: 0.44, contour: 0.38, softness: 0.85,
  speed: 0.07, shiftRed: -0.03, shiftBlue: 0.07,
};

const S_XS: Parameters<typeof LiquidMetal>[0] = {
  colorBack: "#000000", colorTint: "#6a6a6e",
  shape: "metaballs", repetition: 1.0,
  distortion: 0.36, contour: 0.30, softness: 0.88,
  speed: 0.06, shiftRed: -0.02, shiftBlue: 0.05,
};

/* ── Dynamic shader states ── */
const STATE = {
  idle:  { distortion: 0.48, contour: 0.40, speed: 0.09 },
  hover: { distortion: 0.62, contour: 0.56, speed: 0.20 },
  click: { distortion: 0.82, contour: 0.76, speed: 0.50 },
};

/* ── Softer springs = more languid / lava-lamp feel ── */
const SP_TILT  = { stiffness: 75,  damping: 17, mass: 1.1 };
const SP_SCALE = { stiffness: 130, damping: 24 };

export default function LiquidMetalHeroVisual() {
  const { play } = useAudio();
  const blobRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [shader, setShader] = useState(STATE.idle);

  const tiltX    = useSpring(0, SP_TILT);
  const tiltY    = useSpring(0, SP_TILT);
  const blobSc   = useSpring(1, SP_SCALE);

  /* ── Mouse tracking ── */
  const onMove = useCallback((e: MouseEvent) => {
    const el = blobRef.current;
    if (!el) return;
    const r  = el.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
    const ny = ((e.clientY - r.top)  / r.height - 0.5) * 2;
    tiltX.set(ny * -13);   /* ±13° — suave */
    tiltY.set(nx * 17);    /* ±17° */
  }, [tiltX, tiltY]);

  const onEnter = useCallback(() => {
    setHovered(true);
    setShader(STATE.hover);
    blobSc.set(1.04);
    window.addEventListener('mousemove', onMove);
  }, [blobSc, onMove]);

  const onLeave = useCallback(() => {
    setHovered(false);
    setShader(STATE.idle);
    blobSc.set(1);
    tiltX.set(0);
    tiltY.set(0);
    window.removeEventListener('mousemove', onMove);
  }, [blobSc, onMove, tiltX, tiltY]);

  /* ── Click: volteo 3D elegante en 3 fases ── */
  const onClick = useCallback(() => {
    setShader(STATE.click);
    tiltY.set(80);  tiltX.set(-14);
    setTimeout(() => { tiltY.set(-80); tiltX.set(10); }, 400);
    setTimeout(() => { tiltY.set(0);   tiltX.set(0);  }, 800);
    setTimeout(() => setShader(hovered ? STATE.hover : STATE.idle), 1050);
  }, [hovered, tiltX, tiltY]);

  useEffect(() => () => window.removeEventListener('mousemove', onMove), [onMove]);


  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "visible" }}>

      {/* ── Perspectiva para el tilt 3D ── */}
      <div style={{ perspective: "1400px", perspectiveOrigin: "50% 50%", position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>

          {/* ── BLOB PRINCIPAL (500px)
                mixBlendMode:"screen" → colorBack negro = invisible
                Sólo los blobs metálicos flotan sobre el Hero ── */}
          <motion.div
            ref={blobRef}
            style={{
              width: 500, height: 500,
              rotateX: tiltX, rotateY: tiltY,
              scale: blobSc,
              transformStyle: "preserve-3d",
              mixBlendMode: "screen",
              cursor: "none",
              filter: "drop-shadow(0 0 28px rgba(59,234,59,0.06))",
            }}
            animate={{ y: [-10, 2, -10] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onClick={onClick}
          >
            <LiquidMetal
              {...BASE}
              {...shader}
              style={{ width: "100%", height: "100%" }}
            />
          </motion.div>
        </div>
      </div>

      {/* ── Blob secundario — pieza más pequeña flotando abajo-derecha ── */}
      <motion.div
        style={{
          position: "absolute", width: 190, height: 190,
          bottom: "5%", right: "3%",
          mixBlendMode: "screen",
        }}
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2.2 }}
      >
        <LiquidMetal {...S_SM} style={{ width: "100%", height: "100%" }} />
      </motion.div>

      {/* ── Blob terciario — satélite pequeño arriba-izquierda ── */}
      <motion.div
        style={{
          position: "absolute", width: 100, height: 100,
          top: "9%", left: "11%",
          mixBlendMode: "screen",
          opacity: 0.72,
        }}
        animate={{ y: [0, 13, 0], x: [0, 5, 0] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
      >
        <LiquidMetal {...S_XS} style={{ width: "100%", height: "100%" }} />
      </motion.div>

      {/* ── Tinte verde de marca — muy sutil ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
        background: "radial-gradient(circle at 50% 50%, rgba(59,234,59,0.04) 0%, transparent 55%)",
      }} />
    </div>
  );
}
