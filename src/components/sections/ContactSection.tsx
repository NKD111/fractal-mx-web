"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

/* ── EmailJS config ── */
const EMAILJS_SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  ?? "";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const EMAILJS_PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  ?? "";

const SERVICES = [
  "Producción Audiovisual",
  "Fotografía Comercial",
  "Motion Graphics & Animación",
  "Contenido para Redes Sociales",
  "Cobertura de Eventos",
  "Estrategia Digital",
  "Producción con IA",
  "Identidad de Marca",
  "Campañas 360°",
  "Dirección de Arte",
] as const;

const BUDGETS = [
  "Menos de $10k MXN",
  "$10k – $30k MXN",
  "$30k – $60k MXN",
  "Más de $60k MXN",
  "No lo sé aún",
] as const;

const CONTACT_INFO = [
  {
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    label: "proyectosfractalmx@gmail.com",
    href: "mailto:proyectosfractalmx@gmail.com",
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.8 19.8 0 0 1 1.62 3.44 2 2 0 0 1 3.59 1.25h3a2 2 0 0 1 2 1.72 12.8 12.8 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45 12.8 12.8 0 0 0 2.81.7 2 2 0 0 1 1.72 2.02z"/>
      </svg>
    ),
    label: "+52 55 6212 3864",
    href: "tel:+525562123864",
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: "CDMX, México",
    href: null,
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".5" fill="currentColor" stroke="none"/>
      </svg>
    ),
    label: "@fractal_mexico",
    href: "https://instagram.com/fractal_mexico",
  },
] as const;

const inputBase = "w-full bg-[#0d0d0d] border border-[#1f1f1f] text-[#F5F5F5] placeholder:text-[#333333] font-body text-sm px-4 py-3 outline-none transition-all duration-200 focus:border-[#3BEA3B] focus:shadow-[0_0_0_1px_rgba(59,234,59,0.2)] rounded-none";
const selectBase = cn(inputBase, "appearance-none cursor-pointer bg-[#0d0d0d]");

type FormState = "idle" | "sending" | "success" | "error";

