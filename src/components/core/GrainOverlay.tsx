"use client";

export function GrainOverlay() {
  return (
    <>
      <style>{`
        .grain-overlay-core {
          position: fixed;
          inset: 0;
          z-index: 9998;
          pointer-events: none;
          opacity: 0.028;
          will-change: transform;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          animation: grain-core 0.5s steps(1) infinite;
        }
        @keyframes grain-core {
          0%         { transform: translate(0, 0); }
          12.5%      { transform: translate(-2%, -3%); }
          25%        { transform: translate(3%,  2%); }
          37.5%      { transform: translate(-1%,  4%); }
          50%        { transform: translate(2%, -1%); }
          62.5%      { transform: translate(-3%,  3%); }
          75%        { transform: translate(1%, -2%); }
          87.5%      { transform: translate(-2%,  1%); }
          100%       { transform: translate(3%, -3%); }
        }
      `}</style>
      <div className="grain-overlay-core" aria-hidden="true" />
    </>
  );
}
