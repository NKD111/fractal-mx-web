"use client";

import { useRef, useState } from "react";

const C  = "#3BEA3B";
const SW = 1;

/* ── Icon 1: Video/Camera Táctica ─────────────────────────────────────────── */
export function IconVideo({ active }: { active?: boolean }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes scanBars {
          0%   { transform: translateY(-8px); }
          100% { transform: translateY(28px); }
        }
        .icon1-scan { animation: none; }
        .icon1-active .icon1-scan { animation: scanBars 1.4s linear infinite; }
      `}</style>
      <g className={active ? "icon1-active" : ""}>
        {/* main body clipped corners */}
        <path d="M6 12 L8 10 L32 10 L34 12 L34 36 L32 38 L8 38 L6 36 Z"
          stroke={C} strokeWidth={SW} />
        {/* crosshair top-right */}
        <line x1="30" y1="10" x2="30" y2="13" stroke={C} strokeWidth={SW} />
        <line x1="27" y1="10" x2="30" y2="10" stroke={C} strokeWidth={SW} />
        {/* camera lens triangle play */}
        <polygon points="17,20 17,28 25,24" stroke={C} strokeWidth={SW} />
        {/* scan lines inside */}
        <clipPath id="vid-clip">
          <rect x="7" y="11" width="26" height="26" />
        </clipPath>
        <g clipPath="url(#vid-clip)" className="icon1-scan">
          <line x1="7" y1="16" x2="33" y2="16" stroke={C} strokeWidth="0.5" opacity="0.4" />
          <line x1="7" y1="20" x2="33" y2="20" stroke={C} strokeWidth="0.5" opacity="0.4" />
          <line x1="7" y1="24" x2="33" y2="24" stroke={C} strokeWidth="0.5" opacity="0.4" />
          <line x1="7" y1="28" x2="33" y2="28" stroke={C} strokeWidth="0.5" opacity="0.4" />
          <line x1="7" y1="32" x2="33" y2="32" stroke={C} strokeWidth="0.5" opacity="0.4" />
        </g>
        {/* record button right side */}
        <path d="M36 19 L42 16 L42 32 L36 29 Z" stroke={C} strokeWidth={SW} />
      </g>
    </svg>
  );
}

/* ── Icon 2: Signal/Broadcast ─────────────────────────────────────────────── */
export function IconSignal({ active }: { active?: boolean }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes arcDraw2 { from { stroke-dashoffset: 60; opacity: 0; } to { stroke-dashoffset: 0; opacity: 1; } }
        @keyframes arcDraw3 { from { stroke-dashoffset: 90; opacity: 0; } to { stroke-dashoffset: 0; opacity: 1; } }
        .icon2-a1,.icon2-a2,.icon2-a3 { transition: none; }
        .icon2-active .icon2-a2 { animation: arcDraw2 0.4s 0.1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .icon2-active .icon2-a3 { animation: arcDraw3 0.4s 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
      `}</style>
      <g className={active ? "icon2-active" : ""}>
        {/* center dot */}
        <circle cx="24" cy="30" r="2.5" fill={C} />
        {/* arc 1 inner */}
        <path d="M17 26 Q24 18 31 26" stroke={C} strokeWidth={SW} strokeLinecap="round" />
        {/* arc 2 mid */}
        <path className="icon2-a2" d="M12 20 Q24 8 36 20"
          stroke={C} strokeWidth={SW} strokeLinecap="round"
          strokeDasharray="60" strokeDashoffset={active ? "0" : "60"} />
        {/* arc 3 outer */}
        <path className="icon2-a3" d="M7 14 Q24 -2 41 14"
          stroke={C} strokeWidth={SW} strokeLinecap="round"
          strokeDasharray="90" strokeDashoffset={active ? "0" : "90"} />
        {/* interference lines */}
        <line x1="6" y1="32" x2="10" y2="32" stroke={C} strokeWidth={SW} opacity="0.4" />
        <line x1="6" y1="36" x2="9"  y2="36" stroke={C} strokeWidth={SW} opacity="0.25" />
        <line x1="38" y1="32" x2="42" y2="32" stroke={C} strokeWidth={SW} opacity="0.4" />
        <line x1="39" y1="36" x2="42" y2="36" stroke={C} strokeWidth={SW} opacity="0.25" />
        {/* center line */}
        <line x1="24" y1="32.5" x2="24" y2="42" stroke={C} strokeWidth={SW} />
        {/* base */}
        <line x1="18" y1="42" x2="30" y2="42" stroke={C} strokeWidth={SW} />
      </g>
    </svg>
  );
}

