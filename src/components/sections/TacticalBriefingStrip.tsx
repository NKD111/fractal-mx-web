"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";

/* ── Data ──────────────────────────────────────────────────────────────────── */

const CODE_LINES = [
  "> FRACTAL_SYS.INIT",
  "> LOADING ASSETS...",
  "> [████████░░] 82%",
  "> CONNECTING...",
  "> AUTH: VERIFIED ✓",
  "> ENCRYPTION: AES-256",
  "> STATUS: ONLINE",
  "> UPTIME: 99.97%",
  "> NODES: 14 ACTIVE",
  "> BANDWIDTH: 847 MB/s",
  "> LATENCY: 12ms",
  "> SIGNAL: STRONG ●●●●○",
  "> PROTOCOL: SECURE",
  "> VERSION: v2.0.4",
  "> BUILD: 20250101",
  "> FRACTAL_SYS.READY",
];

type MissionRow = { label: string; value: string; green?: boolean };

const MISSION_FRAMES: MissionRow[][] = [
  [
    { label: "AGENTE:",        value: "FRACTAL_MX" },
    { label: "CLASIF.:",       value: "CREATIVO" },
    { label: "EXPERIENCIA:",   value: "7 AÑOS" },
    { label: "MISIONES:",      value: "045+" },
    { label: "ZONA:",          value: "CDMX · MEX" },
    { label: "ESTADO:",        value: "● ACTIVO", green: true },
  ],
  [
    { label: "HABILIDADES:", value: "ACTIVAS" },
    { label: "",  value: "[●] Prod. AV",       green: true },
    { label: "",  value: "[●] Estrategia IA",  green: true },
    { label: "",  value: "[●] Branding",        green: true },
    { label: "",  value: "[●] Sound Design",    green: true },
    { label: "",  value: "[●] Motion Graphics", green: true },
  ],
  [
    { label: "RENDIMIENTO:",   value: "98.4%" },
    { label: "SATISFACCIÓN:",  value: "100%",   green: true },
    { label: "A TIEMPO:",      value: "✓",      green: true },
    { label: "REVISIONES:",    value: "< 2" },
    { label: "PRESUPUESTO:",   value: "ON TRACK" },
    { label: "NPS SCORE:",     value: "94/100" },
  ],
];

const LOG_EVENTS = [
  "CLIENTE CONECTADO",
  "BRIEF RECIBIDO",
  "ASSETS CARGADOS",
  "REVISIÓN OK ✓",
  "ENTREGA ENVIADA",
  "APROBADO ✓",
  "NUEVO PROYECTO",
  "CONSULTA IA...",
  "RENDER COMPLETO",
  "SYNC EXITOSO",
  "ASSETS APROBADOS",
  "CONTRATO FIRMADO",
  "PROYECTO INICIADO",
  "CLIENTE FELIZ ✓",
  "FACTURA ENVIADA",
  "PAGO RECIBIDO",
];

/* ── Mini Radar ─────────────────────────────────────────────────────────────── */

