"use client";

import { useRef, useEffect, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-config";
/* ─── Data ────────────────────────────────────────────────────────────── */

const ALL_CLIENTS = [
  "Coca-Cola", "Amazon Prime", "Liverpool", "Kenview", "Vanexpo",
  "Informa Markets", "Mutek", "Acuario Inbursa", "Cocay", "Medusa Lab",
  "TCL", "Machina", "Expo Pack", "Feria Intl. de Franquicias",
  "Expo Tendero", "Expo Eléctrica", "Cintermex", "Central Interactiva",
];

const FEATURED = [
  { name: "Coca-Cola",       cat: "BEBIDAS",   accent: "#E84040" },
  { name: "Amazon Prime",    cat: "STREAMING", accent: "#4FA3E8" },
  { name: "Liverpool",       cat: "RETAIL",    accent: "#3BEA3B" },
  { name: "Mutek",           cat: "CULTURA",   accent: "#8B5CF6" },
  { name: "Informa Markets", cat: "EVENTOS",   accent: "#F59E0B" },
];

/* triple for seamless loop */
const ROW_A = [...ALL_CLIENTS, ...ALL_CLIENTS, ...ALL_CLIENTS];
const ROW_B = [...ALL_CLIENTS].reverse().concat([...ALL_CLIENTS].reverse(), [...ALL_CLIENTS].reverse());

/* ─── Marquee row ─────────────────────────────────────────────────────── */
function MarqueeRow({ items, dir = 1, dur = 50 }: {
  items: string[]; dir?: 1 | -1; dur?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const w = el.scrollWidth / 3;
    const start = dir === 1 ? 0 : -w;
    const end   = dir === 1 ? -w : 0;

    const anim = gsap.fromTo(el,
      { x: start },
      { x: end, duration: dur, ease: "none", repeat: -1 }
    );

    return () => { anim.kill(); };
  }, [dir, dur]);

  return (
    <div style={{ overflow: "hidden", position: "relative" }}>
      <div ref={trackRef} style={{ display: "flex", gap: "clamp(3rem, 6vw, 6rem)", alignItems: "center", whiteSpace: "nowrap", willChange: "transform" }}>
        {items.map((name, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.22em",
            color: "rgba(245,245,245,0.12)",
            textTransform: "uppercase",
            userSelect: "none",
            flexShrink: 0,
          }}>
            {name}
            <span style={{ marginLeft: "clamp(1.5rem, 3vw, 3rem)", color: "rgba(59,234,59,0.15)" }}>◈</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Featured card ───────────────────────────────────────────────────── */
function FeaturedCard({ name, cat, idx, accent }: { name: string; cat: string; idx: number; accent: string }) {
  const [hov, setHov] = useState(false);
  const rgb = accent.replace("#","");
  const r = parseInt(rgb.slice(0,2),16), g = parseInt(rgb.slice(2,4),16), b = parseInt(rgb.slice(4,6),16);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "clamp(1rem, 2.5vw, 1.5rem) clamp(1.2rem, 3vw, 2rem)",
        border: `1px solid ${hov ? `rgba(${r},${g},${b},0.5)` : "rgba(59,234,59,0.1)"}`,
        background: hov ? `rgba(${r},${g},${b},0.04)` : "transparent",
        transition: "border-color 300ms, background 300ms, box-shadow 300ms",
        boxShadow: hov ? `0 0 32px rgba(${r},${g},${b},0.08), inset 0 0 20px rgba(${r},${g},${b},0.03)` : "none",
        cursor: "default",
        position: "relative",
        minWidth: "clamp(120px, 16vw, 180px)",
      }}
    >
      {/* index */}
      <div style={{
        position: "absolute", top: 8, right: 10,
        fontFamily: "var(--font-mono)", fontSize: "0.5rem",
        letterSpacing: "0.14em", color: hov ? `rgba(${r},${g},${b},0.4)` : "rgba(59,234,59,0.25)",
        transition: "color 300ms",
      }}>
        {String(idx + 1).padStart(2, "0")}
      </div>

      {/* name */}
      <div style={{
        fontFamily: "var(--font-headline)", fontWeight: 800,
        fontSize: "clamp(0.8rem, 1.4vw, 1.05rem)",
        letterSpacing: "-0.01em", color: hov ? "#F5F5F5" : "#888",
        transition: "color 300ms", lineHeight: 1.1,
        marginBottom: 6,
      }}>
        {name}
      </div>

      {/* category */}
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "0.5rem",
        letterSpacing: "0.18em",
        color: hov ? `rgba(${r},${g},${b},0.85)` : "rgba(59,234,59,0.3)",
        transition: "color 300ms",
      }}>
        {cat}
      </div>

      {/* bottom verified */}
      <div style={{
        marginTop: 8,
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <span style={{ display: "block", width: 5, height: 5, borderRadius: "50%",
          background: hov ? accent : "rgba(59,234,59,0.2)",
          boxShadow: hov ? `0 0 8px ${accent}` : "none",
          transition: "background 300ms, box-shadow 300ms" }} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.45rem",
          letterSpacing: "0.14em", color: hov ? `rgba(${r},${g},${b},0.7)` : "rgba(59,234,59,0.2)",
          transition: "color 300ms" }}>
          VERIFIED
        </span>
      </div>
    </div>
  );
}