/* ── Icon 3: Hexágono Modular ─────────────────────────────────────────────── */
export function IconHex({ active }: { active?: boolean }) {
  const innerRef = useRef<SVGGElement>(null);
  const verts = [
    [24, 6], [38, 15], [38, 33], [24, 42], [10, 33], [10, 15]
  ] as const;
  const innerVerts = [
    [24, 13], [32, 18], [32, 30], [24, 35], [16, 30], [16, 18]
  ] as const;

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes hexSpin { to { transform: rotate(60deg); transform-origin: 24px 24px; } }
        @keyframes sqPulse {
          0%,100% { opacity:0.4; }
          50%      { opacity:1;   }
        }
        .icon3-inner { transition: transform 0.3s; }
        .icon3-active .icon3-inner { animation: hexSpin 3s linear infinite; }
      `}</style>
      <g className={active ? "icon3-active" : ""}>
        {/* outer hex */}
        <polygon
          points={verts.map(v => v.join(",")).join(" ")}
          stroke={C} strokeWidth={SW}
        />
        {/* vertex squares */}
        {verts.map(([x, y], i) => (
          <rect key={i} x={x - 2} y={y - 2} width="4" height="4"
            stroke={C} strokeWidth={SW}
            style={active ? { animation: `sqPulse 1s ${i * 0.16}s ease infinite` } : undefined}
          />
        ))}
        {/* inner hex + connector lines */}
        <g ref={innerRef} className="icon3-inner">
          <polygon
            points={innerVerts.map(v => v.join(",")).join(" ")}
            stroke={C} strokeWidth={SW} opacity="0.7"
          />
          {verts.map(([ox, oy], i) => {
            const [ix, iy] = innerVerts[i];
            return (
              <line key={i} x1={ox} y1={oy} x2={ix} y2={iy}
                stroke={C} strokeWidth="0.5" opacity="0.4" />
            );
          })}
        </g>
      </g>
    </svg>
  );
}

/* ── Icon 4: Targeting Camera ─────────────────────────────────────────────── */
export function IconCamera({ active }: { active?: boolean }) {
  const marks = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes circleRot { to { transform: rotate(360deg); transform-origin: 24px 24px; } }
        .icon4-ring { transition: none; }
        .icon4-active .icon4-ring { animation: circleRot 8s linear infinite; }
      `}</style>
      <g className={active ? "icon4-active" : ""}>
        {/* outer ring with degree marks */}
        <g className="icon4-ring">
          <circle cx="24" cy="24" r="18" stroke={C} strokeWidth={SW} />
          {marks.map((deg) => {
            const r  = Math.PI / 180 * deg;
            const x1 = 24 + 18 * Math.cos(r);
            const y1 = 24 + 18 * Math.sin(r);
            const x2 = 24 + 14 * Math.cos(r);
            const y2 = 24 + 14 * Math.sin(r);
            return (
              <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={C} strokeWidth={SW} opacity="0.6" />
            );
          })}
        </g>
        {/* crosshair with L terminals */}
        <line x1="6"  y1="24" x2="18" y2="24" stroke={C} strokeWidth={SW} />
        <line x1="30" y1="24" x2="42" y2="24" stroke={C} strokeWidth={SW} />
        <line x1="24" y1="6"  x2="24" y2="18" stroke={C} strokeWidth={SW} />
        <line x1="24" y1="30" x2="24" y2="42" stroke={C} strokeWidth={SW} />
        {/* L-ends */}
        <path d="M6 22 L6 26" stroke={C} strokeWidth={SW} />
        <path d="M42 22 L42 26" stroke={C} strokeWidth={SW} />
        <path d="M22 6 L26 6" stroke={C} strokeWidth={SW} />
        <path d="M22 42 L26 42" stroke={C} strokeWidth={SW} />
        {/* center diamond */}
        <polygon points="24,19 27,24 24,29 21,24" stroke={C} strokeWidth={SW} />
      </g>
    </svg>
  );
}

