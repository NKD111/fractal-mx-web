"use client";

export function OrbitalRings() {
  const rings = [
    { rx: 150, ry: 55, duration: 8,  rotate: 30,  dotPos: 0.3 },
    { rx: 150, ry: 45, duration: 12, rotate: 60,  dotPos: 0.7 },
    { rx: 150, ry: 35, duration: 20, rotate: 90,  dotPos: 0.1 },
  ];

  return (
    <svg
      width="300"
      height="300"
      viewBox="-150 -150 300 300"
      className="pointer-events-none absolute inset-0 w-full h-full"
      style={{ opacity: 0.15 }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {rings.map((r, i) => (
        <g key={i} transform={`rotate(${r.rotate})`}>
          <ellipse
            cx={0}
            cy={0}
            rx={r.rx}
            ry={r.ry}
            fill="none"
            stroke="#3BEA3B"
            strokeWidth="0.5"
          />
          {/* rotating dot */}
          {i === 0 && (
            <circle r="3" fill="#3BEA3B" style={{ opacity: 0.8 }}>
              <animateMotion
                dur={`${r.duration}s`}
                repeatCount="indefinite"
                path={`M ${r.rx} 0 A ${r.rx} ${r.ry} 0 1 0 ${-r.rx} 0 A ${r.rx} ${r.ry} 0 1 0 ${r.rx} 0`}
              />
              <animate
                attributeName="opacity"
                values="0.2;1;0.2"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </g>
      ))}
    </svg>
  );
}
