"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { useAudio } from "@/context/AudioContext";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%><{}[]/\\";

/* Each block carries its own animation technique identifier */
const BLOCKS = [
  { text: "No hacemos contenido", color: "#F5F5F5", anim: "slide-left"   },
  { text: "por hacer.",           color: "#F5F5F5", anim: "clip-bottom"  },
  { text: "",                     color: "",        anim: "spacer"       },
  { text: "Cada proyecto tiene",  color: "#888888", anim: "blur-fade"    },
  { text: "un propósito.",        color: "#888888", anim: "scale-up"     },
  { text: "",                     color: "",        anim: "spacer"       },
  { text: "Llevamos",             color: "#F5F5F5", anim: "clip-bottom"  },
  { text: "construyendo marcas",  color: "#3BEA3B", anim: "glow-sweep", glow: true },
  { text: "que se recuerdan.",    color: "#3BEA3B", anim: "decode",      glow: true },
  { text: "",                     color: "",        anim: "spacer"       },
  { text: "Porque el mundo tiene",color: "#444444", anim: "step-fade"   },
  { text: "demasiado ruido.",     color: "#444444", anim: "glitch-in"   },
] as const;

/* ── Decode hook ── */
function useDecodeText(text: string, active: boolean) {
  const [display, setDisplay] = useState(() => text.replace(/[A-Za-z0-9]/g, "_"));

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      frame++;
      setDisplay(
        text.split("").map((ch, i) => {
          if (!/[A-Za-z0-9]/.test(ch)) return ch;
          if (frame >= i * 2 + 4) return ch;
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join("")
      );
      const done = text.split("").every((ch, i) =>
        !/[A-Za-z0-9]/.test(ch) || frame >= i * 2 + 4
      );
      if (!done) t = setTimeout(tick, 36);
    };
    t = setTimeout(tick, 0);
    return () => clearTimeout(t);
  }, [active, text]);

  return display;
}

function DecodeBlock({ text, color }: { text: string; color: string }) {
  const ref    = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setActive(true); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const display = useDecodeText(text, active);

  return (
    <div ref={ref} className="overflow-hidden">
      <p
        className="font-headline font-bold leading-[1.08] tracking-tight manifesto-glitch"
        style={{
          fontSize: "clamp(2.2rem, 5.2vw, 5rem)",
          color,
          textShadow: "0 0 50px rgba(59,234,59,0.5)",
          display: "block",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.02em",
        }}
      >
        {display}
      </p>
    </div>
  );
}