/* ── Icon 5: Neural Network ───────────────────────────────────────────────── */
export function IconNeural({ active }: { active?: boolean }) {
  const nodes = [
    [10, 18], [10, 30],
    [24, 12], [24, 24], [24, 36],
    [38, 18], [38, 30],
  ] as const;
  const edges: [number, number][] = [
    [0,2],[0,3],[1,3],[1,4],
    [2,5],[3,5],[3,6],[4,6],
    [2,3],[3,4],
  ];
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes nodeFlow {
          0%,100% { r: 2.5px; opacity: 0.5; }
          50%      { r: 4px;   opacity: 1;   }
        }
        @keyframes dashFlow { to { stroke-dashoffset: -20; } }
        .icon5-edge { stroke-dasharray: 4 4; stroke-dashoffset: 0; transition: none; }
        .icon5-active .icon5-edge { animation: dashFlow 1s linear infinite; }
      `}</style>
      <g className={active ? "icon5-active" : ""}>
        {edges.map(([a, b], i) => (
          <line key={i}
            x1={nodes[a][0]} y1={nodes[a][1]}
            x2={nodes[b][0]} y2={nodes[b][1]}
            className="icon5-edge"
            stroke={C} strokeWidth="0.8" opacity="0.5"
          />
        ))}
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3"
            stroke={C} strokeWidth={SW}
            style={active ? { animation: `nodeFlow 0.8s ${i * 0.12}s ease-in-out infinite` } : undefined}
          />
        ))}
        {/* directional arrows on key edges */}
        {[[10,18,24,12],[24,24,38,18],[24,24,38,30]].map(([x1,y1,x2,y2], i) => {
          const mx = (x1+x2)/2, my = (y1+y2)/2;
          const angle = Math.atan2(y2-y1, x2-x1);
          const ax = mx + 4 * Math.cos(angle + 2.8);
          const ay = my + 4 * Math.sin(angle + 2.8);
          const bx = mx + 4 * Math.cos(angle - 2.8);
          const by = my + 4 * Math.sin(angle - 2.8);
          return (
            <path key={i} d={`M${ax} ${ay} L${mx} ${my} L${bx} ${by}`}
              stroke={C} strokeWidth="0.6" opacity="0.5" />
          );
        })}
      </g>
    </svg>
  );
}

/* ── Icon 6: Waveform ─────────────────────────────────────────────────────── */
export function IconWaveform({ active }: { active?: boolean }) {
  const heights = [4, 8, 12, 16, 20, 24, 18, 22, 14, 10, 6, 4];
  const barW = 2;
  const gap  = 3;
  const total = heights.length;
  const totalW = total * barW + (total - 1) * gap;
  const startX = (48 - totalW) / 2;

  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes barAnim0  { 0%,100%{height:4px;y:22px}50%{height:14px;y:15px} }
        @keyframes barAnim1  { 0%,100%{height:8px;y:20px}50%{height:20px;y:14px} }
        @keyframes barAnim2  { 0%,100%{height:12px;y:18px}50%{height:24px;y:12px} }
        @keyframes barAnim3  { 0%,100%{height:16px;y:16px}50%{height:28px;y:10px} }
        @keyframes barAnim4  { 0%,100%{height:20px;y:14px}50%{height:32px;y:8px} }
        @keyframes barAnim5  { 0%,100%{height:24px;y:12px}50%{height:36px;y:6px} }
        @keyframes barAnim6  { 0%,100%{height:18px;y:15px}50%{height:28px;y:10px} }
        @keyframes barAnim7  { 0%,100%{height:22px;y:13px}50%{height:32px;y:8px} }
        @keyframes barAnim8  { 0%,100%{height:14px;y:17px}50%{height:22px;y:13px} }
        @keyframes barAnim9  { 0%,100%{height:10px;y:19px}50%{height:18px;y:15px} }
        @keyframes barAnim10 { 0%,100%{height:6px;y:21px}50%{height:14px;y:17px} }
        @keyframes barAnim11 { 0%,100%{height:4px;y:22px}50%{height:10px;y:19px} }
      `}</style>
      {/* center line */}
      <line x1="4" y1="24" x2="44" y2="24" stroke={C} strokeWidth="0.5" opacity="0.3" />
      {/* dB marks */}
      <line x1="4" y1="12" x2="6" y2="12" stroke={C} strokeWidth={SW} opacity="0.4" />
      <line x1="4" y1="36" x2="6" y2="36" stroke={C} strokeWidth={SW} opacity="0.4" />
      <line x1="42" y1="12" x2="44" y2="12" stroke={C} strokeWidth={SW} opacity="0.4" />
      <line x1="42" y1="36" x2="44" y2="36" stroke={C} strokeWidth={SW} opacity="0.4" />
      {heights.map((h, i) => {
        const x = startX + i * (barW + gap);
        const y = 24 - h / 2;
        return (
          <rect
            key={i}
            x={x} y={y}
            width={barW} height={h}
            fill={C} opacity="0.8"
            style={active ? {
              animation: `barAnim${i} ${0.3 + Math.random() * 0.4}s ${i * 0.04}s ease-in-out infinite`
            } : undefined}
          />
        );
      })}
    </svg>
  );
}

