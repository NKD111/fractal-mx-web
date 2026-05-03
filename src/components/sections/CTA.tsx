"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAudio } from "@/context/AudioContext";

const WA_LINK = "https://wa.me/525562123864";
const EMAIL   = "proyectosfractalmx@gmail.com";

/* ── Matrix Rain Canvas ──────────────────────────────────────────────────── */
const MATRIX_CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノ日月火水木金土" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" +
  "0123456789!@#$%^&*(){}[]<>/\\|";

function MatrixRain({ opacity }: { opacity: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const fontSize = 13;
    let cols: number[] = [];
    let drops: number[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      cols  = Array.from({ length: Math.floor(canvas.width / fontSize) }, (_, i) => i);
      drops = cols.map(() => Math.random() * -60);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function draw() {
      ctx.fillStyle = "rgba(8,8,8,0.055)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drops.forEach((y, i) => {
        /* vary brightness by column speed */
        const bright = 0.08 + (i % 7) * 0.025;
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];

        /* head glyph — bright green */
        ctx.fillStyle = `rgba(200,255,200,${bright * 2.5})`;
        ctx.font = `${fontSize}px monospace`;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);

        /* body glyph — normal green */
        const bodyChar = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        ctx.fillStyle = `rgba(59,234,59,${bright})`;
        ctx.fillText(bodyChar, i * fontSize, (drops[i] - 1) * fontSize);

        drops[i] += 0.35 + (i % 4) * 0.08;
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = -Math.floor(Math.random() * 20);
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

/* ── HUD Arc ─────────────────────────────────────────────────────────────── */
function HudArc({
  r, dash, gap, rot, speed, opacity, strokeW = 1,
}: {
  r: number; dash: number; gap: number; rot: number; speed: number; opacity: number; strokeW?: number;
}) {
  const size = r * 2 + 40;
  return (
    <svg
      aria-hidden
      style={{
        position: "absolute", top: "50%", left: "50%",
        transform: `translate(-50%,-50%)`,
        width: size, height: size,
        pointerEvents: "none",
        opacity,
        animation: `arc-spin-${speed > 0 ? "cw" : "ccw"} ${Math.abs(speed)}s linear infinite`,
      }}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="rgba(59,234,59,0.7)"
        strokeWidth={strokeW}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={rot}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Section ─────────────────────────────────────────────────────────────── */
export function CTA() {
  const ref      = useRef<HTMLElement>(null);
  const { play } = useAudio();
  const [entered, setEntered] = useState(false);
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      play("cta");
      setEntered(true);
      obs.disconnect();
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [play]);

  /* scan line ticker */
  useEffect(() => {
    if (!entered) return;
    const id = setInterval(() => setScanLine(v => (v + 1) % 100), 40);
    return () => clearInterval(id);
  }, [entered]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const matrixOpacity = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0, 0.18, 0.18, 0]);
  const glowOpacity   = useTransform(scrollYProgress, [0, 0.3, 1], [0, 1, 0.5]);

  return (
    <section
      ref={ref}
      id="contacto"
      className="relative bg-[#080808] overflow-hidden py-40 px-5 md:px-8"
    >
      <style>{`
        @keyframes arc-spin-cw  { from { transform: translate(-50%,-50%) rotate(0deg);   } to { transform: translate(-50%,-50%) rotate(360deg);  } }
        @keyframes arc-spin-ccw { from { transform: translate(-50%,-50%) rotate(0deg);   } to { transform: translate(-50%,-50%) rotate(-360deg); } }
        @keyframes cta-power-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(59,234,59,0.3), 0 0 60px rgba(59,234,59,0.1); }
          50%      { box-shadow: 0 0 35px rgba(59,234,59,0.5), 0 0 100px rgba(59,234,59,0.2); }
        }
        @keyframes cta-bracket-fade {
          0%, 100% { opacity: 0.12; } 50% { opacity: 0.28; }
        }
        @keyframes cta-data-scroll {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes cta-hud-blink {
          0%, 100% { opacity: 1; } 48%, 52% { opacity: 0; }
        }
        @keyframes cta-headline-char {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* top separator */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3BEA3B]/20 to-transparent" />

      {/* Matrix rain */}
      <motion.div style={{ opacity: matrixOpacity }} className="absolute inset-0 pointer-events-none">
        <MatrixRain opacity={1} />
      </motion.div>

      {/* Radial vignette over matrix so text is readable */}
      <div
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{ background: "radial-gradient(ellipse 80% 75% at 50% 50%, transparent 20%, rgba(8,8,8,0.92) 70%, #080808 100%)" }}
      />

      {/* Scan line */}
      {entered && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 z-[3]"
          style={{
            top: `${scanLine}%`,
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(59,234,59,0.12) 30%, rgba(59,234,59,0.18) 50%, rgba(59,234,59,0.12) 70%, transparent)",
            transition: "top 0.04s linear",
          }}
        />
      )}

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07] z-[1]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,234,59,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,234,59,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Central glow blob */}
      <motion.div
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center z-[1]"
      >
        <div style={{
          width: "clamp(400px, 55vw, 700px)",
          height: "clamp(400px, 55vw, 700px)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,234,59,0.07) 0%, transparent 65%)",
          animation: entered ? "cta-power-pulse 3s ease-in-out infinite" : "none",
        }} />
      </motion.div>

      {/* Rotating HUD arcs */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-[2]" aria-hidden>
        <HudArc r={220} dash={80}  gap={180} rot={0}  speed={22}  opacity={0.12} />
        <HudArc r={260} dash={40}  gap={80}  rot={0}  speed={-34} opacity={0.09} />
        <HudArc r={300} dash={120} gap={260} rot={30} speed={18}  opacity={0.07} strokeW={0.7} />
        <HudArc r={350} dash={20}  gap={60}  rot={0}  speed={-50} opacity={0.05} strokeW={0.5} />
      </div>

      {/* Corner HUD brackets */}
      {(["tl","tr","bl","br"] as const).map((pos) => (
        <span
          key={pos}
          aria-hidden
          style={{
            position: "absolute",
            width: 28, height: 28, zIndex: 4,
            top: pos.includes("t") ? 28 : "auto",
            bottom: pos.includes("b") ? 28 : "auto",
            left:  pos.includes("l") ? 28 : "auto",
            right: pos.includes("r") ? 28 : "auto",
            borderTop:    pos.includes("t") ? "1.5px solid rgba(59,234,59,0.35)" : "none",
            borderBottom: pos.includes("b") ? "1.5px solid rgba(59,234,59,0.35)" : "none",
            borderLeft:   pos.includes("l") ? "1.5px solid rgba(59,234,59,0.35)" : "none",
            borderRight:  pos.includes("r") ? "1.5px solid rgba(59,234,59,0.35)" : "none",
            animation: "cta-bracket-fade 2.5s ease-in-out infinite",
          }}
        />
      ))}

      {/* Left data stream */}
      <div
        aria-hidden
        style={{
          position: "absolute", left: 20, top: 0, bottom: 0,
          width: 80, overflow: "hidden",
          display: "flex", flexDirection: "column",
          pointerEvents: "none", zIndex: 2, opacity: 0.12,
        }}
      >
        <div style={{ animation: "cta-data-scroll 8s linear infinite", fontFamily: "var(--font-mono)", fontSize: "0.45rem", color: "#3BEA3B", lineHeight: 1.8, letterSpacing: "0.04em" }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i}>{Math.random().toString(16).slice(2, 10).toUpperCase()}</div>
          ))}
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={`b${i}`}>{Math.random().toString(16).slice(2, 10).toUpperCase()}</div>
          ))}
        </div>
      </div>

      {/* Right data stream */}
      <div
        aria-hidden
        style={{
          position: "absolute", right: 20, top: 0, bottom: 0,
          width: 80, overflow: "hidden",
          display: "flex", flexDirection: "column",
          pointerEvents: "none", zIndex: 2, opacity: 0.1,
        }}
      >
        <div style={{ animation: "cta-data-scroll 11s linear infinite reverse", fontFamily: "var(--font-mono)", fontSize: "0.45rem", color: "#3BEA3B", lineHeight: 1.8, letterSpacing: "0.04em", textAlign: "right" }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i}>{(i * 1337 + 42).toString(2).slice(-8).padStart(8, "0")}</div>
          ))}
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={`b${i}`}>{((i + 1) * 255).toString(16).toUpperCase().padStart(6, "0")}</div>
          ))}
        </div>
      </div>

      {/* Content */}
      <motion.div
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 mx-auto max-w-4xl flex flex-col items-center text-center"
      >
        {/* HUD eyebrow */}
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } }}
          className="mb-8 flex items-center gap-3"
        >
          <span style={{ display: "block", width: 32, height: 1, background: "rgba(59,234,59,0.3)" }} />
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#3BEA3B]" style={{ animation: entered ? "cta-hud-blink 3.5s ease-in-out infinite" : "none" }}>
            ¿Trabajamos juntos?
          </p>
          <span style={{ display: "block", width: 32, height: 1, background: "rgba(59,234,59,0.3)" }} />
        </motion.div>

        {/* Headline */}
        <motion.h2
          variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16,1,0.3,1] } } }}
          className="font-headline font-bold text-[#F5F5F5] leading-[0.93] tracking-tight text-[clamp(2.8rem,7vw,6rem)] mb-6"
        >
          ¿Listo para contenido
          <br />
          <span
            className="text-[#3BEA3B] relative"
            style={{
              textShadow: "0 0 60px rgba(59,234,59,0.5), 0 0 120px rgba(59,234,59,0.2)",
              display: "inline-block",
            }}
          >
            que vende solo?
          </span>
        </motion.h2>

        {/* Sub */}
        <motion.p
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
          className="font-body text-[#888888] text-base md:text-lg leading-relaxed max-w-lg mb-14"
        >
          Cuéntanos tu proyecto. Respondemos en menos de 24 horas y te decimos
          exactamente cómo podemos ayudarte.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16,1,0.3,1] } } }}
        >
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 px-10 py-5 font-headline font-bold text-black text-base uppercase tracking-wider bg-[#3BEA3B] hover:bg-[#52f552] active:scale-95 transition-all duration-200"
            style={{
              boxShadow: entered
                ? "0 0 28px rgba(59,234,59,0.45), 0 0 72px rgba(59,234,59,0.18)"
                : "0 0 18px rgba(59,234,59,0.3)",
              animation: entered ? "cta-power-pulse 2.5s ease-in-out 0.5s infinite" : "none",
            }}
          >
            <svg
              width="20" height="20" viewBox="0 0 24 24" fill="currentColor"
              className="shrink-0 transition-transform duration-200 group-hover:scale-110"
              aria-hidden
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.556 4.117 1.528 5.845L.057 23.667a.5.5 0 00.61.61l5.822-1.471A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.91 0-3.697-.504-5.238-1.384l-.376-.215-3.893.984.984-3.893-.215-.376A10 10 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Escríbenos por WhatsApp
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
        </motion.div>

        {/* Email */}
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, delay: 0.15 } } }}
          className="mt-10 flex items-center gap-6"
        >
          <span className="h-px w-12 bg-[#1f1f1f]" />
          <a
            href={`mailto:${EMAIL}`}
            className="font-body text-sm text-[#555555] hover:text-[#888888] transition-colors duration-200 tracking-wide"
          >
            {EMAIL}
          </a>
          <span className="h-px w-12 bg-[#1f1f1f]" />
        </motion.div>

        {/* Status row */}
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, delay: 0.3 } } }}
          className="mt-8 flex items-center gap-4"
        >
          <span style={{
            display: "block", width: 6, height: 6, borderRadius: "50%",
            background: "#3BEA3B", boxShadow: "0 0 8px #3BEA3B",
            animation: "cta-hud-blink 1.8s ease-in-out infinite",
          }} />
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#3BEA3B]/40">
            FRACTAL.MX · SISTEMA ACTIVO · LISTO PARA CONECTAR
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