export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const { play }   = useAudio();
  const linesRef   = useRef<HTMLDivElement>(null);
  const sevenRef   = useRef<HTMLSpanElement>(null);

  /* one-time reveal sound */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      play("manifesto");
      obs.disconnect();
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [play]);

  useEffect(() => {
    const section = sectionRef.current!;
    const ctx = gsap.context(() => {

      /* ── "slide-left" blocks ── */
      section.querySelectorAll<HTMLElement>("[data-anim='slide-left'] .reveal-line").forEach(el => {
        gsap.fromTo(el,
          { x: -70, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" } }
        );
      });

      /* ── "clip-bottom" blocks ── */
      section.querySelectorAll<HTMLElement>("[data-anim='clip-bottom'] .reveal-line").forEach(el => {
        gsap.fromTo(el,
          { y: "105%", opacity: 0 },
          { y: 0, opacity: 1, duration: 0.75, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" } }
        );
      });

      /* ── "blur-fade" blocks ── */
      section.querySelectorAll<HTMLElement>("[data-anim='blur-fade'] .reveal-line").forEach(el => {
        gsap.fromTo(el,
          { opacity: 0, filter: "blur(18px)" },
          { opacity: 1, filter: "blur(0px)", duration: 1.0, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" } }
        );
      });

      /* ── "scale-up" blocks ── */
      section.querySelectorAll<HTMLElement>("[data-anim='scale-up'] .reveal-line").forEach(el => {
        gsap.fromTo(el,
          { opacity: 0, scale: 0.75, transformOrigin: "left center" },
          { opacity: 1, scale: 1, duration: 0.85, ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" } }
        );
      });

      /* ── "glow-sweep" blocks ── */
      section.querySelectorAll<HTMLElement>("[data-anim='glow-sweep'] .reveal-line").forEach(el => {
        gsap.fromTo(el,
          { opacity: 0, x: -40, textShadow: "0 0 0px rgba(59,234,59,0)" },
          { opacity: 1, x: 0,
            textShadow: "0 0 50px rgba(59,234,59,0.5), 0 0 100px rgba(59,234,59,0.2)",
            duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" } }
        );
      });

      /* ── "step-fade" blocks — opacity in discrete steps ── */
      section.querySelectorAll<HTMLElement>("[data-anim='step-fade'] .reveal-line").forEach(el => {
        gsap.fromTo(el,
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: "steps(4)",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" } }
        );
      });

      /* ── "glitch-in" blocks ── */
      section.querySelectorAll<HTMLElement>("[data-anim='glitch-in'] .reveal-line").forEach(el => {
        const tl = gsap.timeline({
          paused: true,
          scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse", onEnter: () => tl.play() },
        });
        tl.fromTo(el,
          { opacity: 0 },
          { opacity: 1, duration: 0.05 }
        )
        .to(el, { x: 6, duration: 0.04, ease: "none" })
        .to(el, { x: -8, duration: 0.04, ease: "none" })
        .to(el, { x: 4, duration: 0.04, ease: "none" })
        .to(el, { x: 0, duration: 0.06, ease: "none" });
      });

      /* ── big "7" scale-in ── */
      if (sevenRef.current) {
        gsap.fromTo(sevenRef.current,
          { scale: 0.4, opacity: 0, rotate: -8 },
          { scale: 1, opacity: 1, rotate: 0, duration: 1.1, ease: "expo.out",
            scrollTrigger: { trigger: sevenRef.current, start: "top 85%", toggleActions: "play none none reverse" } }
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="manifesto"
      className="relative bg-[#080808] py-36 px-5 md:px-10 overflow-hidden"
    >
      <style>{`
        .manifesto-glitch {
          position: relative;
          display: inline-block;
        }
        .manifesto-glitch:hover {
          animation: manifesto-glitch-anim 0.35s steps(2) forwards;
        }
        @keyframes manifesto-glitch-anim {
          0%   { text-shadow: 2px 0 #3BEA3B, -2px 0 #E84040; clip-path: inset(20% 0 60% 0); }
          25%  { text-shadow: -2px 0 #3BEA3B, 2px 0 #E84040; clip-path: inset(60% 0 10% 0); }
          50%  { text-shadow: 1px 0 #3BEA3B, -1px 0 rgba(59,234,59,0.3); clip-path: inset(40% 0 40% 0); }
          75%  { text-shadow: 3px 0 rgba(59,234,59,0.2), -3px 0 #3BEA3B; clip-path: inset(10% 0 80% 0); }
          100% { text-shadow: none; clip-path: none; }
        }
        @keyframes manifesto-scan-h {
          0%   { transform: translateY(-100%); opacity: 0.15; }
          100% { transform: translateY(200%);  opacity: 0; }
        }
        @keyframes manifesto-drift {
          0%, 100% { transform: translateX(0px); }
          50%       { transform: translateX(-6px); }
        }
      `}</style>

      {/* Horizontal scan line — decorative */}
      <div
        aria-hidden
        style={{
          position: "absolute", left: 0, right: 0, top: 0,
          height: "3px",
          background: "linear-gradient(90deg, transparent, rgba(59,234,59,0.25) 40%, rgba(59,234,59,0.4) 60%, transparent)",
          animation: "manifesto-scan-h 6s ease-in-out 1.5s infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,#1f1f1f 30%,#1f1f1f 70%,transparent)" }} />

      {/* HUD targeting decoration */}
      <div className="pointer-events-none absolute left-8 top-1/2 -translate-y-1/2 hidden xl:block">
        <GridTarget />
      </div>

      {/* right side coord readout */}
      <div className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-2 items-end opacity-20">
        <span className="font-mono text-[9px] text-[#3BEA3B] uppercase tracking-widest">LAT 19.4326° N</span>
        <span className="font-mono text-[9px] text-[#3BEA3B] uppercase tracking-widest">LON 99.1332° W</span>
        <span className="font-mono text-[9px] text-[#3BEA3B] uppercase tracking-widest">CDMX · MX</span>
        <div className="w-16 h-px bg-[#3BEA3B] opacity-50 mt-2" />
        <span className="font-mono text-[9px] text-[#3BEA3B] uppercase tracking-widest">FRACTAL MX</span>
        <span className="font-mono text-[9px] text-[#3BEA3B] uppercase tracking-widest">EST. 2017</span>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#3BEA3B] mb-16">
          // MANIFIESTO
        </p>

        <div ref={linesRef}>
          {BLOCKS.map((block, i) => {
            if (block.anim === "spacer") return <div key={i} className="h-6 md:h-10" />;

            /* "que se recuerdan." uses the decode hook */
            if (block.anim === "decode") {
              return <DecodeBlock key={i} text={block.text} color={block.color} />;
            }

            const isLlevamos = block.text === "Llevamos";

            return (
              <div key={i} data-anim={block.anim} className="overflow-hidden">
                <p
                  className={`reveal-line font-headline font-bold leading-[1.08] tracking-tight${block.anim === "glow-sweep" || "glow" in block ? " manifesto-glitch" : ""}`}
                  style={{
                    fontSize: "clamp(2.2rem, 5.2vw, 5rem)",
                    color: block.color,
                    textShadow: "glow" in block && block.glow
                      ? "0 0 50px rgba(59,234,59,0.4)"
                      : undefined,
                    display: "block",
                  }}
                >
                  {isLlevamos ? (
                    <>
                      Llevamos{" "}
                      <span
                        ref={sevenRef}
                        className="inline-block font-bold text-[#3BEA3B]"
                        style={{
                          fontSize: "clamp(4rem, 9vw, 9rem)",
                          lineHeight: 0.85,
                          verticalAlign: "middle",
                          textShadow: "0 0 60px rgba(59,234,59,0.7), 0 0 120px rgba(59,234,59,0.25)",
                          animation: "manifesto-drift 4s ease-in-out infinite",
                        }}
                      >
                        7
                      </span>{" "}
                      años
                    </>
                  ) : block.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,#1f1f1f 30%,#1f1f1f 70%,transparent)" }} />
    </section>
  );
}

function GridTarget() {
  return (
    <div className="relative w-[160px] h-[160px] opacity-20">
      <div
        className="absolute inset-0 rounded-full border border-[#3BEA3B]/30"
        style={{ animation: "pulse-ring 2s ease-in-out infinite" }}
      />
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 20} y1={0} x2={i * 20} y2={160}
            stroke="#3BEA3B" strokeWidth="0.4" strokeOpacity="0.5" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 20} x2={160} y2={i * 20}
            stroke="#3BEA3B" strokeWidth="0.4" strokeOpacity="0.5" />
        ))}
        <line x1="71" y1="80" x2="89" y2="80" stroke="#3BEA3B" strokeWidth="1.2" />
        <line x1="80" y1="71" x2="80" y2="89" stroke="#3BEA3B" strokeWidth="1.2" />
        <rect x="1" y="1" width="158" height="158" stroke="#3BEA3B" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
