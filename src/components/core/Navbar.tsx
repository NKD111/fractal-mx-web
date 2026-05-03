"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useAudio } from "@/context/AudioContext";

const NAV_ITEMS = [
  { id: "services",   label: "SERVICIOS",  num: "01" },
  { id: "clientes",   label: "CLIENTES",   num: "02" },
  { id: "manifesto",  label: "MANIFESTO",  num: "03" },
  { id: "portafolio", label: "PORTAFOLIO", num: "04" },
  { id: "contacto",   label: "CONTACTO",   num: "05" },
];

export function Navbar() {
  const { play } = useAudio();
  const [scrolled, setScrolled]   = useState(false);
  const [active,   setActive]     = useState<string>("");
  const [menuOpen, setMenuOpen]   = useState(false);
  const btnRef   = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const rafRef   = useRef(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section active tracking
  useEffect(() => {
    const sections = NAV_ITEMS.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Magnetic CTA — lerp loop
  const onBtnMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    targetRef.current = {
      x: (e.clientX - rect.left - rect.width  / 2) * 0.35,
      y: (e.clientY - rect.top  - rect.height / 2) * 0.35,
    };
  }, []);

  const onBtnEnter = useCallback(() => {
    const tick = () => {
      const c = currentRef.current;
      const t = targetRef.current;
      c.x += (t.x - c.x) * 0.12;
      c.y += (t.y - c.y) * 0.12;
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const onBtnLeave = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    targetRef.current = { x: 0, y: 0 };
    const snap = () => {
      const c = currentRef.current;
      c.x += (0 - c.x) * 0.18;
      c.y += (0 - c.y) * 0.18;
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${c.x.toFixed(2)}px,${c.y.toFixed(2)}px)`;
      }
      if (Math.abs(c.x) > 0.05 || Math.abs(c.y) > 0.05) {
        rafRef.current = requestAnimationFrame(snap);
      }
    };
    rafRef.current = requestAnimationFrame(snap);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <nav
        aria-label="Navegación principal"
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 1000,
          height: "var(--nav-h, 72px)",
          display: "flex",
          alignItems: "center",
          padding: "0 clamp(1.5rem, 5vw, 4rem)",
          transition: "background 500ms ease, border-color 500ms ease",
          background: scrolled ? "rgba(8,8,8,0.88)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
          borderBottom: `1px solid ${scrolled ? "rgba(59,234,59,0.08)" : "transparent"}`,
        }}
      >
        {/* ── Logo ── */}
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}
          aria-label="Fractal MX — Inicio"
        >
          <img
            src="/logo_fractal_verde.png"
            alt="Fractal MX"
            style={{ height: 32, width: 'auto', flexShrink: 0, display: 'block' }}
          />
          <span
            style={{
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: "clamp(0.78rem,1.2vw,0.9rem)",
              letterSpacing: "0.18em",
              color: "#F5F5F5",
              whiteSpace: "nowrap",
            }}
          >
            FRACTAL MX
          </span>
        </Link>

        {/* ── Nav items — desktop ── */}
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "clamp(1.5rem,3vw,3rem)", marginLeft: "auto", marginRight: "2rem" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  textDecoration: "none",
                  color: isActive ? "#3BEA3B" : "rgba(245,245,245,0.5)",
                  transition: "color 250ms ease",
                  fontSize: "0.68rem",
                  letterSpacing: "0.13em",
                  fontFamily: "var(--font-mono)",
                  whiteSpace: "nowrap",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  play('hover');
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(245,245,245,0.85)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(245,245,245,0.5)";
                }}
                onClick={() => play('click')}
              >
                <span style={{ opacity: 0.35, fontSize: "0.58rem", fontVariantNumeric: "tabular-nums" }}>
                  {item.num}
                </span>
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    style={{
                      display: "inline-block",
                      width: 4, height: 4,
                      borderRadius: "50%",
                      background: "#3BEA3B",
                      boxShadow: "0 0 8px #3BEA3B",
                      flexShrink: 0,
                    }}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* ── CTA — desktop ── */}
        <a
          ref={btnRef}
          href="#contacto"
          onMouseMove={onBtnMove}
          className="nav-cta"
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.55rem 1.5rem",
            background: "transparent",
            border: "1px solid rgba(59,234,59,0.45)",
            color: "#3BEA3B",
            fontFamily: "var(--font-mono)",
            fontSize: "0.63rem",
            letterSpacing: "0.14em",
            textDecoration: "none",
            whiteSpace: "nowrap",
            overflow: "hidden",
            transition: "background 250ms, border-color 250ms",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            play('hover');
            onBtnEnter();
            const el = e.currentTarget;
            el.style.background = "rgba(59,234,59,0.07)";
            el.style.borderColor = "rgba(59,234,59,0.85)";
            el.style.boxShadow = "0 0 16px rgba(59,234,59,0.15)";
          }}
          onClick={() => play('click')}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            onBtnLeave();
            const el = e.currentTarget;
            el.style.background = "transparent";
            el.style.borderColor = "rgba(59,234,59,0.45)";
            el.style.boxShadow = "none";
          }}
        >
          <span
            ref={innerRef}
            style={{ display: "block", transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)" }}
          >
            INICIAR PROYECTO
          </span>
          {/* corner brackets */}
          <span aria-hidden="true" style={{ position:"absolute",top:3,left:3,width:5,height:5,borderTop:"1px solid #3BEA3B",borderLeft:"1px solid #3BEA3B",opacity:0.6 }} />
          <span aria-hidden="true" style={{ position:"absolute",top:3,right:3,width:5,height:5,borderTop:"1px solid #3BEA3B",borderRight:"1px solid #3BEA3B",opacity:0.6 }} />
          <span aria-hidden="true" style={{ position:"absolute",bottom:3,left:3,width:5,height:5,borderBottom:"1px solid #3BEA3B",borderLeft:"1px solid #3BEA3B",opacity:0.6 }} />
          <span aria-hidden="true" style={{ position:"absolute",bottom:3,right:3,width:5,height:5,borderBottom:"1px solid #3BEA3B",borderRight:"1px solid #3BEA3B",opacity:0.6 }} />
        </a>

        {/* ── Hamburger — mobile ── */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          className="nav-hamburger"
          style={{
            display: "none",
            background: "none",
            border: "none",
            padding: 8,
            marginLeft: "auto",
            cursor: "none",
            flexDirection: "column",
            justifyContent: "center",
            gap: 5,
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: menuOpen && i === 1 ? 0 : menuOpen ? 20 : i === 1 ? 14 : 20,
                height: 1,
                background: "#3BEA3B",
                transition: "all 0.3s ease",
                transformOrigin: "center",
                transform:
                  menuOpen && i === 0 ? "rotate(45deg) translate(4px,4px)"
                  : menuOpen && i === 2 ? "rotate(-45deg) translate(4px,-4px)"
                  : "none",
              }}
            />
          ))}
        </button>
      </nav>

      {/* ── Mobile overlay ── */}
      <div
        aria-hidden={!menuOpen}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          background: "rgba(8,8,8,0.97)",
          backdropFilter: "blur(24px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2.5rem",
          transition: "opacity 400ms ease, visibility 400ms ease",
          opacity: menuOpen ? 1 : 0,
          visibility: menuOpen ? "visible" : "hidden",
          pointerEvents: menuOpen ? "auto" : "none",
        }}
      >
        {/* HUD corner decoration */}
        {["tl","tr","bl","br"].map((pos) => (
          <span
            key={pos}
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 20, height: 20,
              top: pos.includes("t") ? 24 : "auto",
              bottom: pos.includes("b") ? 24 : "auto",
              left:  pos.includes("l") ? 24 : "auto",
              right: pos.includes("r") ? 24 : "auto",
              borderTop:    pos.includes("t") ? "1px solid rgba(59,234,59,0.3)" : "none",
              borderBottom: pos.includes("b") ? "1px solid rgba(59,234,59,0.3)" : "none",
              borderLeft:   pos.includes("l") ? "1px solid rgba(59,234,59,0.3)" : "none",
              borderRight:  pos.includes("r") ? "1px solid rgba(59,234,59,0.3)" : "none",
            }}
          />
        ))}

        {NAV_ITEMS.map((item, idx) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={() => setMenuOpen(false)}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 16,
              textDecoration: "none",
              color: active === item.id ? "#3BEA3B" : "#F5F5F5",
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: "clamp(1.8rem,7vw,3rem)",
              letterSpacing: "-0.02em",
              transition: "color 200ms, transform 200ms",
              transform: menuOpen ? "translateX(0)" : "translateX(-20px)",
              transitionDelay: `${idx * 60}ms`,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                opacity: 0.4,
                color: "#3BEA3B",
              }}
            >
              {item.num}
            </span>
            {item.label}
          </a>
        ))}

        <a
          href="#contacto"
          onClick={() => setMenuOpen(false)}
          style={{
            marginTop: "1rem",
            padding: "0.8rem 2.4rem",
            border: "1px solid rgba(59,234,59,0.5)",
            color: "#3BEA3B",
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            letterSpacing: "0.14em",
            textDecoration: "none",
          }}
        >
          INICIAR PROYECTO
        </a>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links, .nav-cta { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
