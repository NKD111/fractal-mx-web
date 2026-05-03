"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { useAudio } from "@/context/AudioContext";
import { ServiceVisual } from "@/components/sections/ServiceVisuals";

/* ─── Service data ────────────────────────────────────────────────── */
const SERVICES = [
  {
    num: "01",
    name: "Producción Audiovisual",
    tagline: "Video que mueve audiencias.",
    desc: "Desde el concepto hasta el corte final. Producimos contenido para marcas que necesitan conectar en redes, plataformas digitales y pantalla grande.",
    tags: ["Video", "Reels", "Documental", "Live Stream"],
  },
  {
    num: "02",
    name: "Estrategia de Contenido",
    tagline: "Dirección con propósito.",
    desc: "Diseñamos calendarios editoriales, narrativas de marca y estrategias de distribución que convierten atención en resultados medibles.",
    tags: ["Editorial", "Brand Voice", "Analytics", "Planning"],
  },
  {
    num: "03",
    name: "Diseño Gráfico & Branding",
    tagline: "Identidad que permanece.",
    desc: "Creamos sistemas visuales completos: logotipos, paletas, tipografías y guías de marca que escalan en todos los formatos.",
    tags: ["Logo", "Brand System", "UI/UX", "Print"],
  },
  {
    num: "04",
    name: "AI Content Creation",
    tagline: "Creatividad aumentada.",
    desc: "Integramos herramientas de IA generativa en flujos de producción real: copy, imágenes, video y audio a escala sin perder calidad.",
    tags: ["GenAI", "Automation", "Scale", "Midjourney"],
  },
  {
    num: "05",
    name: "Fotografía Comercial",
    tagline: "Imágenes que venden.",
    desc: "Sesiones de producto, retrato corporativo y lifestyle para e-commerce, campañas y redes sociales. Estudio propio en CDMX.",
    tags: ["Producto", "Lifestyle", "E-commerce", "Editorial"],
  },
  {
    num: "06",
    name: "Motion Graphics",
    tagline: "Movimiento con significado.",
    desc: "Animaciones 2D/3D para presentaciones, intros de marca, infografías animadas y contenido social que detiene el scroll.",
    tags: ["After Effects", "3D", "2D Anim", "Infografía"],
  },
  {
    num: "07",
    name: "Social Media Management",
    tagline: "Presencia constante.",
    desc: "Gestión integral de redes sociales: producción de contenido, community management, reportes y optimización mensual.",
    tags: ["Instagram", "TikTok", "LinkedIn", "X / Twitter"],
  },
  {
    num: "08",
    name: "Post-producción",
    tagline: "El detalle que hace la diferencia.",
    desc: "Color grading, mezcla de audio, efectos visuales y entrega en todos los formatos. Llevamos tu material al siguiente nivel.",
    tags: ["Color", "VFX", "Audio Mix", "DCP"],
  },
];

/* ─── Accent palette ─────────────────────────────────────────────── */
const ACCENTS = [
  { hex: "#3BEA3B", rgb: "59,234,59"   },
  { hex: "#4FA3E8", rgb: "79,163,232"  },
  { hex: "#8B5CF6", rgb: "139,92,246"  },
  { hex: "#F59E0B", rgb: "245,158,11"  },
  { hex: "#E84040", rgb: "232,64,64"   },
  { hex: "#06B6D4", rgb: "6,182,212"   },
  { hex: "#3BEA3B", rgb: "59,234,59"   },
  { hex: "#A855F7", rgb: "168,85,247"  },
];

/*
  Bento 4-column layout:
  Row 1 → [01: span2] [02: span1] [03: span1]
  Row 2 → [04: span1] [05: span2] [06: span1]
  Row 3 → [07: span2] [08: span2]
*/
const COL_SPANS = [2, 1, 1, 1, 2, 1, 2, 2];

