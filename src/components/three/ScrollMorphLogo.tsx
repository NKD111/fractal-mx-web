"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const LINE_COUNT = 22;
const PHI = 1.618033988749895;
const CAM_Z = 4;
const CAM_FOV = 45;

/* ─────────────────────────────────────────────────────────────
   SHADERS
───────────────────────────────────────────────────────────── */
const VERT = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uDisplace;
  varying vec3  vWorldPos;
  varying vec3  vNormal;

  void main(){
    vNormal = normalize(normalMatrix * normal);
    vec3 p = position;
    float d = uDisplace;
    float w = sin(p.y * 3.0 + uTime * uSpeed * 1.5) * 0.04 * d
            + sin(p.x * 2.0 + uTime * uSpeed * 0.8) * 0.02 * d
            + cos(p.z * 2.5 + uTime * uSpeed * 1.1) * 0.015 * d;
    p += normal * w;
    vec4 wp = modelMatrix * vec4(p, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const FRAG = `
  uniform float uTime;
  uniform vec3  uCamPos;
  uniform float uMode;    // 0=iridescent 1=chrome 2=multi 3=dark-rim 4=pure-green
  uniform float uLineIdx; // 0..1
  uniform float uEmit;
  uniform float uOpacity;
  varying vec3  vWorldPos;
  varying vec3  vNormal;

  void main(){
    vec3 vd = normalize(uCamPos - vWorldPos);
    float fr = pow(1.0 - max(dot(vd, vNormal), 0.0), 2.5);

    vec3 GREEN  = vec3(0.231, 0.918, 0.231);
    vec3 TEAL   = vec3(0.0,   1.0,   0.702);
    vec3 CHROME = vec3(0.75,  0.75,  0.75);
    vec3 DARK   = vec3(0.04,  0.04,  0.04);
    vec3 WHITE  = vec3(1.0);

    vec3 col; float alpha;

    if(uMode < 0.5){
      // iridescent
      float sh = sin(uTime*0.5 + vWorldPos.y*2.0)*0.5+0.5;
      col = mix(GREEN, TEAL, sh*0.6);
      col = mix(col, CHROME, fr*0.7);
      col += WHITE * pow(fr,4.0)*0.9;
      col += GREEN * fr*0.3 + GREEN*uEmit;
      float fade = smoothstep(-1.2, 0.4, vWorldPos.y);
      alpha = fade * 0.92;
    } else if(uMode < 1.5){
      // chrome
      col = mix(vec3(0.3), CHROME, fr);
      col += WHITE * pow(fr,3.0)*0.5;
      alpha = 0.85;
    } else if(uMode < 2.5){
      // multi — per-line hue
      float t = fract(uLineIdx*3.7);
      col = mix(GREEN, TEAL, smoothstep(0.0,0.5,t));
      col = mix(col, WHITE*0.9, smoothstep(0.6,1.0,t));
      col = mix(col, CHROME, fr*0.5);
      alpha = 0.8;
    } else if(uMode < 3.5){
      // dark-rim
      col = mix(DARK, WHITE, fr*1.3);
      col = clamp(col, 0.0, 1.0) + GREEN*uEmit;
      alpha = 0.9;
    } else {
      // pure-green
      col = GREEN*(1.0 + uEmit*0.5) + WHITE*pow(fr,2.0)*0.3;
      alpha = 0.95;
    }

    gl_FragColor = vec4(col, alpha * uOpacity);
  }
`;

/* ─────────────────────────────────────────────────────────────
   STATE DEFINITIONS
───────────────────────────────────────────────────────────── */
type S = {
  vx: number; vy: number; scale: number;
  frag: number; speed: number; disp: number;
  particles: number; mode: number;
  emit: number; opacity: number;
};

const STATES: S[] = [
  // 0 Hero
  { vx:.73, vy:.50, scale:1.00, frag:0, speed:1.0, disp:1.0, particles:80,  mode:0, emit:0.0, opacity:1.0 },
  // 1 Clients
  { vx:.90, vy:.08, scale:0.35, frag:0, speed:0.3, disp:0.2, particles:15,  mode:1, emit:0.0, opacity:1.0 },
  // 2 Services
  { vx:.27, vy:.50, scale:0.50, frag:1, speed:1.5, disp:0.8, particles:40,  mode:2, emit:0.0, opacity:0.4 },
  // 3 Manifesto
  { vx:.78, vy:.50, scale:0.75, frag:0, speed:0.5, disp:0.5, particles:30,  mode:3, emit:0.2, opacity:1.0 },
  // 4 CTA
  { vx:.50, vy:.12, scale:0.40, frag:0, speed:0.0, disp:0.1, particles:20,  mode:4, emit:1.0, opacity:1.0 },
  // 5 Contact
  { vx:.50, vy:.50, scale:0.90, frag:0, speed:2.5, disp:1.5, particles:100, mode:0, emit:0.5, opacity:1.0 },
];

/* ─────────────────────────────────────────────────────────────
   EASINGS
───────────────────────────────────────────────────────────── */
const E0 = (t: number) => t < .5 ? 8*t**4 : 1-8*(--t)**4;
const E1 = (t: number) => t === 0 ? 0 : Math.pow(2, 10*t-10);
const E2 = (t: number) => {
  if (t === 0 || t === 1) return t;
  return Math.pow(2,-10*t) * Math.sin((t*10-.75)*(2*Math.PI/3)) + 1;
};
const E3 = (t: number) => -(Math.cos(Math.PI*t)-1)/2;
const E4 = (t: number) => 1 + 2.70158*(t-1)**3 + 1.70158*(t-1)**2;
const EASE = [E0, E1, E2, E3, E4];
const BP   = [0.15, 0.30, 0.50, 0.65, 0.80];

function lerpS(a: S, b: S, t: number): S {
  const l = (x: number, y: number) => x + (y - x) * t;
  return {
    vx: l(a.vx,b.vx), vy: l(a.vy,b.vy), scale: l(a.scale,b.scale),
    frag: l(a.frag,b.frag), speed: l(a.speed,b.speed), disp: l(a.disp,b.disp),
    particles: Math.round(l(a.particles,b.particles)),
    mode: t < .5 ? a.mode : b.mode,
    emit: l(a.emit,b.emit), opacity: l(a.opacity,b.opacity),
  };
}

function getState(progress: number): S {
  const p = Math.max(0, Math.min(1, progress));
  for (let i = 0; i < BP.length; i++) {
    if (p < BP[i]) {
      const start = i === 0 ? 0 : BP[i-1];
      const t = EASE[i]((p - start) / (BP[i] - start));
      return lerpS(STATES[i], STATES[i+1], t);
    }
  }
  return STATES[5];
}

/* ─────────────────────────────────────────────────────────────
   GEOMETRY HELPERS
───────────────────────────────────────────────────────────── */
function makeCurves(): THREE.CatmullRomCurve3[] {
  return Array.from({ length: LINE_COUNT }, (_, c) => {
    const t = c / LINE_COUNT;
    const rx = 0.2 + t * 0.9, ry = 0.15 + t * 0.7, rz = 0.05 + t * 0.25;
    const twist = t * Math.PI * 3;
    const pts: THREE.Vector3[] = [];
    for (let s = 0; s <= 60; s++) {
      const a = (s / 60) * Math.PI * 2;
      const n1 = Math.sin(a*3+twist)*.08, n2 = Math.cos(a*5-twist*.7)*.05, n3 = Math.sin(a*7+c*.8)*.03;
      pts.push(new THREE.Vector3(
        Math.cos(a)*(rx+n1+n2),
        Math.sin(a)*(ry+n2+n3),
        Math.sin(a*2+twist)*rz + Math.cos(a*3)*rz*.3,
      ));
    }
    return new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.5);
  });
}

function makeDispersed() {
  return Array.from({ length: LINE_COUNT }, (_, i) => {
    const a = i * PHI * Math.PI * 2;
    const r = 1.2 + (i / LINE_COUNT) * 0.8;
    return {
      px: Math.cos(a) * r * 1.5,
      py: Math.sin(a) * r,
      pz: (i / LINE_COUNT - 0.5) * 0.8,
      rx: i * PHI * 0.5,
      ry: i * PHI * 0.3,
    };
  });
}

/* ─────────────────────────────────────────────────────────────
   LOGO LINES
───────────────────────────────────────────────────────────── */
function LogoLines({ stateRef }: { stateRef: React.MutableRefObject<S> }) {
  const groupsRef = useRef<(THREE.Group | null)[]>([]);
  const matsRef   = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const { camera } = useThree();

  const { geos, dispersed } = useMemo(() => {
    const curves = makeCurves();
    const geos = curves.map((c, i) => {
      const r = 0.008 + (i / LINE_COUNT) * 0.012;
      return new THREE.TubeGeometry(c, 100, r, 6, true);
    });
    return { geos, dispersed: makeDispersed() };
  }, []);

  useEffect(() => {
    return () => { geos.forEach(g => g.dispose()); };
  }, [geos]);

  useFrame(({ clock }) => {
    const s = stateRef.current;
    const t = clock.getElapsedTime();
    const cp = camera.position;

    for (let i = 0; i < LINE_COUNT; i++) {
      const g = groupsRef.current[i];
      const m = matsRef.current[i];
      const d = dispersed[i];

      if (g) {
        g.position.x = d.px * s.frag;
        g.position.y = d.py * s.frag;
        g.position.z = d.pz * s.frag;
        g.rotation.x = d.rx * s.frag;
        g.rotation.y = d.ry * s.frag;
      }

      if (m) {
        m.uniforms.uTime.value  = t;
        m.uniforms.uSpeed.value = s.speed;
        m.uniforms.uDisplace.value = s.disp;
        m.uniforms.uMode.value  = s.mode;
        m.uniforms.uEmit.value  = s.emit;
        m.uniforms.uOpacity.value = s.opacity;
        m.uniforms.uCamPos.value.copy(cp);
      }
    }
  });

  return (
    <>
      {geos.map((geo, i) => (
        <group key={i} ref={el => { groupsRef.current[i] = el; }}>
          <mesh geometry={geo}>
            <shaderMaterial
              ref={el => { matsRef.current[i] = el; }}
              vertexShader={VERT}
              fragmentShader={FRAG}
              uniforms={{
                uTime:    { value: 0 },
                uSpeed:   { value: 1 },
                uDisplace:{ value: 1 },
                uMode:    { value: 0 },
                uLineIdx: { value: i / LINE_COUNT },
                uEmit:    { value: 0 },
                uOpacity: { value: 1 },
                uCamPos:  { value: new THREE.Vector3() },
              }}
              transparent
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   PARTICLES
───────────────────────────────────────────────────────────── */
function LogoParticles({ stateRef }: { stateRef: React.MutableRefObject<S> }) {
  const MAX = 120;
  const positions = useMemo(() => {
    const arr = new Float32Array(MAX * 3);
    for (let i = 0; i < MAX; i++) {
      const r = 1.0 + Math.random() * 1.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      arr[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i*3+2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  useFrame(({ clock }) => {
    const s = stateRef.current;
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.05 * (s.speed * 0.4 + 0.1);
      ref.current.rotation.x = t * 0.02;
      const op = (s.particles / MAX) * s.opacity;
      if (matRef.current) {
        matRef.current.opacity += (op - matRef.current.opacity) * 0.05;
      }
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        ref={matRef}
        transparent
        color="#3BEA3B"
        size={0.018}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

/* ─────────────────────────────────────────────────────────────
   LIGHT RAYS (State 4)
───────────────────────────────────────────────────────────── */
function LightRays({ stateRef }: { stateRef: React.MutableRefObject<S> }) {
  const linesRef = useRef<THREE.Line[]>([]);

  const lineObjects = useMemo(() => {
    const dirs = [
      [0,0,0,  1.8,-1.2,0],
      [0,0,0, -1.8,-1.2,0],
      [0,0,0,  0.0,-2.0,0],
      [0,0,0,  1.2,-1.8,0],
    ];
    return dirs.map(d => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(d), 3));
      const mat = new THREE.LineBasicMaterial({ color: "#3BEA3B", transparent: true, opacity: 0 });
      const line = new THREE.Line(geo, mat);
      return { line, mat };
    });
  }, []);

  useEffect(() => {
    return () => {
      lineObjects.forEach(({ line }) => {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
    };
  }, [lineObjects]);

  useFrame(() => {
    const target = stateRef.current.mode === 4 ? 0.25 : 0;
    lineObjects.forEach(({ mat }) => {
      mat.opacity += (target - mat.opacity) * 0.06;
    });
  });

  return (
    <>
      {lineObjects.map(({ line }, i) => (
        <primitive key={i} object={line} />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   ORBITING LIGHT
───────────────────────────────────────────────────────────── */
function OrbitLight({ stateRef }: { stateRef: React.MutableRefObject<S> }) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.set(
        Math.cos(t * 0.785) * 3,
        Math.sin(t * 0.5) * 1.5,
        Math.sin(t * 0.785) * 3
      );
      ref.current.intensity = stateRef.current.mode === 4 ? 2 : 4;
    }
  });
  return <pointLight ref={ref} color="#3BEA3B" intensity={4} distance={10} />;
}

/* ─────────────────────────────────────────────────────────────
   SCENE
───────────────────────────────────────────────────────────── */
function Scene({ scrollProg }: { scrollProg: React.MutableRefObject<number> }) {
  const stateRef = useRef<S>(STATES[0]);
  const groupRef = useRef<THREE.Group>(null);
  const { size } = useThree();

  // cached vectors to avoid GC pressure
  const _scaleVec = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  const mountY    = useRef(6);

  useFrame(({ clock }, delta) => {
    const s = getState(scrollProg.current);
    stateRef.current = s;

    const group = groupRef.current;
    if (!group) return;

    // mount drop animation
    if (mountY.current > 0.01) {
      mountY.current *= 0.92;
      group.position.y -= mountY.current * delta * 2;
    }

    // world position from viewport %
    const aspect = size.width / size.height;
    const fh = 2 * Math.tan((CAM_FOV / 2) * (Math.PI / 180)) * CAM_Z;
    const fw = fh * aspect;
    const tx = (s.vx - 0.5) * fw;
    const ty = -(s.vy - 0.5) * fh;

    group.position.x += (tx - group.position.x) * 0.06;
    // only override Y if mount is done
    if (mountY.current < 0.1) {
      group.position.y += (ty - group.position.y) * 0.06;
    }

    _scaleVec.setScalar(s.scale);
    group.scale.lerp(_scaleVec, 0.06);
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.08} />
      <pointLight color="#ffffff" intensity={0.5} position={[2, 3, 2]} />
      <OrbitLight stateRef={stateRef} />
      <LogoLines    stateRef={stateRef} />
      <LogoParticles stateRef={stateRef} />
      <LightRays    stateRef={stateRef} />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   EXPORT — fixed full-screen canvas
───────────────────────────────────────────────────────────── */
export default function ScrollMorphLogo() {
  const [isMobile, setIsMobile] = useState(true);
  const scrollProg = useRef(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: self => { scrollProg.current = self.progress; },
    });
    return () => st.kill();
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 100 }}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, CAM_Z], fov: CAM_FOV }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <Scene scrollProg={scrollProg} />
      </Canvas>
    </div>
  );
}
