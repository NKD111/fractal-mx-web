"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
import { useAudio } from "@/context/AudioContext";

const METRICS = [
  { value: "45+",  label: "Clientes activos"        },
  { value: "7",    label: "Años de experiencia"      },
  { value: "200+", label: "Proyectos entregados"     },
  { value: "∞",    label: "Ideas que aún no existen" },
];

export function NumberScreen() {
  const { play }     = useAudio();
  const sectionRef   = useRef<HTMLElement>(null);
  const numberRef    = useRef<HTMLDivElement>(null);
  const outlineRef   = useRef<HTMLDivElement>(null);
  const counterRef   = useRef<HTMLSpanElement>(null);
  const labelRef     = useRef<HTMLDivElement>(null);
  const metricsRef   = useRef<HTMLDivElement>(null);
  const hudRef       = useRef<HTMLDivElement>(null);
  const lineRef      = useRef<HTMLDivElement>(null);
  const portalRef    = useRef<HTMLDivElement>(null);
  const [portalFired, setPortalFired] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=180%",
          pin: true,
          scrub: 1.2,
          anticipatePin: 1,
          onEnter: () => setPortalFired(true),
        },
      });

      /* ── 0–40% : portal rings burst + giant outline shrinks in ── */
      tl.fromTo(
        outlineRef.current,
        { opacity: 0, scale: 3.5, filter: "blur(40px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "power4.out" },
        0
      );

      /* Counter number materializes — scale from far + glitch */
      tl.fromTo(
        numberRef.current,
        { opacity: 0, scale: 2.2, y: -60, filter: "blur(20px)" },
        { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "expo.out" },
        0.02
      );

      /* Counter 0 → 45 */
      const counter = { val: 0 };
      tl.to(
        counter,
        {
          val: 45,
          duration: 0.4,
          ease: "power2.out",
          onUpdate: () => {
            if (counterRef.current) {
              const prev = counterRef.current.textContent;
              const next = Math.round(counter.val).toString().padStart(2, "0");
              if (prev !== next) play("counter");
              counterRef.current.textContent = next;
            }
          },
        },
        0.04
      );

      /* ── HUD ── */
      tl.fromTo(
        hudRef.current,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.2 },
        0.2
      );

      /* ── Label + line ── */
      tl.fromTo(
        labelRef.current,
        { opacity: 0, y: 24, letterSpacing: "0.6em" },
        { opacity: 1, y: 0, letterSpacing: "0.22em", duration: 0.35, ease: "power2.out" },
        0.3
      );
      tl.fromTo(
        lineRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.28, ease: "power2.out", transformOrigin: "left center" },
        0.32
      );

      /* ── Metrics — fly in from right like projections ── */
      const metricItems = metricsRef.current?.querySelectorAll("[data-metric]");
      if (metricItems?.length) {
        tl.fromTo(
          metricItems,
          { opacity: 0, x: 60, scale: 0.88, filter: "blur(8px)" },
          { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", duration: 0.28, ease: "power3.out", stagger: 0.07 },
          0.44
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="number-screen"
      style={{
        position: "relative",
        height: "100dvh",
        overflow: "hidden",
        background: "#080808",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{`
        @keyframes portal-ring-1 {
          0%   { transform: translate(-50%,-50%) scale(0.05); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(1.8);  opacity: 0; }
        }
        @keyframes portal-ring-2 {
          0%   { transform: translate(-50%,-50%) scale(0.05); opacity: 0.7; }
          100% { transform: translate(-50%,-50%) scale(2.4);  opacity: 0; }
        }
        @keyframes portal-ring-3 {
          0%   { transform: translate(-50%,-50%) scale(0.05); opacity: 0.4; }
          100% { transform: translate(-50%,-50%) scale(3.2);  opacity: 0; }
        }
        @keyframes portal-vortex {
          0%   { transform: translate(-50%,-50%) scale(0) rotate(0deg);   opacity: 0.8; }
          60%  { opacity: 0.4; }
          100% { transform: translate(-50%,-50%) scale(1.4) rotate(360deg); opacity: 0; }
        }
        @keyframes portal-scan {
          0%   { transform: translate(-50%,-50%) scaleX(0); opacity: 0.8; }
          40%  { transform: translate(-50%,-50%) scaleX(1); opacity: 0.6; }
          100% { transform: translate(-50%,-50%) scaleX(1.6); opacity: 0; }
        }
        @keyframes portal-core-pulse {
          0%   { transform: translate(-50%,-50%) scale(0); opacity: 1; }
          50%  { transform: translate(-50%,-50%) scale(1); opacity: 0.5; }
          100% { transform: translate(-50%,-50%) scale(1.5); opacity: 0; }
        }
        @keyframes hud-blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
        }
        @media (max-width: 640px) {
          .numscreen-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .numscreen-metrics {
            border-left: none !important;
            padding-left: 0 !important;
            border-top: 1px solid rgba(59,234,59,0.08);
            padding-top: 1.5rem;
            flex-direction: row !important;
            flex-wrap: wrap;
            gap: 1.5rem !important;
          }
        }
      `}</style>

      {/* ── Portal burst (fires once on enter) ── */}
      <div
        ref={portalRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
          opacity: portalFired ? 1 : 0,
          transition: "opacity 0ms",
        }}
      >
        {/* Core flash */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: "min(30vw, 300px)", height: "min(30vw, 300px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,234,59,0.7) 0%, transparent 70%)",
          animation: portalFired ? "portal-core-pulse 0.7s cubic-bezier(0.16,1,0.3,1) forwards" : "none",
        }} />
        {/* Ring 1 — fastest */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: "min(55vw, 560px)", height: "min(55vw, 560px)",
          borderRadius: "50%",
          border: "1.5px solid rgba(59,234,59,0.9)",
          boxShadow: "0 0 24px rgba(59,234,59,0.6), inset 0 0 24px rgba(59,234,59,0.15)",
          animation: portalFired ? "portal-ring-1 0.65s cubic-bezier(0.16,1,0.3,1) forwards" : "none",
        }} />
        {/* Ring 2 — medium */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: "min(55vw, 560px)", height: "min(55vw, 560px)",
          borderRadius: "50%",
          border: "1px solid rgba(59,234,59,0.5)",
          animation: portalFired ? "portal-ring-2 0.85s 0.05s cubic-bezier(0.16,1,0.3,1) forwards" : "none",
        }} />
        {/* Ring 3 — slowest */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: "min(55vw, 560px)", height: "min(55vw, 560px)",
          borderRadius: "50%",
          border: "0.5px solid rgba(59,234,59,0.25)",
          animation: portalFired ? "portal-ring-3 1.1s 0.1s cubic-bezier(0.16,1,0.3,1) forwards" : "none",
        }} />
        {/* Vortex disc */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: "min(50vw, 500px)", height: "min(50vw, 500px)",
          borderRadius: "50%",
          background: "conic-gradient(from 0deg, transparent 0%, rgba(59,234,59,0.15) 25%, transparent 50%, rgba(59,234,59,0.1) 75%, transparent 100%)",
          animation: portalFired ? "portal-vortex 0.9s cubic-bezier(0.16,1,0.3,1) forwards" : "none",
        }} />
        {/* Horizontal scan burst */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: "min(55vw, 560px)", height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(59,234,59,0.8) 30%, rgba(59,234,59,1) 50%, rgba(59,234,59,0.8) 70%, transparent)",
          boxShadow: "0 0 16px rgba(59,234,59,0.6)",
          animation: portalFired ? "portal-scan 0.55s cubic-bezier(0.16,1,0.3,1) forwards" : "none",
        }} />
      </div>

      {/* ── Persistent ambient radial glow ── */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(59,234,59,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Orbital ring decorations ── */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute", top: "50%", left: "50%",
            width: `${22 + i * 18}vw`, height: `${22 + i * 18}vw`,
            maxWidth: `${240 + i * 200}px`, maxHeight: `${240 + i * 200}px`,
            borderRadius: "50%",
            border: `1px solid rgba(59,234,59,${0.04 - i * 0.01})`,
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* ── Outlined ghost number behind ── */}
      <div
        ref={outlineRef}
        aria-hidden
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-headline)",
          fontWeight: 800,
          fontSize: "clamp(18rem, 42vw, 52rem)",
          lineHeight: 0.8,
          letterSpacing: "-0.05em",
          color: "transparent",
          WebkitTextStroke: "1px rgba(59,234,59,0.07)",
          textShadow: "0 0 120px rgba(59,234,59,0.04)",
          userSelect: "none",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          opacity: 0,
          zIndex: 0,
        }}
      >
        45
      </div>

      {/* ── Main layout ── */}
      <div
        className="numscreen-grid"
        style={{
          position: "relative",
          zIndex: 3,
          width: "100%",
          maxWidth: 1400,
          padding: "0 clamp(1.5rem, 6vw, 6rem)",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "center",
          gap: "clamp(2rem, 5vw, 6rem)",
        }}
      >
        {/* ── Left: giant number + label ── */}
        <div>
          {/* HUD label */}
          <div
            ref={hudRef}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: "clamp(0.5rem, 2vh, 1rem)",
              opacity: 0,
            }}
          >
            <span style={{
              display: "block", width: 6, height: 6,
              borderRadius: "50%",
              background: "#3BEA3B",
              boxShadow: "0 0 8px #3BEA3B",
              animation: "hud-blink 1.4s ease-in-out infinite",
            }} />
            <span style={{ display: "block", width: 20, height: 1, background: "rgba(59,234,59,0.35)" }} />
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              color: "rgba(59,234,59,0.5)",
            }}>
              CLIENTES // VERIFIED
            </span>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.55rem",
              letterSpacing: "0.1em",
              color: "rgba(59,234,59,0.2)",
              marginLeft: 8,
            }}>
              [SYS:OK]
            </span>
          </div>

          {/* Counter number */}
          <div
            ref={numberRef}
            style={{
              fontFamily: "var(--font-headline)",
              fontWeight: 800,
              fontSize: "clamp(7rem, 22vw, 22rem)",
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
              color: "#F5F5F5",
              display: "flex",
              alignItems: "flex-end",
              gap: "0.04em",
              opacity: 0,
            }}
          >
            <span ref={counterRef} style={{ fontVariantNumeric: "tabular-nums" }}>00</span>
            <span style={{
              color: "#3BEA3B",
              fontSize: "0.45em",
              textShadow: "0 0 40px rgba(59,234,59,0.6), 0 0 80px rgba(59,234,59,0.2)",
              marginBottom: "0.12em",
            }}>+</span>
          </div>

          {/* Divider line */}
          <div
            ref={lineRef}
            style={{
              height: 1,
              background: "linear-gradient(90deg, rgba(59,234,59,0.5), rgba(59,234,59,0.08) 60%, transparent)",
              marginTop: "clamp(1rem, 3vh, 2rem)",
              marginBottom: "clamp(1rem, 3vh, 2rem)",
              transformOrigin: "left center",
              transform: "scaleX(0)",
            }}
          />

          {/* Label */}
          <div
            ref={labelRef}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(0.6rem, 1.1vw, 0.85rem)",
              letterSpacing: "0.22em",
              color: "rgba(245,245,245,0.35)",
              textTransform: "uppercase",
              opacity: 0,
            }}
          >
            EMPRESAS QUE HAN CONFIADO EN FRACTAL MX
          </div>
        </div>

        {/* ── Right: metrics list ── */}
        <div
          ref={metricsRef}
          className="numscreen-metrics"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(1.5rem, 4vh, 2.5rem)",
            borderLeft: "1px solid rgba(59,234,59,0.07)",
            paddingLeft: "clamp(2rem, 5vw, 4rem)",
          }}
        >
          {METRICS.map((m, i) => (
            <div key={i} data-metric style={{ opacity: 0 }}>
              <span style={{
                display: "block",
                fontFamily: "var(--font-headline)",
                fontWeight: 800,
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                letterSpacing: "-0.03em",
                color: i === 0 ? "#3BEA3B" : "#F5F5F5",
                lineHeight: 1,
                textShadow: i === 0
                  ? "0 0 30px rgba(59,234,59,0.4), 0 0 60px rgba(59,234,59,0.15)"
                  : "none",
              }}>
                {m.value}
              </span>
              <span style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                color: "#666",
                marginTop: 4,
                textTransform: "uppercase",
              }}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Corner HUD brackets ── */}
      {(["tl","tr","bl","br"] as const).map((pos) => (
        <span
          key={pos}
          aria-hidden
          style={{
            position: "absolute",
            width: 20, height: 20,
            top: pos.includes("t") ? 28 : "auto",
            bottom: pos.includes("b") ? 28 : "auto",
            left:  pos.includes("l") ? 28 : "auto",
            right: pos.includes("r") ? 28 : "auto",
            borderTop:    pos.includes("t") ? "1px solid rgba(59,234,59,0.2)" : "none",
            borderBottom: pos.includes("b") ? "1px solid rgba(59,234,59,0.2)" : "none",
            borderLeft:   pos.includes("l") ? "1px solid rgba(59,234,59,0.2)" : "none",
            borderRight:  pos.includes("r") ? "1px solid rgba(59,234,59,0.2)" : "none",
            zIndex: 4,
          }}
        />
      ))}

      {/* ── Bottom coordinate readout ── */}
      <div style={{
        position: "absolute",
        bottom: "clamp(1.5rem, 4vh, 2.5rem)",
        right: "clamp(1.5rem, 4vw, 3rem)",
        fontFamily: "var(--font-mono)",
        fontSize: "0.55rem",
        letterSpacing: "0.12em",
        color: "rgba(59,234,59,0.18)",
        textAlign: "right",
        zIndex: 4,
      }}>
        SYS:REF 005 · FRACTAL.MX
      </div>
    </section>
  );
}