/* ─── Card ───────────────────────────────────────────────────────── */
function BentoCard({
  service,
  idx,
}: {
  service: (typeof SERVICES)[number];
  idx: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hov, setHov] = useState(false);
  const colSpan = COL_SPANS[idx];
  const isLarge = colSpan === 2;
  const accent  = ACCENTS[idx];

  /* enter-view drive */
  const inView = useInView(cardRef, { once: true, margin: "-8%" });
  const sp     = useMotionValue(0);

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(sp, 1, {
      duration: 1.7,
      ease: [0.16, 1, 0.3, 1],
      delay: 0.25 + (idx % 4) * 0.08,
    });
    return ctrl.stop;
  }, [inView, sp, idx]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
        delay: (idx % 4) * 0.07,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={`bento-svc-card${isLarge ? " bento-svc-large" : ""}`}
      style={{
        gridColumn: `span ${colSpan}`,
        position: "relative",
        overflow: "hidden",
        minHeight: isLarge ? 340 : 300,
        background: hov
          ? `radial-gradient(ellipse 70% 60% at 60% 50%, rgba(${accent.rgb},0.04) 0%, #080808 70%)`
          : "#080808",
        border: `1px solid ${hov ? `rgba(${accent.rgb},0.38)` : "rgba(59,234,59,0.07)"}`,
        boxShadow: hov
          ? `0 0 50px rgba(${accent.rgb},0.07), inset 0 0 40px rgba(${accent.rgb},0.03)`
          : "none",
        transition: "border-color 380ms ease, box-shadow 380ms ease, background 380ms ease",
        cursor: "crosshair",
        display: "flex",
        flexDirection: isLarge ? "row" : "column",
      }}
    >
      {/* ── Ghost number — outline glow ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-0.1em",
          right: isLarge ? "auto" : "-0.03em",
          left: isLarge ? "44%" : "auto",
          fontFamily: "var(--font-headline)",
          fontWeight: 800,
          fontSize: isLarge
            ? "clamp(8rem, 18vw, 15rem)"
            : "clamp(6.5rem, 13vw, 10rem)",
          lineHeight: 0.8,
          letterSpacing: "-0.05em",
          color: "transparent",
          /* stroke transitions via React state — instant but glow animates */
          WebkitTextStroke: hov
            ? `1.5px rgba(${accent.rgb},0.55)`
            : "1px rgba(59,234,59,0.11)",
          textShadow: hov
            ? `0 0 28px rgba(${accent.rgb},0.5),
               0 0 60px rgba(${accent.rgb},0.22),
               0 0 110px rgba(${accent.rgb},0.08)`
            : "0 0 24px rgba(59,234,59,0.07)",
          transition: "text-shadow 0.5s ease",
          pointerEvents: "none",
          userSelect: "none",
          zIndex: 0,
        }}
      >
        {service.num}
      </div>

      {/* ── Content ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "clamp(1.4rem, 2.8vw, 2rem)",
          gap: 10,
          minWidth: 0,
        }}
      >
        {/* Row: num + status dot */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.57rem",
            letterSpacing: "0.2em",
            color: hov ? accent.hex : "rgba(59,234,59,0.4)",
            transition: "color 300ms",
          }}>
            {service.num} / {SERVICES.length.toString().padStart(2, "0")}
          </span>
          <span style={{
            display: "block",
            width: 5, height: 5,
            borderRadius: "50%",
            background: hov ? accent.hex : "rgba(59,234,59,0.2)",
            boxShadow: hov ? `0 0 8px ${accent.hex}` : "none",
            transition: "background 300ms, box-shadow 300ms",
            flexShrink: 0,
          }} />
        </div>

        {/* Name */}
        <h3 style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 800,
          fontSize: isLarge
            ? "clamp(1.25rem, 2.1vw, 1.85rem)"
            : "clamp(1rem, 1.6vw, 1.38rem)",
          lineHeight: 1.0,
          letterSpacing: "-0.025em",
          color: "#F5F5F5",
          margin: 0,
        }}>
          {service.name}
        </h3>

        {/* Tagline */}
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.62rem",
          letterSpacing: "0.06em",
          color: hov ? accent.hex : "rgba(59,234,59,0.45)",
          transition: "color 300ms",
          margin: 0,
        }}>
          {service.tagline}
        </p>

        {/* Separator */}
        <div style={{
          height: 1,
          background: `rgba(${accent.rgb},${hov ? 0.22 : 0.07})`,
          transition: "background 300ms",
          flexShrink: 0,
        }} />

        {/* Description — hover reveal */}
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "clamp(0.76rem, 0.95vw, 0.86rem)",
          lineHeight: 1.72,
          color: "rgba(245,245,245,0.5)",
          margin: 0,
          maxWidth: 380,
          opacity: hov ? 1 : 0,
          transform: hov ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 320ms ease, transform 320ms ease",
          flex: 1,
        }}>
          {service.desc}
        </p>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "auto" }}>
          {service.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "0.2rem 0.6rem",
                border: `1px solid ${hov ? `rgba(${accent.rgb},0.32)` : "rgba(59,234,59,0.12)"}`,
                fontFamily: "var(--font-mono)",
                fontSize: "0.5rem",
                letterSpacing: "0.12em",
                color: hov ? `rgba(${accent.rgb},0.75)` : "rgba(59,234,59,0.38)",
                transition: "border-color 300ms, color 300ms",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* ServiceVisual — small cards: flows below tags */}
        {!isLarge && (
          <div style={{
            height: 128,
            marginTop: 10,
            flexShrink: 0,
            opacity: hov ? 0.75 : 0.28,
            transition: "opacity 400ms ease",
          }}>
            <ServiceVisual idx={idx} sp={sp} />
          </div>
        )}

        {/* CTA subtle link */}
        <a
          href="#contacto"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-mono)",
            fontSize: "0.54rem",
            letterSpacing: "0.14em",
            color: hov ? accent.hex : "transparent",
            textDecoration: "none",
            borderBottom: `1px solid ${hov ? `rgba(${accent.rgb},0.4)` : "transparent"}`,
            paddingBottom: 1,
            transition: "color 300ms, border-color 300ms",
            width: "fit-content",
            marginTop: 2,
          }}
        >
          SOLICITAR →
        </a>
      </div>

      {/* ServiceVisual — large cards: dedicated right panel */}
      {isLarge && (
        <div
          className="bento-visual-panel"
          style={{
            position: "relative",
            zIndex: 0,
            width: "38%",
            flexShrink: 0,
            opacity: hov ? 0.8 : 0.22,
            transition: "opacity 400ms ease",
          }}
        >
          <ServiceVisual idx={idx} sp={sp} />
        </div>
      )}
    </motion.div>
  );
}