/* ── Floating particle ── */
function Particle({ x, y, size, dur, delay }: { x: number; y: number; size: number; dur: number; delay: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: `${x}%`, top: `${y}%`,
        width: size, height: size,
        borderRadius: "50%",
        background: "rgba(59,234,59,0.6)",
        boxShadow: "0 0 4px rgba(59,234,59,0.4)",
        animation: `contact-float ${dur}s ${delay}s ease-in-out infinite alternate`,
        pointerEvents: "none",
      }}
    />
  );
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7)  % 100,
  size: 1 + (i % 3),
  dur:  3.5 + (i % 5) * 0.8,
  delay: (i * 0.4) % 3,
}));

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const formRef    = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<FormState>("idle");
  const [entered, setEntered] = useState(false);
  const [scanPos, setScanPos] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setEntered(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* slow downward scan */
  useEffect(() => {
    if (!entered) return;
    const id = setInterval(() => setScanPos(v => (v + 0.15) % 100), 50);
    return () => clearInterval(id);
  }, [entered]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    setState("sending");
    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, formRef.current, { publicKey: EMAILJS_PUBLIC_KEY });
      setState("success");
      formRef.current.reset();
    } catch {
      setState("error");
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#080808] py-32 px-5 md:px-8 overflow-hidden"
    >
      <style>{`
        @keyframes contact-float {
          from { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          to   { transform: translateY(-12px) translateX(4px); opacity: 0.8; }
        }
        @keyframes contact-bracket-pulse {
          0%, 100% { opacity: 0.15; } 50% { opacity: 0.35; }
        }
        @keyframes contact-data-scroll {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes contact-ring-pulse {
          0%, 100% { transform: scale(1);   opacity: 0.06; }
          50%      { transform: scale(1.04); opacity: 0.1;  }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1f1f1f] to-transparent" />

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
      </div>

      {/* Slow scan line */}
      {entered && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0"
          style={{
            top: `${scanPos}%`,
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(59,234,59,0.08) 30%, rgba(59,234,59,0.12) 50%, rgba(59,234,59,0.08) 70%, transparent)",
            zIndex: 1,
          }}
        />
      )}

      {/* Ambient ring decorations */}
      {[180, 280, 380].map((r, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute", top: "50%", left: "50%",
            width: r * 2, height: r * 2,
            borderRadius: "50%",
            border: `1px solid rgba(59,234,59,${0.04 - i * 0.01})`,
            transform: "translate(-50%,-50%)",
            animation: `contact-ring-pulse ${5 + i * 2}s ${i * 1.2}s ease-in-out infinite`,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}

      {/* Corner brackets */}
      {(["tl","tr","bl","br"] as const).map((pos) => (
        <span
          key={pos}
          aria-hidden
          style={{
            position: "absolute",
            width: 16, height: 16, zIndex: 2,
            top: pos.includes("t") ? 16 : "auto",
            bottom: pos.includes("b") ? 16 : "auto",
            left:  pos.includes("l") ? 16 : "auto",
            right: pos.includes("r") ? 16 : "auto",
            borderTop:    pos.includes("t") ? "1px solid rgba(59,234,59,0.18)" : "none",
            borderBottom: pos.includes("b") ? "1px solid rgba(59,234,59,0.18)" : "none",
            borderLeft:   pos.includes("l") ? "1px solid rgba(59,234,59,0.18)" : "none",
            borderRight:  pos.includes("r") ? "1px solid rgba(59,234,59,0.18)" : "none",
            animation: "contact-bracket-pulse 3s ease-in-out infinite",
          }}
        />
      ))}

      {/* Left data stream — very subtle */}
      <div
        aria-hidden
        style={{
          position: "absolute", left: 6, top: 0, bottom: 0,
          width: 60, overflow: "hidden",
          pointerEvents: "none", zIndex: 1, opacity: 0.06,
        }}
      >
        <div style={{ animation: "contact-data-scroll 14s linear infinite", fontFamily: "var(--font-mono)", fontSize: "0.4rem", color: "#3BEA3B", lineHeight: 1.9, letterSpacing: "0.02em" }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i}>{(i * 0x1F + 0xAB).toString(16).toUpperCase().padStart(4, "0")}</div>
          ))}
        </div>
      </div>

      {/* noise texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02] z-0"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "200px 200px" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-16 lg:gap-24">

        {/* ── Left column ── */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#3BEA3B] mb-6">
            Contacto
          </p>
          <h2 className="font-headline font-bold text-[#F5F5F5] leading-[0.95] tracking-tight text-4xl md:text-5xl mb-6">
            Hablemos de
            <br />
            <span className="text-[#888888]">tu proyecto.</span>
          </h2>
          <p className="font-body text-[#555555] text-base leading-relaxed mb-12 max-w-xs">
            Sin rodeos. Sin plantillas.<br />
            Solo ideas que funcionan.
          </p>

          <div className="flex flex-col gap-5">
            {CONTACT_INFO.map(({ icon, label, href }) =>
              href ? (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-3 text-[#444444] hover:text-[#3BEA3B] transition-colors duration-200 w-fit group"
                >
                  <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">{icon}</span>
                  <span className="font-body text-sm">{label}</span>
                </a>
              ) : (
                <div key={label} className="flex items-center gap-3 text-[#444444]">
                  <span className="shrink-0">{icon}</span>
                  <span className="font-body text-sm">{label}</span>
                </div>
              )
            )}
          </div>

          <div className="mt-10 pt-8 border-t border-[#1f1f1f]">
            <p className="font-mono text-xs text-[#333333] uppercase tracking-widest">
              Lunes a Viernes · 9am – 7pm
            </p>
          </div>
        </motion.div>

        {/* ── Right column — Form ── */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="wait">
            {state === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-6 border border-[#1f1f1f] p-12"
              >
                <div className="w-14 h-14 rounded-full border border-[#3BEA3B]/40 flex items-center justify-center" style={{ boxShadow: "0 0 24px rgba(59,234,59,0.2)" }}>
                  <svg width="24" height="24" fill="none" stroke="#3BEA3B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div>
                  <p className="font-headline font-bold text-[#F5F5F5] text-xl mb-2">
                    ¡Recibimos tu mensaje!
                  </p>
                  <p className="font-body text-[#888888] text-sm leading-relaxed">
                    Te contactamos en menos de 24 horas.
                  </p>
                </div>
                <button
                  onClick={() => setState("idle")}
                  className="font-mono text-xs text-[#333333] hover:text-[#3BEA3B] transition-colors uppercase tracking-widest mt-2"
                >
                  Enviar otro mensaje
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                ref={formRef}
                onSubmit={handleSubmit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-5"
              >
                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#444444]">
                      Nombre completo <span className="text-[#3BEA3B]">*</span>
                    </label>
                    <input name="from_name" type="text" required placeholder="Tu nombre" className={inputBase} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#444444]">
                      Empresa / Negocio
                    </label>
                    <input name="company" type="text" placeholder="Tu empresa" className={inputBase} />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#444444]">
                      Email <span className="text-[#3BEA3B]">*</span>
                    </label>
                    <input name="reply_to" type="email" required placeholder="tu@email.com" className={inputBase} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#444444]">
                      Teléfono
                    </label>
                    <input name="phone" type="tel" placeholder="+52 55..." className={inputBase} />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#444444]">
                      Servicio de interés
                    </label>
                    <div className="relative">
                      <select name="service" className={selectBase}>
                        <option value="">Selecciona un servicio</option>
                        {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#444444] text-xs">▾</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#444444]">
                      Presupuesto aproximado
                    </label>
                    <div className="relative">
                      <select name="budget" className={selectBase}>
                        <option value="">¿Cuánto tienes en mente?</option>
                        {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#444444] text-xs">▾</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-[#444444]">
                    Descripción del proyecto
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Cuéntanos qué necesitas..."
                    className={cn(inputBase, "resize-none")}
                  />
                </div>

                {/* Error */}
                {state === "error" && (
                  <p className="font-body text-sm text-red-400">
                    Algo salió mal.{" "}
                    <a href="mailto:proyectosfractalmx@gmail.com" className="underline hover:text-red-300">
                      Escríbenos directo.
                    </a>
                  </p>
                )}

                {/* Submit */}
                <div className="mt-2">
                  <ShimmerButton
                    shimmerColor="rgba(255,255,255,0.5)"
                    background="#3BEA3B"
                    borderRadius="0px"
                    disabled={state === "sending"}
                    className="w-full sm:w-auto px-10 py-4 font-headline font-bold text-black text-sm uppercase tracking-wider disabled:opacity-60"
                    type="submit"
                  >
                    {state === "sending" ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      <>Enviar mensaje <span aria-hidden className="ml-2">→</span></>
                    )}
                  </ShimmerButton>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
