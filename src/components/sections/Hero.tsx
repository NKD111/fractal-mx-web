"use client";

import { useEffect, useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import MilitaryRadar from "@/components/hero/MilitaryRadar";
import { gsap } from "@/lib/gsap-config";
const WA_LINK = "https://wa.me/525562123864";

const STATS = [
  { value: "45+",  label: "CLIENTES" },
  { value: "7",    label: "AÑOS" },
  { value: "CDMX", label: "MÉXICO" },
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoRef    = useRef<HTMLDivElement>(null);
  /* ── Scroll parallax ── */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const logoOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const logoY       = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const textY       = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);

  /* ── GSAP stagger entrance ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = contentRef.current?.querySelectorAll("[data-reveal]");
      if (!items?.length) return;

      gsap.fromTo(
        items,
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "fractalOut",
          stagger: 0.1,
          delay: 0.3,
          clearProps: "transform,opacity",
        }
      );

      gsap.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, duration: 1.2, ease: "fractalOut", delay: 0.5 }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        position: "relative",
        minHeight: "100dvh",
        display: "grid",
        gridTemplateColumns: "55fr 45fr",
        alignItems: "center",
        overflow: "hidden",
        background: "#080808",
        paddingTop: "var(--nav-h, 72px)",
      }}
    >
      {/* ── Ambient grid lines (vertical only on right panel) ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(59,234,59,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,234,59,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          pointerEvents: "none",
        }}
      />

      {/* ── Left: content 55% ── */}
      <motion.div
        ref={contentRef}
        style={{ y: textY, padding: "clamp(2rem, 6vw, 6rem)", paddingRight: "clamp(1rem, 4vw, 4rem)", position: "relative", zIndex: 1 }}
      >

        {/* Badge */}
        <div data-reveal style={{ marginBottom: "2rem", display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "0.3rem 0.9rem",
            border: "1px solid rgba(59,234,59,0.25)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.16em",
            color: "rgba(59,234,59,0.75)",
          }}>
            <span style={{
              display: "inline-block",
              width: 5, height: 5,
              borderRadius: "50%",
              background: "#3BEA3B",
              boxShadow: "0 0 6px #3BEA3B",
              animation: "pulse-dot 2s ease-in-out infinite",
            }} />
            ONLINE · CDMX · 2025
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.58rem",
            color: "rgba(245,245,245,0.2)",
            letterSpacing: "0.08em",
          }}>
            SYS.ACTIVO
          </span>
        </div>

        {/* HUD label */}
        <div data-reveal style={{
          marginBottom: "1rem",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <span style={{ display: "block", width: 32, height: 1, background: "rgba(59,234,59,0.4)" }} />
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            color: "rgba(59,234,59,0.5)",
          }}>
            // AGENCIA CREATIVA
          </span>
        </div>

        {/* Headline */}
        <h1
          data-reveal
          style={{
            fontFamily: "var(--font-headline)",
            fontWeight: 800,
            fontSize: "clamp(3.2rem, 7vw, 6rem)",
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
            color: "#F5F5F5",
            margin: "0 0 1.5rem",
          }}
        >
          <span style={{ display: "block" }}>VIVIMOS</span>
          <span style={{ display: "block" }}>PARA</span>
          <span
            data-text="CREAR."
            className="glitch"
            style={{
              display: "block",
              color: "#3BEA3B",
              textShadow: "0 0 60px rgba(59,234,59,0.35)",
            }}
          >
            CREAR.
          </span>
        </h1>

        {/* Sub copy */}
        <p
          data-reveal
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(0.95rem,1.4vw,1.1rem)",
            lineHeight: 1.7,
            color: "#888888",
            maxWidth: 440,
            marginBottom: "2.5rem",
          }}
        >
          Agencia creativa en CDMX especializada en contenido audiovisual
          y estrategia digital potenciada con inteligencia artificial.
        </p>

        {/* CTAs */}
        <div data-reveal style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: "4rem" }}>
          <a
            href="#services"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "0.8rem 2rem",
              background: "#3BEA3B",
              color: "#080808",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textDecoration: "none",
              transition: "opacity 200ms",
              position: "relative",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            VER NUESTRO TRABAJO
            <span aria-hidden>↓</span>
          </a>

          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "0.8rem 2rem",
              background: "transparent",
              border: "1px solid rgba(59,234,59,0.4)",
              color: "#3BEA3B",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textDecoration: "none",
              transition: "background 200ms, border-color 200ms",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "rgba(59,234,59,0.07)";
              el.style.borderColor = "rgba(59,234,59,0.8)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "transparent";
              el.style.borderColor = "rgba(59,234,59,0.4)";
            }}
          >
            HABLEMOS
            <span aria-hidden>→</span>
          </a>
        </div>

        {/* Stats bar */}
        <div
          data-reveal
          style={{
            display: "flex",
            alignItems: "stretch",
            borderTop: "1px solid rgba(59,234,59,0.1)",
            paddingTop: "1.5rem",
            gap: 0,
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                paddingRight: i < STATS.length - 1 ? "2rem" : 0,
                marginRight: i < STATS.length - 1 ? "2rem" : 0,
                borderRight: i < STATS.length - 1 ? "1px solid rgba(59,234,59,0.08)" : "none",
              }}
            >
              <span style={{
                display: "block",
                fontFamily: "var(--font-headline)",
                fontWeight: 800,
                fontSize: "clamp(1.8rem,3vw,2.4rem)",
                color: "#F5F5F5",
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}>
                {s.value}
              </span>
              <span style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.18em",
                color: "#888888",
                marginTop: 4,
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Right: visual 45% ── */}
      <div id="hero-radar-panel" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>

        {/* vertical accent line */}
        <div style={{
          position: "absolute",
          left: 0,
          top: "15%",
          bottom: "15%",
          width: 1,
          background: "linear-gradient(to bottom, transparent, rgba(59,234,59,0.2) 30%, rgba(59,234,59,0.2) 70%, transparent)",
        }} />

        {/* Liquid Metal — desktop */}
        <motion.div
          id="hero-radar-canvas"
          ref={logoRef}
          style={{ opacity: logoOpacity, y: logoY }}
        >
          <div style={{
            position: 'relative',
            width: '500px',
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MilitaryRadar />
          </div>
        </motion.div>

        {/* Mobile visual — stats grid */}
        <div id="hero-mobile-visual" style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          padding: "0 0.5rem",
        }}>
          <div style={{ display: "flex", gap: 1 }}>
            {STATS.map((s) => (
              <div key={s.label} style={{
                flex: 1,
                padding: "1.2rem 1rem",
                background: "rgba(59,234,59,0.03)",
                border: "1px solid rgba(59,234,59,0.1)",
                textAlign: "center",
              }}>
                <span style={{ display: "block", fontFamily: "var(--font-headline)", fontWeight: 800, fontSize: "clamp(1.6rem,6vw,2.2rem)", color: "#F5F5F5", lineHeight: 1 }}>
                  {s.value}
                </span>
                <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.2em", color: "#3BEA3B", marginTop: 6 }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(59,234,59,0.2), transparent)" }} />
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.16em", color: "rgba(59,234,59,0.3)", textAlign: "center" }}>
            FRACTAL MX · CDMX · EST. 2017
          </p>
        </div>

        {/* HUD coordinate readout */}
        <div style={{
          position: "absolute",
          bottom: "clamp(2rem, 6vh, 4rem)",
          right: "clamp(1.5rem, 4vw, 3rem)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.58rem",
          letterSpacing: "0.1em",
          color: "rgba(59,234,59,0.3)",
          lineHeight: 1.8,
          textAlign: "right",
        }}>
          <div>19.4326° N</div>
          <div>99.1332° O</div>
          <div style={{ marginTop: 4, color: "rgba(59,234,59,0.15)" }}>ALT: 2240m</div>
        </div>

        {/* HUD top-right corner brackets */}
        {["tl","tr"].map((pos) => (
          <span
            key={pos}
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 16, height: 16,
              top: "clamp(1.5rem, 4vh, 3rem)",
              left: pos === "tl" ? "clamp(1rem, 3vw, 2rem)" : "auto",
              right: pos === "tr" ? "clamp(1rem, 3vw, 2rem)" : "auto",
              borderTop: "1px solid rgba(59,234,59,0.25)",
              borderLeft: pos === "tl" ? "1px solid rgba(59,234,59,0.25)" : "none",
              borderRight: pos === "tr" ? "1px solid rgba(59,234,59,0.25)" : "none",
            }}
          />
        ))}
      </div>

      {/* ── Scroll indicator ── */}
      <div style={{
        position: "absolute",
        bottom: "clamp(1.5rem, 4vh, 2.5rem)",
        left: "clamp(2rem, 6vw, 6rem)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        zIndex: 2,
      }}>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.55rem",
          letterSpacing: "0.16em",
          color: "rgba(245,245,245,0.25)",
          writingMode: "vertical-rl",
          textOrientation: "mixed",
          transform: "rotate(180deg)",
        }}>
          SCROLL ↓
        </span>
        <div style={{
          width: 1,
          height: 40,
          background: "linear-gradient(to bottom, rgba(59,234,59,0.4), transparent)",
          animation: "scroll-line 1.8s ease-in-out infinite",
        }} />
      </div>

      {/* bottom gradient fade */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0, right: 0,
          height: 160,
          background: "linear-gradient(to bottom, transparent, #080808)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 6px #3BEA3B; opacity: 1; transform: scale(1); }
          50% { box-shadow: 0 0 14px #3BEA3B; opacity: 0.7; transform: scale(1.4); }
        }
        @keyframes scroll-line {
          0% { transform: scaleY(0); transform-origin: top; opacity: 0; }
          30% { opacity: 1; }
          70% { transform: scaleY(1); transform-origin: top; opacity: 1; }
          100% { transform: scaleY(0); transform-origin: bottom; opacity: 0; }
        }

        /* Mobile: single column */
        @media (max-width: 768px) {
          #hero {
            grid-template-columns: 1fr !important;
            grid-template-rows: auto auto;
            min-height: auto !important;
            padding-bottom: 3rem;
          }
          #hero-radar-panel {
            display: flex !important;
            height: auto !important;
            padding: 2rem 1.5rem 1.5rem;
            justify-content: center;
          }
          #hero-radar-canvas { display: none !important; }
          #hero-mobile-visual { display: flex !important; }
        }
        @media (min-width: 769px) {
          #hero-mobile-visual { display: none !important; }
        }
      `}</style>
    </section>
  );
}