/* ── Icon 7: Vinyl/Note Tactical ──────────────────────────────────────────── */
export function IconNote({ active }: { active?: boolean }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes diamondPulse { 0%,100%{transform:scale(1);opacity:0.8}50%{transform:scale(1.2);opacity:1} }
        @keyframes stemExtend { 0%,100%{height:14px;y:20px}50%{height:20px;y:20px} }
        .icon7-diamond { transform-origin: 18px 26px; }
        .icon7-active .icon7-diamond { animation: diamondPulse 0.6s ease-in-out infinite; }
        .icon7-active .icon7-stem { animation: stemExtend 0.6s 0.2s ease-in-out infinite; }
      `}</style>
      <g className={active ? "icon7-active" : ""}>
        {/* diamond head */}
        <polygon className="icon7-diamond" points="18,20 23,26 18,32 13,26" stroke={C} strokeWidth={SW} />
        {/* stem */}
        <rect className="icon7-stem" x="22" y="20" width="1.5" height="14" fill={C} />
        {/* stem marks */}
        <line x1="22" y1="24" x2="25" y2="24" stroke={C} strokeWidth={SW} opacity="0.6" />
        <line x1="22" y1="28" x2="25" y2="28" stroke={C} strokeWidth={SW} opacity="0.4" />
        {/* flag */}
        <path d="M23.5 20 Q32 22 30 27" stroke={C} strokeWidth={SW} />
        {/* angular brackets */}
        <path d="M6 20 L4 24 L6 28"  stroke={C} strokeWidth={SW} />
        <path d="M42 20 L44 24 L42 28" stroke={C} strokeWidth={SW} />
        {/* base line */}
        <line x1="10" y1="36" x2="38" y2="36" stroke={C} strokeWidth={SW} opacity="0.4" />
      </g>
    </svg>
  );
}

/* ── Icon 8: Grid Broadcast ───────────────────────────────────────────────── */
export function IconGrid({ active }: { active?: boolean }) {
  const cells = Array.from({ length: 9 }, (_, i) => ({
    x: 8 + (i % 3) * 12,
    y: 18 + Math.floor(i / 3) * 12,
    op: [0.3, 0.6, 0.4, 0.7, 0.5, 0.8, 0.3, 0.6, 0.4][i],
  }));
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes cellFlash { 0%,100%{opacity:0.3}50%{opacity:1} }
      `}</style>
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width="8" height="8"
          stroke={C} strokeWidth={SW}
          opacity={c.op}
          style={active ? { animation: `cellFlash ${0.4 + (i % 3) * 0.15}s ${i * 0.08}s ease infinite` } : undefined}
        />
      ))}
      {/* broadcast arrow */}
      <line x1="24" y1="16" x2="24" y2="6" stroke={C} strokeWidth={SW} />
      <path d="M20 10 L24 6 L28 10" stroke={C} strokeWidth={SW} />
      {/* signal waves at tip */}
      <path d="M22 8 Q24 4 26 8" stroke={C} strokeWidth="0.7" opacity="0.5" />
    </svg>
  );
}

