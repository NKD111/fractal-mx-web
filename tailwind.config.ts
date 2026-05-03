import type { Config } from "tailwindcss";

/**
 * Fractal MX — Tailwind Config
 *
 * Tailwind v4 uses CSS-based configuration via @theme in globals.css.
 * This file exists as a reference and for IDE autocomplete.
 * Primary tokens live in: src/app/globals.css → @theme block.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background:    "#080808",
        surface:       "#111111",
        border:        "#1f1f1f",
        accent:        "#3BEA3B",
        "accent-dim":  "#2fd132",
        "text-primary":"#F5F5F5",
        "text-muted":  "#888888",
      },
      fontFamily: {
        headline: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        body:     ["var(--font-inter)",         "system-ui", "sans-serif"],
        mono:     ["var(--font-jetbrains-mono)","ui-monospace","monospace"],
      },
      borderRadius: {
        sm:   "4px",
        md:   "8px",
        lg:   "12px",
        xl:   "20px",
      },
      animation: {
        "fade-up":    "fade-up 0.6s cubic-bezier(0.25, 0.1, 0.25, 1.4) both",
        "fade-in":    "fade-in 0.5s ease both",
        "blink":      "blink 1.2s step-end infinite",
        "scan":       "scan 3s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
        "scan": {
          "0%":   { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,255,148,0.2)" },
          "50%":      { boxShadow: "0 0 40px rgba(0,255,148,0.5), 0 0 80px rgba(0,255,148,0.15)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
