"use client";

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useInView, animate } from "framer-motion";
import { CornerBrackets } from "@/components/hud";

const PROJECTS = [
  {
    id: "amazon",
    client: "Amazon Prime",
    category: "Producción Audiovisual",
    result: "+2.3M reproducciones",
    img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
    contrast: 1.2,
    accent: "#4FA3E8",
    accentRgb: "79,163,232",
  },
  {
    id: "cocacola",
    client: "Coca‑Cola",
    category: "Contenido de Marca",
    result: "Campaña Nacional 360°",
    img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80",
    contrast: 1.3,
    accent: "#E84040",
    accentRgb: "232,64,64",
  },
  {
    id: "mutek",
    client: "Mutek México",
    category: "Cobertura Audiovisual",
    result: "48h de contenido live",
    img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    contrast: 1.4,
    accent: "#8B5CF6",
    accentRgb: "139,92,246",
  },
  {
    id: "liverpool",
    client: "Liverpool",
    category: "Fotografía Publicitaria",
    result: "12 campañas anuales",
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
    contrast: 1.2,
    accent: "#3BEA3B",
    accentRgb: "59,234,59",
  },
] as const;

/* ── Portfolio Card ───────────────────────────────────────────────────────── */
function PortfolioCard({
  project,
  idx,
}: {
  project: (typeof PROJECTS)[number];
  idx: number;
}) {
  const [hovered, setHovered] = useState(false);
  const cardRef  = useRef<HTMLDivElement>(null);
  const inView   = useInView(cardRef, { once: true, margin: "-6%" });
  const [revealed, setRevealed] = useState(false);

  /* trigger clip-path reveal once in-view */
  useEffect(() => {
    if (inView && !revealed) {
      const timer = setTimeout(() => setRevealed(true), idx * 140);
      return () => clearTimeout(timer);
    }
  }, [inView, idx, revealed]);

  /* subtle continuous background drift on hover */
  const [drift, setDrift] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top)  / rect.height - 0.5;
    setDrift({ x: cx * -14, y: cy * -10 });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setDrift({ x: 0, y: 0 }); }}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden portfolio-card"
      style={{
        aspectRatio: "16/10",
        cursor: "crosshair",
        background: "#080808",
        /* clip-path reveal: bottom→top slice */
        clipPath: revealed
          ? "inset(0% 0% 0% 0%)"
          : "inset(0% 0% 100% 0%)",
        transition: "clip-path 0.75s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* scan line sweep (fires on reveal) */}
      {revealed && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0,
            height: "100%",
            background: `linear-gradient(to bottom, transparent 0%, rgba(${project.accentRgb},0.15) 50%, transparent 100%)`,
            animation: "card-scanline 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
            pointerEvents: "none",
            zIndex: 6,
          }}
        />
      )}

      {/* Photo background with parallax drift */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden",
        filter: `grayscale(${hovered ? 75 : 100}%) contrast(${project.contrast}) brightness(${hovered ? 1.0 : 0.85})`,
        transition: "filter 0.7s ease",
      }}>
        <div style={{
          position: "absolute", inset: "-8%",
          transform: `translate(${drift.x}px, ${drift.y}px) scale(${hovered ? 1.06 : 1.01})`,
          transition: hovered ? "transform 0.08s linear" : "transform 0.9s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <Image
            src={project.img}
            alt={project.client}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
            loading="lazy"
          />
        </div>
      </div>

      {/* Vignette overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%)",
      }} />

      {/* Accent glow on hover */}
      {hovered && (
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse 70% 60% at 50% 80%, rgba(${project.accentRgb},0.12) 0%, transparent 70%)`,
          transition: "opacity 0.4s",
          pointerEvents: "none",
        }} />
      )}

      {/* Inset border */}
      <div style={{
        position: "absolute", inset: 1,
        border: `1px solid rgba(${project.accentRgb},${hovered ? 0.5 : 0.1})`,
        transition: "border-color 0.4s",
        pointerEvents: "none",
      }} />

      {/* Corner brackets HUD */}
      <CornerBrackets size={20} color={project.accent} opacity={hovered ? 0.8 : 0.2} />

      {/* Index top-left */}
      <span style={{
        position: "absolute", top: 16, left: 20,
        fontFamily: "var(--font-mono)", fontSize: "0.6rem",
        letterSpacing: "0.12em",
        color: hovered ? project.accent : "rgba(59,234,59,0.25)",
        transition: "color 0.3s",
        zIndex: 5,
      }}>
        {`0${idx + 1}`}
      </span>

      {/* Bottom info */}
      <div style={{
        position: "absolute", inset: 0,
        padding: "1.5rem 1.5rem 1.25rem",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        transform: hovered ? "translateY(0)" : "translateY(20px)",
        opacity: hovered ? 1 : 0.5,
        transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s",
        zIndex: 5,
      }}>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: "0.55rem",
          letterSpacing: "0.22em", color: project.accent,
          marginBottom: 4, textTransform: "uppercase",
        }}>
          {project.category}
        </p>
        <h3 style={{
          fontFamily: "var(--font-headline)", fontWeight: 800,
          fontSize: "clamp(1rem,1.6vw,1.3rem)",
          color: "#F5F5F5", lineHeight: 1.1, marginBottom: 4,
        }}>
          {project.client}
        </h3>
        <p style={{
          fontFamily: "var(--font-mono)", fontSize: "0.5rem",
          color: "#888", letterSpacing: "0.18em", textTransform: "uppercase",
        }}>
          {project.result}
        </p>
      </div>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */
export function Portfolio() {
  const ref = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-8%" });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const sectionOpacity = useTransform(scrollYProgress, [0, 0.06, 0.94, 1], [0, 1, 1, 0]);

  return (
    <motion.section
      ref={ref}
      id="portafolio"
      style={{ opacity: sectionOpacity }}
      className="relative bg-[#080808] py-20 overflow-hidden"
    >
      <style>{`
        @keyframes card-scanline {
          0%   { transform: translateY(-100%); opacity: 1; }
          100% { transform: translateY(100%);  opacity: 0; }
        }
        @media (max-width: 640px) {
          .portfolio-card { aspect-ratio: 4/3 !important; }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,#1f1f1f 30%,#1f1f1f 70%,transparent)" }} />

      {/* Header */}
      <div ref={headerRef} className="px-6 md:px-10 mb-10 max-w-7xl mx-auto">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div
            style={{
              opacity: headerInView ? 1 : 0,
              transform: headerInView ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#3BEA3B] mb-3">
              // TRABAJO SELECCIONADO
            </p>
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-[#F5F5F5] leading-[0.95]">
              Proyectos <span className="text-[#333]">destacados.</span>
            </h2>
          </div>
          <div
            className="flex flex-col items-end gap-2"
            style={{
              opacity: headerInView ? 1 : 0,
              transform: headerInView ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.7s 0.15s cubic-bezier(0.16,1,0.3,1), transform 0.7s 0.15s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <p className="font-mono text-[9px] text-[#333] uppercase tracking-widest">
              {PROJECTS.length.toString().padStart(2,"0")} / PROYECTOS
            </p>
            <a
              href="#contacto"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                letterSpacing: "0.16em",
                color: "rgba(59,234,59,0.45)",
                textDecoration: "none",
                borderBottom: "1px solid rgba(59,234,59,0.18)",
                paddingBottom: 2,
                transition: "color 200ms, border-color 200ms",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#3BEA3B";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,234,59,0.6)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(59,234,59,0.45)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,234,59,0.18)";
              }}
            >
              VER TODOS LOS PROYECTOS →
            </a>
          </div>
        </div>
        <div
          className="mt-6 h-px w-full"
          style={{
            background: "linear-gradient(90deg, #3BEA3B 0%, rgba(59,234,59,0.2) 40%, transparent 100%)",
            transformOrigin: "left center",
            transform: headerInView ? "scaleX(1)" : "scaleX(0)",
            transition: "transform 0.8s 0.2s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>

      {/* 2×2 grid */}
      <div className="px-6 md:px-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-px bg-[#111]">
        {PROJECTS.map((p, i) => (
          <PortfolioCard key={p.id} project={p} idx={i} />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,#1f1f1f 30%,#1f1f1f 70%,transparent)" }} />
    </motion.section>
  );
}