/* ─── Section ─────────────────────────────────────────────────────── */
export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const { play }   = useAudio();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        play("atmosphere");
        obs.disconnect();
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [play]);

  return (
    <section
      ref={sectionRef}
      id="services"
      style={{
        position: "relative",
        background: "#080808",
        paddingTop: "clamp(4rem, 10vh, 7rem)",
        paddingBottom: "clamp(4rem, 10vh, 7rem)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,#1f1f1f 30%,#1f1f1f 70%,transparent)" }}
      />

      {/* ── Header ── */}
      <div style={{
        padding: "0 clamp(1.5rem, 5vw, 5rem)",
        maxWidth: 1400,
        margin: "0 auto",
        marginBottom: "clamp(2.5rem, 5vh, 4rem)",
      }}>
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}>
          <div>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.3em",
              color: "#3BEA3B",
              marginBottom: "0.75rem",
              textTransform: "uppercase",
              margin: "0 0 0.75rem",
            }}>
              // SERVICIOS
            </p>
            <h2 style={{
              fontFamily: "var(--font-headline)",
              fontWeight: 800,
              fontSize: "clamp(2.2rem, 4vw, 3.5rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              color: "#F5F5F5",
              margin: 0,
            }}>
              Lo que{" "}
              <span style={{ color: "#444" }}>hacemos.</span>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.55rem",
              color: "#333",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              margin: 0,
            }}>
              003 / CAPACIDADES
            </p>
            <p style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.5rem",
              color: "rgba(59,234,59,0.25)",
              letterSpacing: "0.12em",
              margin: 0,
            }}>
              {SERVICES.length.toString().padStart(2,"0")} DISCIPLINAS ACTIVAS
            </p>
          </div>
        </div>
        <div style={{
          marginTop: "clamp(1rem, 3vh, 1.5rem)",
          height: 1,
          width: "100%",
          background: "linear-gradient(90deg, #3BEA3B 0%, rgba(59,234,59,0.2) 40%, transparent 100%)",
        }} />
      </div>

      {/* ── Bento Grid ── */}
      <div
        className="bento-svc-grid"
        style={{
          padding: "0 clamp(1.5rem, 5vw, 5rem)",
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          background: "#111111",
        }}
      >
        {SERVICES.map((service, idx) => (
          <BentoCard key={service.num} service={service} idx={idx} />
        ))}
      </div>

      {/* ── Responsive ── */}
      <style>{`
        @media (max-width: 900px) {
          .bento-svc-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .bento-svc-card { grid-column: span 1 !important; flex-direction: column !important; }
          .bento-svc-large { grid-column: span 2 !important; flex-direction: column !important; }
          .bento-visual-panel { width: 100% !important; min-height: 180px; }
        }
        @media (max-width: 540px) {
          .bento-svc-grid { grid-template-columns: 1fr !important; }
          .bento-svc-card,
          .bento-svc-large { grid-column: span 1 !important; flex-direction: column !important; }
          .bento-visual-panel { width: 100% !important; min-height: 140px; }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,#1f1f1f 30%,#1f1f1f 70%,transparent)" }}
      />
    </section>
  );
}
