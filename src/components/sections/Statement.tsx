"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";

const LINES = [
  { text: "TU MARCA,",  accent: false },
  { text: "NUESTRA",    accent: false },
  { text: "MISIÓN.",    accent: true  },
];

const SUB = "Cada decisión creativa existe por ti. Tu audiencia, tu resultado, tu legado.";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%><{}[]/\\";

/* ── Decode text hook ─────────────────────────────────────────────── */
function useDecodeText(text: string, active: boolean, delay = 0) {
  const [display, setDisplay] = useState(() => text.replace(/[A-Za-z0-9]/g, "_"));

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let t: ReturnType<typeof setTimeout>;

    const tick = () => {
      frame++;
      setDisplay(
        text
          .split("")
          .map((ch, i) => {
            if (ch === " " || ch === "," || ch === ".") return ch;
            const revealAt = i * 3 + 6;
            if (frame >= revealAt) return ch;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      const done = text.split("").every((ch, i) => {
        if (ch === " " || ch === "," || ch === ".") return true;
        return frame >= i * 3 + 6;
      });
      if (!done) t = setTimeout(tick, 38);
    };

    const start = setTimeout(tick, delay);
    return () => { clearTimeout(start); clearTimeout(t); };
  }, [active, text, delay]);

  return display;
}

/* ── Decoded line component ───────────────────────────────────────── */
function DecodeLine({
  text,
  accent,
  active,
  delay,
}: {
  text: string;
  accent: boolean;
  active: boolean;
  delay: number;
}) {
  const decoded = useDecodeText(text, active, delay);
  return (
    <span
      style={{
        color: accent ? "#3BEA3B" : "#F5F5F5",
        textShadow: accent ? "0 0 80px rgba(59,234,59,0.35)" : "none",
      }}
    >
      {decoded}
    </span>
  );
}

export function Statement() {
  const sectionRef  = useRef<HTMLElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);
  const barRef      = useRef<HTMLDivElement>(null);
  const bgRef       = useRef<HTMLDivElement>(null);
  const laserRef    = useRef<HTMLDivElement>(null);
  const headRef     = useRef<HTMLDivElement>(null);
  const [decoding, setDecoding] = useState(false);
  const [laserActive, setLaserActive] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "fractalOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 68%",
            toggleActions: "play none none none",
            onEnter: () => {
              setLaserActive(true);
              setTimeout(() => setDecoding(true), 400);
            },
          },
        }
      );

      gsap.fromTo(
        subRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          duration: 0.8, ease: "fractalOut",
          scrollTrigger: { trigger: sectionRef.current, start: "top 52%" },
          delay: 0.5,
        }
      );

      gsap.fromTo(
        barRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        }
      );

      gsap.fromTo(
        bgRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.8,
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="statement"
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: "#080808",
        padding: "clamp(4rem, 10vh, 8rem) clamp(1.5rem, 6vw, 6rem)",
      }}
    >
      {/* ── Ambient bg ── */}
      <div ref={bgRef} aria-hidden style={{ position: "absolute", inset: 0, opacity: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "70vw", height: "70vw",
          maxWidth: 900, maxHeight: 900,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(59,234,59,0.06) 0%, transparent 65%)",
        }} />
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            position: "absolute", left: 0, right: 0,
            top: `${22 + i * 27}%`,
            height: 1,
            background: `linear-gradient(90deg, transparent, rgba(59,234,59,${0.04 + i * 0.02}) 40%, rgba(59,234,59,${0.07 + i * 0.02}) 60%, transparent)`,
            animation: `shimmer-h ${6 + i * 2}s ease-in-out ${i * 1.5}s infinite alternate`,
          }} />
        ))}
      </div>

      {/* ── HUD top label ── */}
      <div style={{
        position: "absolute",
        top: "clamp(2rem, 5vh, 3.5rem)",
        left: "clamp(1.5rem, 6vw, 6rem)",
        display: "flex", alignItems: "center", gap: 12,
        fontFamily: "var(--font-mono)", fontSize: "0.6rem",
        letterSpacing: "0.18em", color: "rgba(59,234,59,0.3)",
      }}>
        <span style={{ display: "block", width: 20, height: 1, background: "rgba(59,234,59,0.25)" }} />
        STATEMENT // 001
      </div>

      {/* ── Progress bar ── */}
      <div ref={barRef} aria-hidden style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 1,
        background: "rgba(59,234,59,0.35)",
        transformOrigin: "left center",
        transform: "scaleX(0)",
      }} />

      {/* ── Main headline ── */}
      <div ref={headRef} style={{ textAlign: "center", position: "relative", zIndex: 1, opacity: 0 }}>

        {/* Laser sweep overlay */}
        <div
          aria-hidden
          ref={laserRef}
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: 0,
            width: "3px",
            zIndex: 10,
            pointerEvents: "none",
            background: "linear-gradient(to bottom, transparent 0%, rgba(59,234,59,0.9) 30%, #3BEA3B 50%, rgba(59,234,59,0.9) 70%, transparent 100%)",
            boxShadow: "0 0 16px #3BEA3B, 0 0 40px rgba(59,234,59,0.6), 0 0 80px rgba(59,234,59,0.2)",
            animation: laserActive ? "laser-sweep 0.55s cubic-bezier(0.16,1,0.3,1) forwards" : "none",
          }}
        />

        {LINES.map((line, i) => (
          <div
            key={i}
            style={{ overflow: "hidden", lineHeight: 0.92, marginBottom: "0.06em" }}
          >
            <div
              style={{
                fontFamily: "var(--font-headline)",
                fontWeight: 800,
                fontSize: "clamp(3rem, 10vw, 10rem)",
                letterSpacing: "-0.03em",
                willChange: "transform",
              }}
            >
              <DecodeLine
                text={line.text}
                accent={line.accent}
                active={decoding}
                delay={i * 180}
              />
            </div>
          </div>
        ))}

        {/* ── Sub copy ── */}
        <p
          ref={subRef}
          style={{
            marginTop: "clamp(2rem, 5vh, 3rem)",
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.9rem, 1.3vw, 1.1rem)",
            color: "#888888",
            letterSpacing: "0.02em",
            opacity: 0,
            maxWidth: 480,
            margin: "clamp(2rem, 5vh, 3rem) auto 0",
            lineHeight: 1.65,
          }}
        >
          {SUB}
        </p>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 16,
          marginTop: "clamp(2.5rem, 6vh, 4rem)",
        }}>
          <span style={{ display: "block", width: 40, height: 1, background: "rgba(59,234,59,0.2)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", color: "rgba(59,234,59,0.4)" }}>◈</span>
          <span style={{ display: "block", width: 40, height: 1, background: "rgba(59,234,59,0.2)" }} />
        </div>
      </div>

      {/* ── Corner brackets ── */}
      {(["tl","tr","bl","br"] as const).map((pos) => (
        <span key={pos} aria-hidden style={{
          position: "absolute",
          width: 18, height: 18,
          top: pos.includes("t") ? "clamp(1.5rem,4vh,2.5rem)" : "auto",
          bottom: pos.includes("b") ? "clamp(1.5rem,4vh,2.5rem)" : "auto",
          left:  pos.includes("l") ? "clamp(1rem,3vw,2rem)" : "auto",
          right: pos.includes("r") ? "clamp(1rem,3vw,2rem)" : "auto",
          borderTop:    pos.includes("t") ? "1px solid rgba(59,234,59,0.15)" : "none",
          borderBottom: pos.includes("b") ? "1px solid rgba(59,234,59,0.15)" : "none",
          borderLeft:   pos.includes("l") ? "1px solid rgba(59,234,59,0.15)" : "none",
          borderRight:  pos.includes("r") ? "1px solid rgba(59,234,59,0.15)" : "none",
        }} />
      ))}

      <style>{`
        @keyframes shimmer-h {
          from { opacity: 0.5; transform: translateX(-5%); }
          to   { opacity: 1;   transform: translateX(5%); }
        }
        @keyframes laser-sweep {
          0%   { left: -4px;   opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { left: calc(100% + 4px); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
