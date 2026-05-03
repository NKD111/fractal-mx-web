"use client";
import { useEffect, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;':<>?/\\";

interface LetterGlitchProps {
  text: string;
  className?: string;
  speed?: number;
  trigger?: "mount" | "hover";
  glitchColor?: string;
}

export function LetterGlitch({
  text,
  className = "",
  speed = 40,
  trigger = "mount",
  glitchColor = "#3BEA3B",
}: LetterGlitchProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iterRef = useRef(0);

  const run = () => {
    const el = ref.current;
    if (!el) return;
    iterRef.current = 0;
    clearInterval(intervalRef.current!);
    intervalRef.current = setInterval(() => {
      el.innerHTML = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < iterRef.current) return `<span>${text[i]}</span>`;
          return `<span style="color:${glitchColor}">${CHARS[Math.floor(Math.random() * CHARS.length)]}</span>`;
        })
        .join("");
      if (iterRef.current >= text.length) clearInterval(intervalRef.current!);
      iterRef.current += 1 / 2;
    }, speed);
  };

  useEffect(() => {
    if (trigger === "mount") run();
    return () => clearInterval(intervalRef.current!);
  }, [text]);

  return (
    <span
      ref={ref}
      className={className}
      onMouseEnter={trigger === "hover" ? run : undefined}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {text}
    </span>
  );
}
