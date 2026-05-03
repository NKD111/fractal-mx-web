"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const WORDS_A = [
  "PRODUCCIÓN AUDIOVISUAL",
  "IA GENERATIVA",
  "DISEÑO GRÁFICO",
  "BRANDING",
  "MOTION DESIGN",
  "DIRECCIÓN DE ARTE",
  "CONTENIDO PARA REDES",
  "IDENTIDAD VISUAL",
];

const WORDS_B = [
  "MIDJOURNEY",
  "STABLE DIFFUSION",
  "AFTER EFFECTS",
  "PREMIERE PRO",
  "FIGMA",
  "SORA",
  "GEMINI",
  "RUNWAY ML",
];

interface MarqueeRowProps {
  words: string[];
  direction?: "left" | "right";
  speed?: number;
  accent?: boolean;
}

function MarqueeRow({ words, direction = "left", speed = 40, accent = false }: MarqueeRowProps) {
  const repeated = [...words, ...words, ...words];

  return (
    <div className="flex overflow-hidden">
      <motion.div
        className="flex shrink-0 gap-0"
        animate={{
          x: direction === "left" ? [0, `-${100 / 3}%`] : [`-${100 / 3}%`, 0],
        }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {repeated.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="flex items-center gap-0 whitespace-nowrap"
          >
            <span
              className={`
                font-headline text-lg md:text-2xl font-bold tracking-tight uppercase px-6
                ${accent
                  ? "text-[#00FF94]"
                  : "text-[#1f1f1f] hover:text-[#F5F5F5] transition-colors duration-300 cursor-default"
                }
              `}
            >
              {word}
            </span>
            <span className={`text-xs ${accent ? "text-[#00cc76]" : "text-[#1f1f1f]"}`}>
              ●
            </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function Marquee() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const skewX = useTransform(scrollYProgress, [0, 1], ["-2deg", "2deg"]);

  return (
    <motion.div
      ref={ref}
      style={{ skewX }}
      className="py-6 border-y border-[#1f1f1f] bg-[#080808] overflow-hidden select-none"
    >
      <div className="flex flex-col gap-3">
        <MarqueeRow words={WORDS_A} direction="left" speed={60} />
        <MarqueeRow words={WORDS_B} direction="right" speed={50} accent />
      </div>
    </motion.div>
  );
}
