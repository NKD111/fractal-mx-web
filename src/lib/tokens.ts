/**
 * Fractal MX — Design Tokens (TypeScript source of truth)
 * Mirrors the CSS variables in globals.css for use in JS/Framer Motion contexts.
 */

export const colors = {
  background:  "#080808",
  surface:     "#111111",
  border:      "#1f1f1f",
  accent:      "#3BEA3B",
  accentDim:   "#2fd132",
  textPrimary: "#F5F5F5",
  textMuted:   "#888888",
} as const;

export const fonts = {
  headline: "var(--font-space-grotesk)",
  body:     "var(--font-inter)",
  mono:     "var(--font-jetbrains-mono)",
} as const;

export const easing = {
  snappy: [0.25, 0.1, 0.25, 1.4] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
  enter:  [0.0, 0.0, 0.2, 1] as const,
  exit:   [0.4, 0.0, 1.0, 1] as const,
} as const;

export const duration = {
  fast:   0.15,
  normal: 0.3,
  slow:   0.6,
  crawl:  1.0,
} as const;

/** Reusable Framer Motion variants */
export const motionVariants = {
  fadeUp: {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing.snappy } },
  },
  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: easing.smooth } },
  },
  stagger: {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.08 } },
  },
  slideLeft: {
    hidden:  { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easing.smooth } },
  },
} as const;
