'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useAudio } from '@/context/AudioContext';

/* ── Target definitions (spec angle: 0 = North, clockwise) ── */
const TARGETS = [
  { r: 90,  a: 25,  lock: false },
  { r: 160, a: 78,  lock: true  },
  { r: 200, a: 142, lock: false },
  { r: 120, a: 195, lock: false },
  { r: 230, a: 230, lock: true  },
  { r: 80,  a: 290, lock: false },
  { r: 170, a: 315, lock: true  },
  { r: 140, a: 355, lock: false },
];

const RINGS        = [60, 120, 180, 240];
const RING_OPACITY = [0.08, 0.10, 0.12, 0.15];
const SIZE         = 500;

/* spec(0=N, CW) → canvas(0=E, CW) in [0, 2π] */
function toCanvasRad(deg: number): number {
  return (((deg - 90) % 360) + 360) % 360 * (Math.PI / 180);
}

function normalizeAngle(a: number): number {
  return ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

export default function MilitaryRadar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const { play }  = useAudio();

  /* ── All mutable animation state in one ref to avoid closure staleness ── */
  const st = useRef({
    sweep:     normalizeAngle(toCanvasRad(0)), // start pointing North
    prevSweep: normalizeAngle(toCanvasRad(0)),
    targets:   TARGETS.map(t => ({
      ...t,
      opacity:   0.15,
      lockPulse: 0,    // 0..1 decay
      blinkAge:  0,
    })),
    mountTime:  0,
    contacts:   8,
    scanMode:   false,
    scanAge:    0,
    nextScan:   8,     // seconds until next scan effect
    clickFx:    null as { x: number; y: number; born: number } | null,
    mouseX:     -9999,
    mouseY:     -9999,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ctx = canvas.getContext('2d')!;
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width  = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width  = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    ctx.scale(dpr, dpr);

    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const s  = st.current;
    s.mountTime  = performance.now();
    s.sweep      = normalizeAngle(toCanvasRad(0));
    s.prevSweep  = s.sweep;

    let isVisible = true;
    const visObs = new IntersectionObserver(([e]) => { isVisible = e.isIntersecting; }, { threshold: 0 });
    visObs.observe(canvas);

    const BASE_SPEED = (2 * Math.PI) / 3; // rad/s — 1 revolution per 3s

    let lastTime = 0;

    /* ── DRAW: concentric rings — full circles, staggered fade-in ── */
    function drawRings(age: number) {
      RINGS.forEach((r, i) => {
        const start   = i * 0.38;
        const elapsed = age - start;
        if (elapsed <= 0) return;
        const alpha = Math.min(elapsed / 0.45, 1) * RING_OPACITY[i];
        ctx.beginPath();
        ctx.arc(CX, CY, r, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(59,234,59,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
    }

    /* ── DRAW: crosshair + diagonal reticle lines ── */
    function drawReticle() {
      ctx.save();
      ctx.strokeStyle = 'rgba(59,234,59,0.06)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(CX - 240, CY); ctx.lineTo(CX + 240, CY);
      ctx.moveTo(CX, CY - 240); ctx.lineTo(CX, CY + 240);
      const d = 240 * Math.SQRT1_2;
      ctx.moveTo(CX - d, CY - d); ctx.lineTo(CX + d, CY + d);
      ctx.moveTo(CX + d, CY - d); ctx.lineTo(CX - d, CY + d);
      ctx.stroke();
      ctx.restore();
    }

    /* ── DRAW: sweep trail — arc from (sweep - π/2) to sweep ── */
    function drawTrail(sweep: number) {
      const layers = [
        { start: sweep - Math.PI / 2, alpha: 0.06 },
        { start: sweep - Math.PI / 3, alpha: 0.13 },
        { start: sweep - Math.PI / 6, alpha: 0.22 },
      ];
      layers.forEach(({ start, alpha }) => {
        ctx.beginPath();
        ctx.moveTo(CX, CY);
        ctx.arc(CX, CY, 240, start, sweep);
        ctx.closePath();
        ctx.fillStyle = `rgba(59,234,59,${alpha})`;
        ctx.fill();
      });
    }

    /* ── DRAW: sweep line ── */
    function drawSweepLine(sweep: number) {
      ctx.save();
      ctx.shadowColor = '#3BEA3B';
      ctx.shadowBlur  = 5;
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(CX + 240 * Math.cos(sweep), CY + 240 * Math.sin(sweep));
      ctx.strokeStyle = 'rgba(59,234,59,0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    /* ── UPDATE + DRAW: targets ── */
    function processTargets(sweep: number, prevSweep: number, dt: number) {
      const curr = normalizeAngle(sweep);
      const prev = normalizeAngle(prevSweep);

      s.targets.forEach((t, i) => {
        const ta = normalizeAngle(toCanvasRad(t.a));

        /* swept detection — handles wrap-around */
        let swept = false;
        if (prev < curr) {
          swept = ta >= prev && ta < curr;
        } else {
          swept = ta >= prev || ta < curr;
        }

        if (swept) {
          t.opacity   = 1.0;
          t.blinkAge  = 0;
          if (t.lock) t.lockPulse = 1.0;
        } else {
          t.opacity   = Math.max(0.15, t.opacity   - dt * 0.14);
          t.lockPulse = Math.max(0,    t.lockPulse - dt * 0.6);
          t.blinkAge += dt;
        }

        const ca = toCanvasRad(t.a);
        const tx = CX + t.r * Math.cos(ca);
        const ty = CY + t.r * Math.sin(ca);

        /* mouse proximity highlight */
        const dx  = tx - s.mouseX;
        const dy  = ty - s.mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const highlight = dist < 40 ? (1 - dist / 40) * 0.5 : 0;

        /* lock ring */
        if (t.lock) {
          /* pulsing expand ring */
          if (t.lockPulse > 0) {
            const expand = (1 - t.lockPulse) * 10;
            ctx.beginPath();
            ctx.arc(tx, ty, 12 + expand, 0, 2 * Math.PI);
            ctx.strokeStyle = `rgba(59,234,59,${t.lockPulse * 0.55})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
          /* static lock ring */
          ctx.beginPath();
          ctx.arc(tx, ty, 12, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(59,234,59,${(t.opacity * 0.28 + highlight * 0.2)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
          /* lock brackets (corner accents) */
          const bs = 6;
          [[tx - 12, ty - 12], [tx + 12, ty - 12], [tx - 12, ty + 12], [tx + 12, ty + 12]].forEach(([bx, by], qi) => {
            ctx.strokeStyle = `rgba(59,234,59,${t.opacity * 0.45})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            const signX = qi % 2 === 0 ? 1 : -1;
            const signY = qi < 2 ? 1 : -1;
            ctx.moveTo(bx, by); ctx.lineTo(bx + signX * bs, by);
            ctx.moveTo(bx, by); ctx.lineTo(bx, by + signY * bs);
            ctx.stroke();
          });
          /* label */
          if (t.opacity > 0.25) {
            ctx.save();
            ctx.font = '6px "JetBrains Mono", monospace';
            ctx.fillStyle = `rgba(59,234,59,${t.opacity * 0.75})`;
            const rightSide = tx > CX;
            ctx.textAlign    = rightSide ? 'left' : 'right';
            ctx.textBaseline = 'middle';
            const lx = rightSide ? tx + 18 : tx - 18;
            ctx.fillText(`TGT_${String(i + 1).padStart(2, '0')}`, lx, ty - 5);
            ctx.fillStyle = `rgba(59,234,59,${t.opacity * 0.5})`;
            ctx.fillText('LOCKED', lx, ty + 5);
            ctx.restore();
          }
        }

        /* target dot */
        ctx.save();
        if (t.opacity > 0.4 || highlight > 0.1) {
          ctx.shadowColor = '#3BEA3B';
          ctx.shadowBlur  = t.opacity > 0.7 ? 10 : 5;
        }
        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(59,234,59,${Math.min(1, t.opacity + highlight)})`;
        ctx.fill();
        ctx.restore();
      });
    }

    /* ── DRAW: degree tick marks + NESW cardinal labels ── */
    function drawTicks() {
      ctx.save();
      ctx.translate(CX, CY);
      for (let deg = 0; deg < 360; deg += 10) {
        const rad       = (deg - 90) * (Math.PI / 180);
        const isCard    = deg % 90 === 0;
        const isMajor   = deg % 30 === 0;
        const innerR    = isCard ? 220 : isMajor ? 225 : 232;
        ctx.strokeStyle = `rgba(59,234,59,${isCard ? 0.35 : isMajor ? 0.18 : 0.09})`;
        ctx.lineWidth   = isCard ? 0.8 : 0.4;
        ctx.beginPath();
        ctx.moveTo(innerR * Math.cos(rad), innerR * Math.sin(rad));
        ctx.lineTo(240   * Math.cos(rad), 240    * Math.sin(rad));
        ctx.stroke();

        if (isCard) {
          ctx.fillStyle = 'rgba(59,234,59,0.5)';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          const labels = ['N', 'E', 'S', 'W'];
          ctx.fillText(labels[deg / 90], 254 * Math.cos(rad), 254 * Math.sin(rad));
        } else if (isMajor) {
          ctx.fillStyle = 'rgba(59,234,59,0.28)';
          ctx.font = '7px "JetBrains Mono", monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(String(deg), 252 * Math.cos(rad), 252 * Math.sin(rad));
        }
      }
      ctx.restore();
    }

    /* ── DRAW: center origin + crosshair ── */
    function drawOrigin() {
      ctx.save();
      ctx.strokeStyle = 'rgba(59,234,59,0.45)';
      ctx.lineWidth   = 0.8;
      ctx.beginPath();
      ctx.moveTo(CX - 14, CY); ctx.lineTo(CX + 14, CY);
      ctx.moveTo(CX, CY - 14); ctx.lineTo(CX, CY + 14);
      ctx.stroke();
      ctx.shadowColor = '#3BEA3B';
      ctx.shadowBlur  = 12;
      ctx.beginPath();
      ctx.arc(CX, CY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#3BEA3B';
      ctx.fill();
      ctx.restore();
    }

    /* ── DRAW: HUD data overlay ── */
    function drawHUD(age: number, now: number) {
      const fa = Math.min(Math.max((age - 2) / 0.7, 0), 1);
      if (fa <= 0) return;
      ctx.save();

      /* TL — system id */
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillStyle = `rgba(59,234,59,${0.6 * fa})`;
      ctx.fillText('FRACTAL//RADAR', 8, 8);
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(59,234,59,${0.28 * fa})`;
      ctx.fillText('v2.0.4', 8, 20);
      ctx.strokeStyle = `rgba(59,234,59,${0.18 * fa})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(8, 31); ctx.lineTo(54, 31); ctx.stroke();

      /* TR — contact count */
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      ctx.fillStyle = `rgba(59,234,59,${0.58 * fa})`;
      ctx.fillText(`CONTACTOS: ${String(s.contacts).padStart(3, '0')}`, SIZE - 8, 8);

      /* BL — coordinates */
      ctx.font = '7px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillStyle = `rgba(59,234,59,${0.48 * fa})`;
      ctx.fillText('LAT: 19.4326° N', 8, SIZE - 28);
      ctx.fillText('LON: 99.1332° W', 8, SIZE - 17);
      ctx.fillStyle = `rgba(59,234,59,${0.38 * fa})`;
      ctx.fillText('ALT: 2,240 M', 8, SIZE - 6);

      /* BR — range + mode */
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      ctx.fillStyle = `rgba(59,234,59,${0.48 * fa})`;
      ctx.fillText('RANGE: 240 NM', SIZE - 8, SIZE - 18);
      ctx.fillStyle = `rgba(59,234,59,${0.88 * fa})`;
      ctx.fillText('MODE: ACTIVE', SIZE - 8, SIZE - 6);
      /* blinking dot */
      const blink = Math.floor(now / 650) % 2 === 0;
      if (blink) {
        ctx.fillStyle = `rgba(59,234,59,${0.9 * fa})`;
        ctx.fillText('●  ', SIZE - 8 - 72, SIZE - 6);
      }

      /* Right edge: distance scale */
      const scaleRows: [string, number][] = [
        ['240', CY - 240], ['180', CY - 180],
        ['120', CY - 120], ['060', CY - 60], ['000', CY],
      ];
      ctx.font = '6px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      scaleRows.forEach(([label, y]) => {
        ctx.fillStyle = `rgba(59,234,59,${0.22 * fa})`;
        ctx.fillText(label, SIZE - 8, y);
        ctx.strokeStyle = `rgba(59,234,59,${0.1 * fa})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(SIZE - 34, y); ctx.lineTo(SIZE - 38, y);
        ctx.stroke();
      });

      ctx.restore();
    }

    /* ── DRAW: click ripple effect ── */
    function drawClickFx(now: number) {
      const fx = s.clickFx;
      if (!fx) return;
      const age = (now - fx.born) / 1000;
      if (age > 0.65) { s.clickFx = null; return; }
      const p = age / 0.65;
      /* particle burst */
      for (let i = 0; i < 8; i++) {
        const a    = (i / 8) * 2 * Math.PI;
        const dist = p * 28;
        ctx.beginPath();
        ctx.arc(fx.x + dist * Math.cos(a), fx.y + dist * Math.sin(a), 1.5, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(59,234,59,${(1 - p) * 0.9})`;
        ctx.fill();
      }
      /* expanding ring */
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, p * 32, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(59,234,59,${(1 - p) * 0.6})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* ── MAIN ANIMATION LOOP ── */
    function animate(now: number) {
      if (!isVisible) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }
      const dt   = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
      lastTime   = now;
      const age  = (now - s.mountTime) / 1000;

      ctx.clearRect(0, 0, SIZE, SIZE);

      /* global fade-in over 2s */
      ctx.globalAlpha = Math.min(age / 2, 1);

      drawRings(age);

      if (age > 1.6) {
        drawReticle();
        drawTrail(s.sweep);
        drawSweepLine(s.sweep);
        processTargets(s.sweep, s.prevSweep, dt);
        drawTicks();
        drawOrigin();
        drawHUD(age, now);
      }

      ctx.globalAlpha = 1;
      drawClickFx(now);

      /* ── advance sweep angle + dispatch completion event ── */
      s.prevSweep = s.sweep;
      let speed = BASE_SPEED;

      /* scan effect every ~8s */
      s.nextScan -= dt;
      if (s.nextScan <= 0 && !s.scanMode) {
        s.scanMode = true;
        s.scanAge  = 0;
        s.nextScan = 8 + Math.random() * 4;
      }
      if (s.scanMode) {
        s.scanAge += dt;
        speed = BASE_SPEED * 4; /* 4× speed during scan */
        if (s.scanAge > 1.2) {
          s.scanMode = false;
          /* flash all targets */
          s.targets.forEach(t => { t.opacity = 1.0; });
        }
      }

      s.sweep = normalizeAngle(s.sweep + speed * dt);

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animRef.current);
      visObs.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    st.current.mouseX = e.clientX - r.left;
    st.current.mouseY = e.clientY - r.top;
  }, []);

  const onMouseLeave = useCallback(() => {
    st.current.mouseX = -9999;
    st.current.mouseY = -9999;
  }, []);

  const onClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    st.current.clickFx = {
      x:    e.clientX - r.left,
      y:    e.clientY - r.top,
      born: performance.now(),
    };
    play('radar');
  }, [play]);

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{ display: 'block', cursor: 'crosshair' }}
    />
  );
}