function MiniRadar({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const angleRef  = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R  = Math.min(cx, cy) - 3;

    const blips = [
      { angle: 0.8,  dist: 0.55 },
      { angle: 2.3,  dist: 0.35 },
    ];

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(2,2,2,0.95)";
      ctx.fillRect(0, 0, W, H);

      /* circles */
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (R * i) / 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59,234,59,${0.13 - i * 0.025})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      /* cross */
      ctx.strokeStyle = "rgba(59,234,59,0.09)";
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke();

      /* sweep trail */
      for (let i = 0; i < 28; i++) {
        const a = angleRef.current - i * 0.045;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, R, a - 0.045, a);
        ctx.lineTo(cx, cy);
        ctx.fillStyle = `rgba(59,234,59,${(1 - i / 28) * 0.18})`;
        ctx.fill();
      }

      /* sweep line */
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angleRef.current) * R, cy + Math.sin(angleRef.current) * R);
      ctx.strokeStyle = "rgba(59,234,59,0.85)";
      ctx.lineWidth = 1;
      ctx.stroke();

      /* blips */
      blips.forEach(b => {
        const bx = cx + Math.cos(b.angle) * R * b.dist;
        const by = cy + Math.sin(b.angle) * R * b.dist;
        const t  = (Date.now() / 700 + b.dist) % 1;
        ctx.beginPath();
        ctx.arc(bx, by, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,234,59,${0.5 + t * 0.5})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(bx, by, 5 * t, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(59,234,59,${(1 - t) * 0.45})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      /* center dot */
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(59,234,59,0.75)";
      ctx.fill();

      if (active) angleRef.current += 0.028;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      width={80}
      height={80}
      style={{ display: "block", borderRadius: "50%", border: "1px solid rgba(59,234,59,0.1)" }}
    />
  );
}

/* ── Signal Waveform ────────────────────────────────────────────────────────── */

function SignalWaveform({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;

    function draw() {
      ctx.clearRect(0, 0, W, H);

      if (active) {
        ctx.beginPath();
        const cx = W / 2;
        for (let y = 0; y < H; y++) {
          const t = tRef.current;
          const v = Math.sin(y * 0.18 + t * 2.1) * 0.5
                  + Math.sin(y * 0.07 + t * 1.3) * 0.3
                  + Math.sin(y * 0.32 + t * 3.2) * 0.15
                  + Math.sin(y * 0.05 + t * 0.7) * 0.28;
          const x = cx + v * 16;
          y === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0,   "rgba(59,234,59,0.08)");
        grad.addColorStop(0.35,"rgba(59,234,59,0.75)");
        grad.addColorStop(0.65,"rgba(59,234,59,0.75)");
        grad.addColorStop(1,   "rgba(59,234,59,0.08)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        tRef.current += 0.018;
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return <canvas ref={canvasRef} width={50} height={118} style={{ display: "block" }} />;
}

/* ── Column 1: Code Stream ─────────────────────────────────────────────────── */

function CodeStream({ active }: { active: boolean }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setOffset(v => (v + 1) % CODE_LINES.length), 420);
    return () => clearInterval(id);
  }, [active]);

  const visible = Array.from({ length: 9 }, (_, i) =>
    CODE_LINES[(offset + i) % CODE_LINES.length]
  );

  return (
    <div style={{ padding: "10px 10px", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
      {visible.map((line, i) => (
        <div
          key={`${offset}-${i}`}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "8.5px",
            color: "#3BEA3B",
            opacity: 0.25 + (i / visible.length) * 0.5,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.5,
            transition: "opacity 0.3s",
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}

/* ── Column 2: Mission Data ─────────────────────────────────────────────────── */

function MissionData({ active }: { active: boolean }) {
  const [frame, setFrame]       = useState(0);
  const [glitching, setGlitch]  = useState(false);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => { setFrame(v => (v + 1) % MISSION_FRAMES.length); setGlitch(false); }, 280);
    }, 4000);
    return () => clearInterval(id);
  }, [active]);

  const rows = MISSION_FRAMES[frame];
  const labels = ["IDENTIFICACIÓN", "CAPACIDADES", "MÉTRICAS"];

  return (
    <div style={{ padding: "10px 10px", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#3BEA3B", opacity: 0.38, letterSpacing: "0.12em", marginBottom: 5 }}>
        // DATOS DE MISIÓN
      </div>
      <div style={{ height: 1, background: "rgba(59,234,59,0.1)", marginBottom: 5 }} />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "6.5px", color: "#3BEA3B", opacity: 0.22, letterSpacing: "0.1em", marginBottom: 7 }}>
        FRAME {frame + 1}/3 ── {labels[frame]}
      </div>
      <div style={{
        display: "flex", flexDirection: "column", gap: 4,
        filter:    glitching ? "blur(0.8px)" : "none",
        transform: glitching ? "translateX(2px)" : "none",
        transition: "filter 0.12s, transform 0.12s",
      }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: "flex", gap: 4, alignItems: "baseline" }}>
            {row.label && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#3BEA3B", opacity: 0.4, letterSpacing: "0.05em", flexShrink: 0 }}>
                {row.label}
              </span>
            )}
            {row.value && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: row.green ? "#3BEA3B" : "#F5F5F5", opacity: row.green ? 0.88 : 0.72, letterSpacing: "0.04em" }}>
                {row.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Column 3: Tactical Map ─────────────────────────────────────────────────── */

function TacticalMapCol({ active }: { active: boolean }) {
  const [progress, setProgress] = useState(84);
  const [flash, setFlash]       = useState(false);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      setProgress(v => {
        const next = v + 0.28;
        if (next >= 100) {
          setFlash(true);
          setTimeout(() => setFlash(false), 350);
          return 2;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(id);
  }, [active]);

  const filled = Math.round(Math.min(progress, 100) / 10);
  const bar    = "█".repeat(filled) + "░".repeat(10 - filled);

  return (
    <div style={{ padding: "10px 12px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
      {/* Main row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Coords */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 88 }}>
          {[["LAT","19.4326° N"],["LON","99.1332° W"],["ALT","2,240 M"],["UTC","-06:00"]].map(([k,v]) => (
            <div key={k} style={{ display: "flex", gap: 4 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#3BEA3B", opacity: 0.42, width: 26, flexShrink: 0 }}>{k}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#3BEA3B", opacity: 0.62 }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Radar */}
        <div style={{ flexShrink: 0 }}>
          <MiniRadar active={active} />
        </div>

        {/* Mission data */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {[
            ["OBJETIVO:", ""],
            ["","CONTENIDO"],
            ["","IMPACTANTE"],
            ["CLIENTE:", ""],
            ["","CLASIFICADO"],
            ["DEADLINE:","INMEDIATO"],
          ].map(([k,v],i) => (
            <div key={i} style={{ display: "flex", gap: 4 }}>
              {k && <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#3BEA3B", opacity: 0.38 }}>{k}</span>}
              {v && <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#F5F5F5", opacity: 0.68 }}>{v}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        marginTop: 11,
        display: "flex", alignItems: "center", gap: 6,
        background: flash ? "rgba(59,234,59,0.06)" : "transparent",
        padding: "2px 0",
        transition: "background 0.2s",
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#3BEA3B", opacity: 0.38, letterSpacing: "0.06em", flexShrink: 0 }}>MISIÓN EN CURSO</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#3BEA3B", opacity: flash ? 1 : 0.72, letterSpacing: "0.01em", transition: "opacity 0.2s" }}>{bar}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: flash ? "#3BEA3B" : "#F5F5F5", opacity: flash ? 1 : 0.58, transition: "color 0.2s, opacity 0.2s", flexShrink: 0 }}>
          {Math.round(Math.min(progress, 100))}%
        </span>
      </div>
    </div>
  );
}

/* ── Column 4: Live Feed ────────────────────────────────────────────────────── */

type LogEntry = { id: number; ts: string; event: string; age: number };

function getTs(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
}

function LiveFeed({ active }: { active: boolean }) {
  const [entries, setEntries] = useState<LogEntry[]>(() =>
    Array.from({ length: 7 }, (_, i) => ({
      id: i, ts: getTs(),
      event: LOG_EVENTS[i % LOG_EVENTS.length],
      age: 7 - i,
    }))
  );
  const nextId  = useRef(20);
  const evtIdx  = useRef(7);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => {
      const entry: LogEntry = { id: nextId.current++, ts: getTs(), event: LOG_EVENTS[evtIdx.current % LOG_EVENTS.length], age: 0 };
      evtIdx.current++;
      setEntries(prev => [entry, ...prev.map(e => ({ ...e, age: e.age + 1 }))].slice(0, 8));
    }, 2300);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div style={{ padding: "10px 8px", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#3BEA3B", opacity: 0.38, letterSpacing: "0.12em", marginBottom: 7 }}>
        // LIVE FEED
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, overflow: "hidden" }}>
        {entries.map(e => (
          <div
            key={e.id}
            style={{
              display: "flex", gap: 4, alignItems: "baseline",
              opacity: Math.max(0.08, 1 - e.age * 0.14),
              transition: "opacity 0.5s",
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#3BEA3B", opacity: 0.48, flexShrink: 0, letterSpacing: "0.01em" }}>
              [{e.ts}]
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "#F5F5F5", letterSpacing: "0.03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {e.event}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Column 5: Signal Monitor ───────────────────────────────────────────────── */

function SignalMonitor({ active }: { active: boolean }) {
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setBlink(v => !v), 850);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ padding: "8px 6px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5 }}>
      <SignalWaveform active={active} />
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "6.5px", color: "#3BEA3B", opacity: 0.42, letterSpacing: "0.14em" }}>
        SIGNAL
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#3BEA3B", display: "block", opacity: blink ? 0.9 : 0.2, transition: "opacity 0.35s" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "6.5px", color: "#3BEA3B", opacity: blink ? 0.8 : 0.25, transition: "opacity 0.35s", letterSpacing: "0.1em" }}>LIVE</span>
      </div>
      <div style={{ display: "flex", gap: 2 }}>
        {[1,2,3,4,5].map(i => (
          <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#3BEA3B", opacity: i <= 4 ? 0.8 : 0.18 }}>●</span>
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────────── */

export function TacticalBriefingStrip() {
  const stripRef    = useRef<HTMLDivElement>(null);
  const [active, setActive]   = useState(false);
  const [entered, setEntered] = useState(false);
  const [glitch, setGlitch]   = useState(false);
  const glitchDir             = useRef(1);
  const prefersReduced        = useRef(false);

  useEffect(() => {
    prefersReduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  /* pause when off-screen */
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* periodic glitch every 8s */
  useEffect(() => {
    if (!active || prefersReduced.current) return;
    const id = setInterval(() => {
      glitchDir.current = Math.random() > 0.5 ? 1 : -1;
      setGlitch(true);
      setTimeout(() => setGlitch(false), 190);
    }, 8000);
    return () => clearInterval(id);
  }, [active]);

  /* GSAP entry animation */
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      /* borders draw in */
      gsap.fromTo(
        el.querySelectorAll(".tbs-border"),
        { scaleX: 0 },
        { scaleX: 1, duration: 0.65, ease: "power2.out", transformOrigin: "left center",
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" } }
      );
      /* columns stagger in */
      gsap.fromTo(
        el.querySelectorAll(".tbs-col"),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.38, ease: "power2.out", stagger: 0.09,
          scrollTrigger: {
            trigger: el, start: "top 85%", toggleActions: "play none none none",
            onEnter: () => { setEntered(true); },
          },
        }
      );
      /* entry flash */
      gsap.fromTo(
        el.querySelector(".tbs-flash"),
        { opacity: 0 },
        { opacity: 0.1, duration: 0.15, yoyo: true, repeat: 1,
          scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" } }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={stripRef}
      aria-label="Briefing de operaciones Fractal MX"
      style={{
        position: "relative",
        width: "100%",
        height: 180,
        background: "#020202",
        overflow: "hidden",
        /* mobile: shorter */
      }}
    >
      <style>{`
        @keyframes tbs-scanline {
          0%   { top: -1px; }
          100% { top: 181px; }
        }
        @media (max-width: 640px) {
          .tbs-strip { height: 130px !important; }
          .tbs-hide-mobile { display: none !important; }
          .tbs-col-2 { width: 38% !important; }
          .tbs-col-3 { width: 42% !important; }
          .tbs-col-4 { width: 20% !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tbs-scanline { display: none !important; }
        }
      `}</style>

      {/* Entry flash overlay */}
      <div className="tbs-flash" aria-hidden style={{ position: "absolute", inset: 0, background: "rgba(59,234,59,1)", opacity: 0, pointerEvents: "none", zIndex: 8 }} />

      {/* Top + bottom borders */}
      <div className="tbs-border" aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(59,234,59,0.15)", transformOrigin: "left center", transform: "scaleX(0)", zIndex: 4 }} />
      <div className="tbs-border" aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "rgba(59,234,59,0.15)", transformOrigin: "left center", transform: "scaleX(0)", zIndex: 4 }} />

      {/* CRT scan line */}
      {entered && (
        <div
          className="tbs-scanline"
          aria-hidden
          style={{
            position: "absolute", left: 0, right: 0, height: 1, zIndex: 5, pointerEvents: "none",
            background: "linear-gradient(90deg, transparent, rgba(59,234,59,0.18) 30%, rgba(59,234,59,0.22) 50%, rgba(59,234,59,0.18) 70%, transparent)",
            animation: "tbs-scanline 2s linear infinite",
          }}
        />
      )}

      {/* Glitch chromatic overlay */}
      {glitch && (
        <div aria-hidden style={{
          position: "absolute", inset: 0, zIndex: 6, pointerEvents: "none",
          background: "transparent",
          boxShadow: `${glitchDir.current * 4}px 0 0 rgba(59,234,59,0.06), ${-glitchDir.current * 4}px 0 0 rgba(232,64,64,0.04)`,
        }} />
      )}

      {/* Corner brackets */}
      {(["tl","tr","bl","br"] as const).map(pos => (
        <span key={pos} aria-hidden style={{
          position: "absolute", width: 14, height: 14, zIndex: 4,
          top:    pos.includes("t") ? 5 : "auto",
          bottom: pos.includes("b") ? 5 : "auto",
          left:   pos.includes("l") ? 8 : "auto",
          right:  pos.includes("r") ? 8 : "auto",
          borderTop:    pos.includes("t") ? "1px solid rgba(59,234,59,0.28)" : "none",
          borderBottom: pos.includes("b") ? "1px solid rgba(59,234,59,0.28)" : "none",
          borderLeft:   pos.includes("l") ? "1px solid rgba(59,234,59,0.28)" : "none",
          borderRight:  pos.includes("r") ? "1px solid rgba(59,234,59,0.28)" : "none",
        }} />
      ))}

      {/* Classification rotated label */}
      <div aria-hidden style={{
        position: "absolute", left: 0, top: "50%",
        fontFamily: "var(--font-mono)", fontSize: "5.5px",
        letterSpacing: "0.2em", color: "rgba(59,234,59,0.12)",
        transform: "translateX(-34px) translateY(-50%) rotate(-90deg)",
        whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none",
        zIndex: 2,
      }}>
        CLASIFICADO // FRACTAL MX // OPERATIVO
      </div>

      {/* Columns */}
      <div
        className="tbs-strip"
        style={{
          display: "flex",
          height: "100%",
          transform: glitch ? `translateX(${glitchDir.current * 2}px)` : "none",
          transition: glitch ? "none" : "transform 0.12s ease",
        }}
      >
        {/* Col 1 — Code Stream 20% */}
        <div
          className="tbs-col tbs-hide-mobile"
          style={{ width: "20%", flexShrink: 0, height: "100%", background: "rgba(59,234,59,0.018)", borderRight: "1px solid rgba(59,234,59,0.08)", opacity: 0 }}
        >
          <CodeStream active={active} />
        </div>

        {/* Col 2 — Mission Data 25% */}
        <div
          className="tbs-col tbs-col-2"
          style={{ width: "25%", flexShrink: 0, height: "100%", borderRight: "1px solid rgba(59,234,59,0.08)", opacity: 0 }}
        >
          <MissionData active={active} />
        </div>

        {/* Col 3 — Tactical Map 30% */}
        <div
          className="tbs-col tbs-col-3"
          style={{ width: "30%", flexShrink: 0, height: "100%", borderRight: "1px solid rgba(59,234,59,0.08)", opacity: 0 }}
        >
          <TacticalMapCol active={active} />
        </div>

        {/* Col 4 — Live Feed 15% */}
        <div
          className="tbs-col tbs-col-4"
          style={{ width: "15%", flexShrink: 0, height: "100%", borderRight: "1px solid rgba(59,234,59,0.08)", opacity: 0 }}
        >
          <LiveFeed active={active} />
        </div>

        {/* Col 5 — Signal Monitor 10% */}
        <div
          className="tbs-col tbs-hide-mobile"
          style={{ width: "10%", flexShrink: 0, height: "100%", opacity: 0 }}
        >
          <SignalMonitor active={active} />
        </div>
      </div>
    </div>
  );
}
