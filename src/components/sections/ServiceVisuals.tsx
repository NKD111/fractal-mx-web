'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

const G = '#3BEA3B';

function sub(sp: MotionValue<number>, a: number, b: number) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useTransform(sp, [a, b], [0, 1], { clamp: true });
}

function HUDCorners({ size = 14, opacity = 0.35 }: { size?: number; opacity?: number }) {
  const corners = ['tl', 'tr', 'bl', 'br'] as const;
  return (
    <>
      {corners.map((c) => (
        <span key={c} aria-hidden style={{
          position: 'absolute',
          width: size, height: size,
          top:    c.includes('t') ? 8 : 'auto',
          bottom: c.includes('b') ? 8 : 'auto',
          left:   c.includes('l') ? 8 : 'auto',
          right:  c.includes('r') ? 8 : 'auto',
          borderTop:    c.includes('t') ? `1px solid ${G}` : 'none',
          borderBottom: c.includes('b') ? `1px solid ${G}` : 'none',
          borderLeft:   c.includes('l') ? `1px solid ${G}` : 'none',
          borderRight:  c.includes('r') ? `1px solid ${G}` : 'none',
          opacity,
        }} />
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   01 — Producción Audiovisual — Cinema Camera
═══════════════════════════════════════════════════════ */
function CameraVisual({ sp }: { sp: MotionValue<number> }) {
  const body    = sub(sp, 0.00, 0.30);
  const lens1   = sub(sp, 0.20, 0.45);
  const lens2   = sub(sp, 0.32, 0.55);
  const lens3   = sub(sp, 0.42, 0.62);
  const cross   = sub(sp, 0.52, 0.70);
  const reel    = sub(sp, 0.60, 0.85);
  const handle  = sub(sp, 0.72, 0.90);

  return (
    <div style={{ position: 'relative', width: 300, height: 200 }}>
      <HUDCorners />
      <svg width="300" height="200" viewBox="0 0 300 200" fill="none" style={{ overflow: 'visible' }}>
        {/* Body with clipped corners */}
        <motion.path
          d="M20 50 L32 22 L168 22 L180 50 L280 50 L280 158 L20 158 Z"
          stroke={G} strokeWidth="1.2" fill="none"
          style={{ pathLength: body }} />
        {/* Lens outer ring 60r */}
        <motion.circle cx="148" cy="104" r="60"
          stroke={G} strokeWidth="1.2" fill="none"
          style={{ pathLength: lens1 }} />
        {/* Lens mid ring 42r */}
        <motion.circle cx="148" cy="104" r="42"
          stroke={G} strokeWidth="0.7" fill="none" opacity={0.5}
          style={{ pathLength: lens2 }} />
        {/* Lens inner ring 24r */}
        <motion.circle cx="148" cy="104" r="24"
          stroke={G} strokeWidth="0.7" fill="none" opacity={0.4}
          style={{ pathLength: lens3 }} />
        {/* Crosshair */}
        <motion.line x1="110" y1="104" x2="186" y2="104"
          stroke={G} strokeWidth="0.6" opacity={0.5}
          style={{ pathLength: cross }} />
        <motion.line x1="148" y1="66" x2="148" y2="142"
          stroke={G} strokeWidth="0.6" opacity={0.5}
          style={{ pathLength: cross }} />
        {/* Film reels */}
        <motion.circle cx="46" cy="104" r="22"
          stroke={G} strokeWidth="0.7" fill="none" opacity={0.4}
          style={{ pathLength: reel }} />
        <motion.circle cx="252" cy="104" r="22"
          stroke={G} strokeWidth="0.7" fill="none" opacity={0.4}
          style={{ pathLength: reel }} />
        {/* Reel inner circles */}
        <motion.circle cx="46" cy="104" r="10"
          stroke={G} strokeWidth="0.5" fill="none" opacity={0.25}
          style={{ pathLength: reel }} />
        <motion.circle cx="252" cy="104" r="10"
          stroke={G} strokeWidth="0.5" fill="none" opacity={0.25}
          style={{ pathLength: reel }} />
        {/* Handle */}
        <motion.rect x="110" y="158" width="76" height="20" rx="2"
          stroke={G} strokeWidth="0.8" fill="none" opacity={0.4}
          style={{ pathLength: handle }} />
        {/* Viewfinder bump */}
        <motion.rect x="82" y="12" width="40" height="12" rx="1"
          stroke={G} strokeWidth="0.7" fill="none" opacity={0.3}
          style={{ pathLength: handle }} />
      </svg>

      {/* REC blink */}
      <motion.div style={{
        position: 'absolute', top: 14, right: 14,
        fontFamily: 'var(--font-mono)', fontSize: 9, color: G, letterSpacing: '1px',
      }}
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'linear', times: [0, 0.49, 0.5, 1] }}>
        REC ●
      </motion.div>

      {/* Lens pulse idle */}
      <motion.div style={{
        position: 'absolute', top: '50%', left: '50%',
        width: 124, height: 124, borderRadius: '50%',
        border: `1px solid rgba(59,234,59,0.15)`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} />

      {/* Scan line */}
      <motion.div style={{
        position: 'absolute', left: 20, right: 20, height: 1,
        background: `rgba(59,234,59,0.25)`, pointerEvents: 'none',
      }}
        animate={{ top: ['12%', '88%'] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }} />

      {/* Lens data */}
      <motion.div style={{
        position: 'absolute', bottom: 32, left: 12,
        fontFamily: 'var(--font-mono)', fontSize: 7, color: G, opacity: 0.4, letterSpacing: '1px',
      }}
        initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.5 }}>
        24mm f/1.4
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   02 — Estrategia de Contenido — Smartphone + Reels
═══════════════════════════════════════════════════════ */
function SmartphoneVisual({ sp }: { sp: MotionValue<number> }) {
  const body    = sub(sp, 0.00, 0.30);
  const screen  = sub(sp, 0.22, 0.48);
  const bar     = sub(sp, 0.40, 0.65);
  const wifi1   = sub(sp, 0.55, 0.68);
  const wifi2   = sub(sp, 0.62, 0.75);
  const wifi3   = sub(sp, 0.68, 0.82);
  const wifi4   = sub(sp, 0.74, 0.88);
  const wifi5   = sub(sp, 0.80, 0.94);

  return (
    <div style={{ position: 'relative', width: 200, height: 320 }}>
      <HUDCorners />
      <svg width="200" height="320" viewBox="0 0 200 320" fill="none" style={{ overflow: 'visible' }}>
        {/* Phone body */}
        <motion.rect x="40" y="10" width="120" height="240" rx="12"
          stroke={G} strokeWidth="1.2" fill="none"
          style={{ pathLength: body }} />
        {/* Notch */}
        <motion.rect x="80" y="10" width="40" height="10" rx="4"
          stroke={G} strokeWidth="0.7" fill="none" opacity={0.4}
          style={{ pathLength: body }} />
        {/* Screen area */}
        <motion.rect x="50" y="30" width="100" height="180" rx="2"
          stroke={G} strokeWidth="0.7" fill="none" opacity={0.3}
          style={{ pathLength: screen }} />
        {/* Screen content lines */}
        {[55, 75, 95, 115].map((y, i) => (
          <motion.line key={i} x1="60" y1={y} x2={130 - i * 8} y2={y}
            stroke={G} strokeWidth="0.8" opacity={0.35}
            style={{ pathLength: screen }} />
        ))}
        {/* Progress bar */}
        <motion.rect x="50" y="220" width="100" height="4" rx="2"
          stroke={G} strokeWidth="0.6" fill="none" opacity={0.3}
          style={{ pathLength: bar }} />
        <motion.rect x="50" y="220" width="68" height="4" rx="2"
          stroke={G} strokeWidth="0.6" fill="none" opacity={0.5}
          style={{ pathLength: bar }} />
        {/* Home indicator */}
        <motion.rect x="80" y="238" width="40" height="3" rx="1.5"
          stroke={G} strokeWidth="0.6" fill="none" opacity={0.25}
          style={{ pathLength: bar }} />
        {/* WiFi arcs */}
        {[14, 24, 34, 44, 54].map((r, i) => {
          const paths = [wifi1, wifi2, wifi3, wifi4, wifi5];
          return (
            <motion.path key={i}
              d={`M ${100 - r * 0.7} ${-10} A ${r} ${r} 0 0 1 ${100 + r * 0.7} ${-10}`}
              stroke={G} strokeWidth="1" fill="none"
              opacity={0.15 + i * 0.12}
              style={{ pathLength: paths[i] }} />
          );
        })}
      </svg>

      {/* Views counter */}
      <motion.div style={{
        position: 'absolute', top: 260, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono)', fontSize: 8, color: G, opacity: 0.5, letterSpacing: '1px', whiteSpace: 'nowrap',
      }}
        initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.2 }}>
        1.2M VIEWS
      </motion.div>

      {/* Floating hearts */}
      {[0, 1, 2].map((i) => (
        <motion.div key={i} style={{
          position: 'absolute', right: 20, bottom: 80 + i * 20,
          fontSize: 12, color: G, opacity: 0,
          pointerEvents: 'none',
        }}
          animate={{ y: [-20, -60], opacity: [0, 0.6, 0] }}
          transition={{ duration: 2, delay: i * 0.9, repeat: Infinity, ease: 'easeOut' }}>
          ♥
        </motion.div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   03 — Diseño Gráfico & Branding — Identity System
═══════════════════════════════════════════════════════ */
function BrandVisual({ sp }: { sp: MotionValue<number> }) {
  const grid  = sub(sp, 0.00, 0.35);
  const fShape = sub(sp, 0.28, 0.60);
  const phi   = sub(sp, 0.50, 0.75);
  const rect  = sub(sp, 0.65, 0.88);

  return (
    <div style={{ position: 'relative', width: 280, height: 280 }}>
      <HUDCorners />
      <svg width="280" height="280" viewBox="0 0 280 280" fill="none">
        {/* Grid 8x8 — 35px units */}
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.line key={`v${i}`} x1={i * 35} y1="0" x2={i * 35} y2="280"
            stroke={G} strokeWidth="0.3" opacity={0.12}
            style={{ pathLength: grid }} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.line key={`h${i}`} x1="0" y1={i * 35} x2="280" y2={i * 35}
            stroke={G} strokeWidth="0.3" opacity={0.12}
            style={{ pathLength: grid }} />
        ))}
        {/* F shape (Fractal) — geometric */}
        <motion.path
          d="M70 70 L70 210 M70 70 L175 70 M70 140 L155 140"
          stroke={G} strokeWidth="1.4" fill="none"
          style={{ pathLength: fShape }} />
        {/* Phi circle (golden ratio proportions) */}
        <motion.circle cx="140" cy="140" r="86"
          stroke={G} strokeWidth="0.8" fill="none" opacity={0.35}
          style={{ pathLength: phi }} />
        <motion.circle cx="140" cy="140" r="53"
          stroke={G} strokeWidth="0.5" fill="none" opacity={0.2}
          style={{ pathLength: phi }} />
        {/* Logo bounding rect */}
        <motion.rect x="52" y="52" width="176" height="176"
          stroke={G} strokeWidth="0.9" fill="none" opacity={0.25}
          style={{ pathLength: rect }} />
      </svg>

      {/* Aa weight animation */}
      <motion.div style={{
        position: 'absolute', top: 16, right: 20,
        fontFamily: 'var(--font-headline)', fontSize: 22, color: G, opacity: 0.4,
      }}
        animate={{ fontWeight: [300, 800, 300] as number[] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        Aa
      </motion.div>

      {/* Dimension annotations */}
      <motion.div style={{
        position: 'absolute', bottom: 14, left: 12,
        fontFamily: 'var(--font-mono)', fontSize: 7, color: G, opacity: 0.35, letterSpacing: '1px',
      }}
        initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 1.4 }}>
        φ 1.618
      </motion.div>

      {/* Color swatches */}
      {['#080808', '#F5F5F5', G].map((c, i) => (
        <motion.div key={c} style={{
          position: 'absolute', bottom: 14, right: 12 + i * 20,
          width: 14, height: 14, background: c,
          border: `1px solid rgba(59,234,59,0.25)`,
        }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ delay: 1.6 + i * 0.15, type: 'spring', stiffness: 300 }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   04 — AI Content Creation — Neural Network
═══════════════════════════════════════════════════════ */
const NODES = [
  // input layer
  { x: 48,  y: 60,  layer: 0 }, { x: 48,  y: 110, layer: 0 },
  { x: 48,  y: 160, layer: 0 }, { x: 48,  y: 210, layer: 0 },
  // hidden layer
  { x: 148, y: 40,  layer: 1 }, { x: 148, y: 85,  layer: 1 },
  { x: 148, y: 130, layer: 1 }, { x: 148, y: 175, layer: 1 },
  { x: 148, y: 220, layer: 1 }, { x: 148, y: 260, layer: 1 },
  // output layer
  { x: 248, y: 80,  layer: 2 }, { x: 248, y: 150, layer: 2 }, { x: 248, y: 220, layer: 2 },
] as const;

const EDGES: [number, number][] = [
  [0,4],[0,5],[0,6],[1,4],[1,5],[1,6],[1,7],
  [2,5],[2,6],[2,7],[2,8],[3,6],[3,7],[3,8],[3,9],
  [4,10],[5,10],[5,11],[6,11],[6,12],[7,11],[7,12],[8,12],[9,12],
];

function NeuralVisual({ sp }: { sp: MotionValue<number> }) {
  const edges0  = sub(sp, 0.00, 0.35);
  const edges1  = sub(sp, 0.25, 0.60);
  const nodes0  = sub(sp, 0.10, 0.40);
  const nodes1  = sub(sp, 0.30, 0.58);
  const nodes2  = sub(sp, 0.48, 0.72);
  const edges2  = sub(sp, 0.50, 0.80);

  const nodeProgress = [nodes0, nodes0, nodes0, nodes0, nodes1, nodes1, nodes1, nodes1, nodes1, nodes1, nodes2, nodes2, nodes2];
  const edgeProgress = EDGES.map(([a]) => a < 4 ? edges0 : a < 10 ? edges1 : edges2);

  return (
    <div style={{ position: 'relative', width: 300, height: 300 }}>
      <HUDCorners />
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
        {/* Edges */}
        {EDGES.map(([a, b], i) => (
          <motion.line key={i}
            x1={NODES[a].x} y1={NODES[a].y}
            x2={NODES[b].x} y2={NODES[b].y}
            stroke={G} strokeWidth="0.6" opacity={0.2}
            style={{ pathLength: edgeProgress[i] }} />
        ))}
        {/* Nodes */}
        {NODES.map((n, i) => (
          <motion.circle key={i} cx={n.x} cy={n.y} r="7"
            stroke={G} strokeWidth="0.9" fill="none"
            style={{ pathLength: nodeProgress[i] }} />
        ))}
      </svg>

      {/* Data pulses along edges */}
      {EDGES.slice(0, 6).map(([a, b], i) => (
        <motion.div key={i} style={{
          position: 'absolute',
          width: 5, height: 5, borderRadius: '50%',
          background: G,
          left: NODES[a].x - 2.5,
          top: NODES[a].y - 2.5,
          boxShadow: `0 0 6px ${G}`,
          pointerEvents: 'none',
          opacity: 0,
        }}
          animate={{
            left: [NODES[a].x - 2.5, NODES[b].x - 2.5],
            top: [NODES[a].y - 2.5, NODES[b].y - 2.5],
            opacity: [0, 0.9, 0],
          }}
          transition={{ duration: 1.4, delay: i * 0.5, repeat: Infinity, ease: 'linear' }} />
      ))}

      {/* Labels */}
      {[
        { x: 20, label: 'INPUT' },
        { x: 120, label: 'PROCESS' },
        { x: 218, label: 'OUTPUT' },
      ].map(({ x, label }) => (
        <motion.div key={label} style={{
          position: 'absolute', top: 6, left: x,
          fontFamily: 'var(--font-mono)', fontSize: 7, color: G, opacity: 0.35, letterSpacing: '1px',
        }}
          initial={{ opacity: 0 }} animate={{ opacity: 0.35 }} transition={{ delay: 1.8 }}>
          {label}
        </motion.div>
      ))}

      <motion.div style={{
        position: 'absolute', bottom: 8, right: 12,
        fontFamily: 'var(--font-mono)', fontSize: 7, color: G, opacity: 0.45, letterSpacing: '1px',
      }}
        initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ delay: 2 }}>
        94.7% PRECISION
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   05 — Fotografía Comercial — DSLR + Aperture
═══════════════════════════════════════════════════════ */
function DSLRVisual({ sp }: { sp: MotionValue<number> }) {
  const body    = sub(sp, 0.00, 0.30);
  const lens    = sub(sp, 0.22, 0.50);
  const blades  = sub(sp, 0.42, 0.70);
  const prism   = sub(sp, 0.62, 0.82);
  const grip    = sub(sp, 0.72, 0.90);

  return (
    <div style={{ position: 'relative', width: 280, height: 220 }}>
      <HUDCorners />
      <svg width="280" height="220" viewBox="0 0 280 220" fill="none">
        {/* Body */}
        <motion.rect x="28" y="60" width="224" height="140" rx="4"
          stroke={G} strokeWidth="1.2" fill="none"
          style={{ pathLength: body }} />
        {/* Pentaprism top */}
        <motion.path d="M88 60 L88 30 L116 14 L164 14 L192 30 L192 60"
          stroke={G} strokeWidth="1.2" fill="none"
          style={{ pathLength: prism }} />
        {/* Grip right */}
        <motion.rect x="228" y="76" width="24" height="90" rx="4"
          stroke={G} strokeWidth="0.8" fill="none" opacity={0.4}
          style={{ pathLength: grip }} />
        {/* Lens outer 72r */}
        <motion.circle cx="132" cy="138" r="72"
          stroke={G} strokeWidth="1.2" fill="none"
          style={{ pathLength: lens }} />
        {/* Lens mid 52r */}
        <motion.circle cx="132" cy="138" r="52"
          stroke={G} strokeWidth="0.7" fill="none" opacity={0.5}
          style={{ pathLength: lens }} />
        {/* 8 aperture blades */}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          const x1 = 132 + 22 * Math.cos(a);
          const y1 = 138 + 22 * Math.sin(a);
          const x2 = 132 + 50 * Math.cos(a + Math.PI / 5);
          const y2 = 138 + 50 * Math.sin(a + Math.PI / 5);
          const x3 = 132 + 50 * Math.cos(a - Math.PI / 5);
          const y3 = 138 + 50 * Math.sin(a - Math.PI / 5);
          return (
            <motion.path key={i}
              d={`M${x1},${y1} L${x2},${y2} L${x3},${y3} Z`}
              stroke={G} strokeWidth="0.8" fill="none" opacity={0.28}
              style={{ pathLength: blades }} />
          );
        })}
        {/* Center dot */}
        <motion.circle cx="132" cy="138" r="5"
          stroke={G} strokeWidth="0.8" fill="none"
          style={{ pathLength: blades }} />
      </svg>

      {/* Aperture spin idle */}
      <motion.div style={{
        position: 'absolute',
        left: 132 - 72, top: 138 - 72,
        width: 144, height: 144,
        borderRadius: '50%',
        border: `1px solid rgba(59,234,59,0.08)`,
        pointerEvents: 'none',
      }}
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} />

      {/* Exposure data */}
      <motion.div style={{
        position: 'absolute', top: 8, left: 12,
        fontFamily: 'var(--font-mono)', fontSize: 7, color: G, opacity: 0.4, letterSpacing: '1px',
      }}
        initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.5 }}>
        f/1.8 · ISO 400 · 1/1000s
      </motion.div>

      {/* AF brackets */}
      {[[-40, -20], [40, -20]].map(([dx, dy], i) => (
        <motion.div key={i} style={{
          position: 'absolute',
          left: 132 + dx - 12,
          top: 138 + dy - 12,
          width: 24, height: 24,
          border: `1px solid rgba(59,234,59,0.5)`,
          pointerEvents: 'none',
        }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2.5, delay: i * 1.2, repeat: Infinity }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   06 — Motion Graphics — Timeline Editor
═══════════════════════════════════════════════════════ */
const TIMELINE_LAYERS = [
  { x: 30,  w: 90,  y: 60 },
  { x: 80,  w: 110, y: 95 },
  { x: 20,  w: 70,  y: 130 },
  { x: 110, w: 80,  y: 165 },
  { x: 50,  w: 100, y: 200 },
];

function TimelineVisual({ sp }: { sp: MotionValue<number> }) {
  const track   = sub(sp, 0.00, 0.30);
  const marks   = sub(sp, 0.18, 0.45);
  const layers  = sub(sp, 0.35, 0.75);
  const label   = sub(sp, 0.65, 0.90);

  return (
    <div style={{ position: 'relative', width: 300, height: 240 }}>
      <HUDCorners />
      <svg width="300" height="240" viewBox="0 0 300 240" fill="none">
        {/* Timeline base track */}
        <motion.line x1="14" y1="40" x2="286" y2="40"
          stroke={G} strokeWidth="1" opacity={0.5}
          style={{ pathLength: track }} />
        {/* Time marks every 36px */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.line key={i} x1={14 + i * 38} y1="36" x2={14 + i * 38} y2="44"
            stroke={G} strokeWidth="0.7" opacity={0.35}
            style={{ pathLength: marks }} />
        ))}
        {/* Layer tracks */}
        {TIMELINE_LAYERS.map((l, i) => (
          <motion.rect key={i}
            x={14 + l.x} y={l.y} width={l.w} height={22} rx="2"
            stroke={G} strokeWidth="0.9" fill="none"
            opacity={0.25 + i * 0.07}
            style={{ pathLength: layers }} />
        ))}
        {/* Keyframe diamonds */}
        {TIMELINE_LAYERS.map((l, i) => {
          const d = 5;
          const kx = 14 + l.x;
          const ky = l.y + 11;
          return (
            <motion.path key={i}
              d={`M${kx},${ky - d} L${kx + d},${ky} L${kx},${ky + d} L${kx - d},${ky} Z`}
              stroke={G} strokeWidth="0.8" fill="none" opacity={0.5}
              style={{ pathLength: label }} />
          );
        })}
      </svg>

      {/* Playhead animation */}
      <motion.div style={{
        position: 'absolute', top: 30, width: 1, height: 195,
        background: G, opacity: 0.7,
        boxShadow: `0 0 4px ${G}`,
        pointerEvents: 'none',
      }}
        animate={{ left: [14, 286] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />

      {/* Timecode */}
      <motion.div style={{
        position: 'absolute', top: 8, right: 14,
        fontFamily: 'var(--font-mono)', fontSize: 8, color: G, opacity: 0.45, letterSpacing: '1px',
      }}
        animate={{ opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 1, repeat: Infinity }}>
        00:00:24:12
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   07 — Social Media Management — Waveform + Mic
═══════════════════════════════════════════════════════ */
function WaveformVisual({ sp }: { sp: MotionValue<number> }) {
  const mic     = sub(sp, 0.00, 0.30);
  const wave    = sub(sp, 0.22, 0.60);
  const bars    = sub(sp, 0.48, 0.82);

  // Generate waveform path (sinusoidal)
  const wavePath = (() => {
    const pts = [];
    for (let x = 10; x <= 290; x += 4) {
      const y = 100 + Math.sin(x * 0.06) * 30 * Math.sin(x * 0.018);
      pts.push(`${x},${y}`);
    }
    return `M ${pts.join(' L ')}`;
  })();

  const barHeights = [22, 38, 55, 70, 62, 45, 72, 50, 35, 60, 48, 30, 55, 40, 28, 64];

  return (
    <div style={{ position: 'relative', width: 300, height: 240 }}>
      <HUDCorners />
      <svg width="300" height="240" viewBox="0 0 300 240" fill="none">
        {/* Microphone body */}
        <motion.rect x="132" y="14" width="36" height="58" rx="18"
          stroke={G} strokeWidth="1.2" fill="none"
          style={{ pathLength: mic }} />
        <motion.path d="M110 56 Q110 90 150 90 Q190 90 190 56"
          stroke={G} strokeWidth="1" fill="none"
          style={{ pathLength: mic }} />
        <motion.line x1="150" y1="90" x2="150" y2="108"
          stroke={G} strokeWidth="0.8" opacity={0.5}
          style={{ pathLength: mic }} />
        <motion.line x1="126" y1="108" x2="174" y2="108"
          stroke={G} strokeWidth="0.8" opacity={0.5}
          style={{ pathLength: mic }} />
        {/* Waveform */}
        <motion.path d={wavePath}
          stroke={G} strokeWidth="1.2" fill="none" opacity={0.7}
          style={{ pathLength: wave }} />
        <motion.line x1="10" y1="100" x2="290" y2="100"
          stroke={G} strokeWidth="0.4" opacity={0.15}
          style={{ pathLength: wave }} />
        {/* Spectrum bars */}
        {barHeights.map((h, i) => (
          <motion.rect key={i}
            x={10 + i * 18} y={200 - h} width="12" height={h} rx="1"
            stroke={G} strokeWidth="0.6" fill="none"
            opacity={0.18 + (i % 3) * 0.08}
            style={{ pathLength: bars }} />
        ))}
      </svg>

      {/* Spectrum animation */}
      <motion.div style={{
        position: 'absolute', bottom: 12, right: 14,
        fontFamily: 'var(--font-mono)', fontSize: 7, color: G, opacity: 0.4, letterSpacing: '1px',
      }}
        initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1.4 }}>
        AUDIO SPECTRUM
      </motion.div>

      {/* dB level indicator */}
      <motion.div style={{
        position: 'absolute', top: 116, right: 8,
        width: 6, height: 60,
        background: `rgba(59,234,59,0.1)`,
        borderRadius: 3,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        <motion.div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: G, borderRadius: 3,
        }}
          animate={{ height: ['20%', '85%', '40%', '70%', '30%'] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   08 — Post-producción — Dashboard Metrics
═══════════════════════════════════════════════════════ */
function DashboardVisual({ sp }: { sp: MotionValue<number> }) {
  const line    = sub(sp, 0.00, 0.35);
  const kpis    = sub(sp, 0.28, 0.60);
  const gauge   = sub(sp, 0.50, 0.78);
  const labels  = sub(sp, 0.68, 0.90);

  // Rising curve
  const curvePath = 'M 10 190 C 50 180 70 140 110 120 S 170 70 210 50 S 260 30 290 20';

  return (
    <div style={{ position: 'relative', width: 300, height: 220 }}>
      <HUDCorners />
      <svg width="300" height="220" viewBox="0 0 300 220" fill="none">
        {/* Axes */}
        <motion.path d="M 10 200 L 10 10 M 10 200 L 290 200"
          stroke={G} strokeWidth="0.8" fill="none" opacity={0.3}
          style={{ pathLength: line }} />
        {/* Rising curve */}
        <motion.path d={curvePath}
          stroke={G} strokeWidth="1.4" fill="none"
          style={{ pathLength: line }} />
        {/* Area fill ghost */}
        <motion.path d={`${curvePath} L 290 200 L 10 200 Z`}
          stroke="none" fill={`rgba(59,234,59,0.04)`}
          style={{ pathLength: line }} />
        {/* Grid dots at breakpoints */}
        {[[110, 120], [210, 50], [290, 20]].map(([x, y], i) => (
          <motion.circle key={i} cx={x} cy={y} r="4"
            stroke={G} strokeWidth="0.8" fill="none"
            style={{ pathLength: kpis }} />
        ))}
        {/* KPI bars */}
        {[60, 80, 50].map((h, i) => (
          <motion.rect key={i}
            x={10 + i * 44} y={200 - h} width="32" height={h} rx="2"
            stroke={G} strokeWidth="0.8" fill="none"
            opacity={0.25 + i * 0.08}
            style={{ pathLength: kpis }} />
        ))}
        {/* Gauge semicircle */}
        <motion.path d="M 218 170 A 50 50 0 0 1 298 170"
          stroke={G} strokeWidth="1.2" fill="none" opacity={0.5}
          style={{ pathLength: gauge }} />
        <motion.path d="M 228 170 A 40 40 0 0 1 288 170"
          stroke={G} strokeWidth="0.6" fill="none" opacity={0.3}
          style={{ pathLength: gauge }} />
        {/* Gauge needle */}
        <motion.line x1="258" y1="170" x2="248" y2="138"
          stroke={G} strokeWidth="1" opacity={0.7}
          style={{ pathLength: labels }} />
      </svg>

      {/* +247% reach */}
      <motion.div style={{
        position: 'absolute', top: 12, right: 14,
        fontFamily: 'var(--font-mono)', fontSize: 9, color: G, letterSpacing: '1px',
      }}
        animate={{ opacity: [0, 0.8, 0.8, 0] }}
        transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}>
        +247% REACH
      </motion.div>

      {/* Trending arrow */}
      <motion.div style={{
        position: 'absolute', bottom: 44, left: 14,
        fontFamily: 'var(--font-mono)', fontSize: 7, color: G, opacity: 0.45, letterSpacing: '1px',
      }}
        initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ delay: 1.6 }}>
        PERFORMANCE ↑
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EXPORT MAP
═══════════════════════════════════════════════════════ */
const VISUALS = [
  CameraVisual, SmartphoneVisual, BrandVisual, NeuralVisual,
  DSLRVisual, TimelineVisual, WaveformVisual, DashboardVisual,
];

const SERVICE_NAMES = [
  'Producción Audiovisual', 'Estrategia de Contenido', 'Diseño Gráfico y Branding',
  'AI Content Creation', 'Fotografía Comercial', 'Motion Graphics',
  'Social Media Management', 'Post-producción',
];

export function ServiceVisual({ idx, sp }: { idx: number; sp: MotionValue<number> }) {
  const Icon = VISUALS[idx % VISUALS.length];
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setMounted(true); obs.disconnect(); }
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Ícono animado: ${SERVICE_NAMES[idx % SERVICE_NAMES.length]}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
      }}
    >
      {mounted && <Icon sp={sp} />}
    </div>
  );
}