/* ── Icon 9: AI Processor ─────────────────────────────────────────────────── */
export function IconAI({ active }: { active?: boolean }) {
  const pins = [
    { x1: 14, y1: 6, x2: 14, y2: 12 },
    { x1: 24, y1: 6, x2: 24, y2: 12 },
    { x1: 34, y1: 6, x2: 34, y2: 12 },
    { x1: 14, y1: 42, x2: 14, y2: 36 },
    { x1: 24, y1: 42, x2: 24, y2: 36 },
    { x1: 34, y1: 42, x2: 34, y2: 36 },
    { x1: 6,  y1: 16, x2: 12, y2: 16 },
    { x1: 6,  y1: 24, x2: 12, y2: 24 },
    { x1: 6,  y1: 32, x2: 12, y2: 32 },
    { x1: 42, y1: 16, x2: 36, y2: 16 },
    { x1: 42, y1: 24, x2: 36, y2: 24 },
    { x1: 42, y1: 32, x2: 36, y2: 32 },
  ];
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes pinPulse { 0%,100%{opacity:0.4}50%{opacity:1} }
      `}</style>
      {/* chip body with L corners */}
      <rect x="12" y="12" width="24" height="24" stroke={C} strokeWidth={SW} />
      {/* corner marks */}
      {[[12,12],[36,12],[12,36],[36,36]].map(([x,y], i) => (
        <rect key={i} x={x-1.5} y={y-1.5} width="3" height="3" fill={C} opacity="0.6" />
      ))}
      {/* interior 3x3 grid */}
      {[18,24,30].map(x => (
        <line key={`v${x}`} x1={x} y1="14" x2={x} y2="34" stroke={C} strokeWidth="0.4" opacity="0.3" />
      ))}
      {[18,24,30].map(y => (
        <line key={`h${y}`} x1="14" y1={y} x2="34" y2={y} stroke={C} strokeWidth="0.4" opacity="0.3" />
      ))}
      {/* center circle */}
      <circle cx="24" cy="24" r="4" stroke={C} strokeWidth={SW} />
      {/* pins */}
      {pins.map((p, i) => (
        <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2}
          stroke={C} strokeWidth={SW}
          style={active ? { animation: `pinPulse 0.8s ${i * 0.06}s ease infinite` } : undefined}
        />
      ))}
    </svg>
  );
}

/* ── Icon 10: Advisory/Tactical Shield ────────────────────────────────────── */
export function IconShield({ active }: { active?: boolean }) {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>{`
        @keyframes shieldFlash { 0%,100%{opacity:1}50%{opacity:0.3} }
        @keyframes innerDraw { from{stroke-dashoffset:80}to{stroke-dashoffset:0} }
        .icon10-shield { transition: none; }
        .icon10-active .icon10-shield { animation: shieldFlash 0.5s ease infinite; }
        .icon10-active .icon10-inner  { animation: innerDraw 0.6s ease forwards; }
      `}</style>
      <g className={active ? "icon10-active" : ""}>
        {/* shield shape angular */}
        <path className="icon10-shield"
          d="M24 4 L38 10 L38 26 Q38 38 24 44 Q10 38 10 26 L10 10 Z"
          stroke={C} strokeWidth={SW}
        />
        {/* corner marks */}
        <rect x="9"  y="9"  width="3" height="3" stroke={C} strokeWidth={SW} opacity="0.6" />
        <rect x="36" y="9"  width="3" height="3" stroke={C} strokeWidth={SW} opacity="0.6" />
        {/* angular ? */}
        <path className="icon10-inner"
          d="M20 18 Q24 14 28 18 Q30 20 24 24 L24 27"
          stroke={C} strokeWidth="1.5" strokeLinecap="round"
          strokeDasharray="80" strokeDashoffset={active ? "0" : "80"}
        />
        <circle cx="24" cy="32" r="1.5" fill={C} />
        {/* internal decorative lines */}
        <line x1="14" y1="14" x2="34" y2="14" stroke={C} strokeWidth="0.4" opacity="0.3" />
        <line x1="13" y1="40" x2="35" y2="40" stroke={C} strokeWidth="0.4" opacity="0.2" />
      </g>
    </svg>
  );
}

/* ── Icon Map ─────────────────────────────────────────────────────────────── */
export const SERVICE_ICONS = [
  IconVideo, IconSignal, IconHex, IconCamera, IconNeural,
  IconWaveform, IconNote, IconGrid, IconAI, IconShield,
] as const;
