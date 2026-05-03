'use client';

import { LiquidMetal, liquidMetalPresets } from '@paper-design/shaders-react';
import { useEffect, useRef, useState } from 'react';

function Instance({
  width, height, opacity, style, preset = 2, speed = 0.18
}: {
  width: number;
  height: number;
  opacity: number;
  style?: React.CSSProperties;
  preset?: number;
  speed?: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold: 0.05 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        width,
        height,
        opacity,
        borderRadius: '50%',
        overflow: 'hidden',
        pointerEvents: 'none',
        ...style,
      }}
    >
      {visible && (
        <LiquidMetal
          {...liquidMetalPresets[preset]}
          speed={speed}
          style={{ width: '100%', height: '100%' }}
        />
      )}
    </div>
  );
}

export default function LiquidMetalAmbient() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  if (isMobile) return null;

  return (
    <>
      <div style={{
        position: 'fixed', right: '-130px',
        bottom: '15%', zIndex: 0, pointerEvents: 'none',
      }}>
        <Instance width={300} height={300} opacity={0.06} preset={2} speed={0.15} />
      </div>

      <div style={{
        position: 'fixed', left: '-110px',
        top: '35%', zIndex: 0, pointerEvents: 'none',
      }}>
        <Instance width={240} height={240} opacity={0.045} preset={1} speed={0.12} />
      </div>
    </>
  );
}