/* ─── Section ─────────────────────────────────────────────────────────── */
export function Clients() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);
  const numRef     = useRef<HTMLSpanElement>(null);
  const cardsRef   = useRef<HTMLDivElement>(null);
  const lineTopRef = useRef<HTMLDivElement>(null);
  const lineBotRef = useRef<HTMLDivElement>(null);

  /* counter 0 → 45 */
  useEffect(() => {
    const span = numRef.current;
    if (!span) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const obj = { val: 0 };
      gsap.to(obj, {
        val: 45, duration: 1.4, ease: "power2.out",
        onUpdate: () => {
          span.textContent = String(Math.round(obj.val)).padStart(2, "0") + "+";
        },
      });
    }, { threshold: 0.3 });
    obs.observe(span);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      /* ── Line draw ── */
      gsap.fromTo([lineTopRef.current, lineBotRef.current],
        { scaleX: 0 },
        {
          scaleX: 1, duration: 1.2, ease: "power3.out",
          stagger: 0.15,
          transformOrigin: "left center",
          scrollTrigger: { trigger: headRef.current, start: "top 75%" },
        }
      );

      /* ── Header text ── */
      gsap.fromTo(headRef.current,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "fractalOut",
          scrollTrigger: { trigger: headRef.current, start: "top 72%" },
        }
      );

      /* ── Cards cascade ── */
      const cards = cardsRef.current?.querySelectorAll("[data-fcard]");
      if (cards?.length) {
        gsap.fromTo(cards,
          { opacity: 0, y: 32 },
          {
            opacity: 1, y: 0, duration: 0.55, ease: "fractalOut", stagger: 0.07,
            scrollTrigger: { trigger: cardsRef.current, start: "top 78%" },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="clientes"
      style={{
        position: "relative",
        background: "#080808",
        padding: "clamp(5rem, 12vh, 9rem) 0",
        overflow: "hidden",
      }}
    >
      {/* ── Ambient glow ── */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(59,234,59,0.025) 0%, transparent 70%)",
      }} />

      {/* ── Edge fades for marquee ── */}
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
        background: "linear-gradient(90deg, #080808 0%, transparent 8%, transparent 92%, #080808 100%)",
      }} />

      {/* ── Header ── */}
      <div
        ref={headRef}
        style={{
          position: "relative", zIndex: 3,
          padding: "0 clamp(1.5rem, 6vw, 6rem)",
          maxWidth: 1400, margin: "0 auto",
          marginBottom: "clamp(3rem, 6vh, 5rem)",
          opacity: 0,
        }}
      >
        {/* top line */}
        <div ref={lineTopRef} style={{
          height: 1, background: "rgba(59,234,59,0.15)",
          marginBottom: "clamp(1.5rem, 4vh, 2.5rem)",
          transform: "scaleX(0)", transformOrigin: "left center",
        }} />

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem" }}>
          {/* left: HUD label + big number */}
          <div>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: "clamp(0.6rem, 2vh, 1rem)",
              fontFamily: "var(--font-mono)", fontSize: "0.58rem",
              letterSpacing: "0.2em", color: "rgba(59,234,59,0.4)",
            }}>
              <span style={{ display: "block", width: 18, height: 1, background: "rgba(59,234,59,0.3)" }} />
              // CLIENTES VERIFICADOS
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "clamp(1rem, 2.5vw, 2rem)" }}>
              <span
                ref={numRef}
                style={{
                  fontFamily: "var(--font-headline)", fontWeight: 800,
                  fontSize: "clamp(3rem, 6vw, 5.5rem)", lineHeight: 1,
                  letterSpacing: "-0.04em", color: "#3BEA3B",
                  textShadow: "0 0 50px rgba(59,234,59,0.25)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                000+
              </span>
              <p style={{
                fontFamily: "var(--font-mono)", fontSize: "0.58rem",
                letterSpacing: "0.15em", color: "rgba(245,245,245,0.3)",
                lineHeight: 1.6, textTransform: "uppercase",
              }}>
                EMPRESAS QUE HAN<br />CONFIADO EN FRACTAL MX
              </p>
            </div>
          </div>

          {/* right: status */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.2em", color: "rgba(245,245,245,0.15)" }}>
              STATUS
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.16em", color: "#3BEA3B" }}>
              <span style={{ display: "block", width: 6, height: 6, borderRadius: "50%", background: "#3BEA3B", boxShadow: "0 0 8px #3BEA3B", animation: "pulse-dot 2s ease-in-out infinite" }} />
              ACTIVO
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.12em", color: "rgba(245,245,245,0.1)" }}>
              SYS:CL — CDMX
            </span>
          </div>
        </div>

        {/* bottom line */}
        <div ref={lineBotRef} style={{
          height: 1, background: "rgba(59,234,59,0.1)",
          marginTop: "clamp(1.5rem, 4vh, 2.5rem)",
          transform: "scaleX(0)", transformOrigin: "left center",
        }} />
      </div>

      {/* ── Featured clients ── */}
      <div
        ref={cardsRef}
        style={{
          position: "relative", zIndex: 3,
          padding: "0 clamp(1.5rem, 6vw, 6rem)",
          maxWidth: 1400, margin: "0 auto",
          display: "flex", flexWrap: "wrap",
          gap: "clamp(0.5rem, 1.5vw, 1rem)",
          marginBottom: "clamp(4rem, 8vh, 6rem)",
        }}
      >
        {FEATURED.map((f, i) => (
          <div key={f.name} data-fcard style={{ opacity: 0 }}>
            <FeaturedCard name={f.name} cat={f.cat} accent={f.accent} idx={i} />
          </div>
        ))}

        {/* "+13 más" chip */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "clamp(1rem, 2.5vw, 1.5rem) clamp(1.2rem, 3vw, 2rem)",
          border: "1px solid rgba(59,234,59,0.06)",
          minWidth: "clamp(100px, 12vw, 140px)",
        }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "0.6rem",
            letterSpacing: "0.16em", color: "rgba(245,245,245,0.2)",
          }}>
            +{ALL_CLIENTS.length - FEATURED.length} MÁS
          </span>
        </div>
      </div>

      {/* ── Marquee rows ── */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "clamp(1rem, 2.5vh, 1.5rem)" }}>
        <MarqueeRow items={ROW_A} dir={1}  dur={55} />
        <MarqueeRow items={ROW_B} dir={-1} dur={48} />
        <MarqueeRow items={ROW_A} dir={1}  dur={62} />
      </div>

      {/* ── Corner HUD brackets ── */}
      {(["tl","tr","bl","br"] as const).map((pos) => (
        <span key={pos} aria-hidden="true" style={{
          position: "absolute",
          width: 14, height: 14,
          top:    pos.includes("t") ? "clamp(2rem, 5vh, 3.5rem)" : "auto",
          bottom: pos.includes("b") ? "clamp(2rem, 5vh, 3.5rem)" : "auto",
          left:   pos.includes("l") ? "clamp(1.5rem, 4vw, 3rem)" : "auto",
          right:  pos.includes("r") ? "clamp(1.5rem, 4vw, 3rem)" : "auto",
          borderTop:    pos.includes("t") ? "1px solid rgba(59,234,59,0.12)" : "none",
          borderBottom: pos.includes("b") ? "1px solid rgba(59,234,59,0.12)" : "none",
          borderLeft:   pos.includes("l") ? "1px solid rgba(59,234,59,0.12)" : "none",
          borderRight:  pos.includes("r") ? "1px solid rgba(59,234,59,0.12)" : "none",
        }} />
      ))}

      {/* ── Bottom coordinate readout ── */}
      <div style={{
        position: "absolute", bottom: "clamp(1.5rem, 4vh, 2.5rem)", right: "clamp(1.5rem, 4vw, 3rem)",
        fontFamily: "var(--font-mono)", fontSize: "0.48rem",
        letterSpacing: "0.12em", color: "rgba(59,234,59,0.15)", textAlign: "right",
        zIndex: 3,
      }}>
        SYS:REF 004 · FRACTAL.MX
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 8px #3BEA3B; opacity: 1; }
          50% { box-shadow: 0 0 16px #3BEA3B; opacity: 0.6; }
        }
      `}</style>
    </section>
  );
}
