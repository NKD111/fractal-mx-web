"use client";

/* Animated SVG logo — lemniscate-based concentric curves
   Each path is a lemniscate of Bernoulli at a different scale,
   rotated by a fraction of the golden angle to create a 3D-like star knot.
   Animations: dash flow, glow pulse, slow group rotation.
*/

const PHI    = (1 + Math.sqrt(5)) / 2;
const TWO_PI = Math.PI * 2;
const CX = 200, CY = 200;

function lemniscatePoints(a: number, steps = 200): string {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * TWO_PI;
    const denom = 1 + Math.sin(t) ** 2;
    const x = CX + (a * Math.SQRT2 * Math.cos(t)) / denom;
    const y = CY + (a * Math.SQRT2 * Math.sin(t) * Math.cos(t)) / denom;
    pts.push(i === 0 ? `M${x.toFixed(2)} ${y.toFixed(2)}` : `L${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return pts.join(" ") + " Z";
}

const SCALES  = [22, 35, 48, 62, 76, 90, 104, 118, 132, 148, 162, 176];
const ROTATES = SCALES.map((_, i) => (i * PHI * 360) % 360);

const PATHS = SCALES.map((a, i) => ({
  d:        lemniscatePoints(a),
  rotate:   ROTATES[i],
  opacity:  0.15 + (i / SCALES.length) * 0.65,
  dashLen:  80 + i * 28,
  delay:    i * 0.24,
  duration: 3 + i * 0.5,
}));

export function FractalLogoSVG({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible" }}
      suppressHydrationWarning
    >
      <defs>
        <filter id="frac-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <style>{`
          @keyframes fracDash {
            from { stroke-dashoffset: 1000; }
            to   { stroke-dashoffset: 0;    }
          }
          @keyframes fracGlow {
            0%,100% { filter: drop-shadow(0 0 4px rgba(59,234,59,0.4)); }
            50%     { filter: drop-shadow(0 0 12px rgba(59,234,59,0.9)); }
          }
          @keyframes fracSpin {
            from { transform: rotate(0deg);   }
            to   { transform: rotate(360deg); }
          }
          .frac-group {
            transform-origin: 200px 200px;
            animation: fracSpin 60s linear infinite;
          }
          .frac-path {
            stroke-dasharray: var(--dl);
            stroke-dashoffset: var(--dl);
            animation:
              fracDash var(--dur) var(--delay) linear infinite,
              fracGlow 3s var(--delay) ease-in-out infinite;
          }
        `}</style>
      </defs>

      {/* outer decorative ring */}
      <circle cx="200" cy="200" r="185" stroke="#3BEA3B" strokeWidth="0.5" opacity="0.08" />
      <circle cx="200" cy="200" r="178" stroke="#3BEA3B" strokeWidth="0.3" opacity="0.05" />

      {/* tick marks on outer ring */}
      {Array.from({ length: 36 }, (_, i) => {
        const angle = (i / 36) * TWO_PI;
        const r1 = 185, r2 = i % 9 === 0 ? 170 : 178;
        return (
          <line
            key={i}
            x1={200 + r1 * Math.cos(angle)}
            y1={200 + r1 * Math.sin(angle)}
            x2={200 + r2 * Math.cos(angle)}
            y2={200 + r2 * Math.sin(angle)}
            stroke="#3BEA3B" strokeWidth="0.6" opacity="0.2"
          />
        );
      })}

      {/* lemniscate paths */}
      <g className="frac-group">
        {PATHS.map((p, i) => (
          <path
            key={i}
            d={p.d}
            className="frac-path"
            stroke="#3BEA3B"
            strokeWidth={0.8 + (i / PATHS.length) * 0.8}
            opacity={p.opacity}
            style={{
              transform: `rotate(${p.rotate}deg)`,
              transformOrigin: "200px 200px",
              // @ts-expect-error CSS custom properties
              "--dl":    `${p.dashLen}px`,
              "--dur":   `${p.duration}s`,
              "--delay": `${p.delay}s`,
            }}
          />
        ))}
      </g>

      {/* center crosshair */}
      <line x1="188" y1="200" x2="196" y2="200" stroke="#3BEA3B" strokeWidth="0.8" opacity="0.5" />
      <line x1="204" y1="200" x2="212" y2="200" stroke="#3BEA3B" strokeWidth="0.8" opacity="0.5" />
      <line x1="200" y1="188" x2="200" y2="196" stroke="#3BEA3B" strokeWidth="0.8" opacity="0.5" />
      <line x1="200" y1="204" x2="200" y2="212" stroke="#3BEA3B" strokeWidth="0.8" opacity="0.5" />
      <circle cx="200" cy="200" r="2.5" fill="#3BEA3B" opacity="0.6" />
    </svg>
  );
}
