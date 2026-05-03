"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ────────────────────────────────────────────────��───────────
   SHADERS
──────────────────────���───────────────────────────────────── */
const vertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  varying vec3  vWorldPos;
  varying vec3  vNormal;

  void main(){
    vNormal = normalize(normalMatrix * normal);

    // sinusoidal ribbon displacement
    vec3 p = position;
    float wave = sin(p.y * 3.0 + uTime * uSpeed * 1.5) * 0.04
               + sin(p.x * 2.0 + uTime * uSpeed * 0.8) * 0.02
               + cos(p.z * 2.5 + uTime * uSpeed * 1.1) * 0.015;
    p += normal * wave;

    vec4 worldPos = modelMatrix * vec4(p, 1.0);
    vWorldPos = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3  uCameraPos;
  varying vec3  vWorldPos;
  varying vec3  vNormal;

  void main(){
    vec3 viewDir = normalize(uCameraPos - vWorldPos);
    float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 2.5);

    vec3 green    = vec3(0.231, 0.918, 0.231);  // #3BEA3B
    vec3 teal     = vec3(0.0,   1.0,   0.702);  // #00FFB3
    vec3 chrome   = vec3(0.753, 0.753, 0.753);  // #C0C0C0
    vec3 darkGreen= vec3(0.039, 0.290, 0.039);  // #0A4A0A

    // iridescent blend
    float shift = sin(uTime * 0.5 + vWorldPos.y * 2.0) * 0.5 + 0.5;
    vec3 col = mix(green, teal,  shift * 0.6);
    col = mix(col, chrome, fresnel * 0.7);
    col = mix(col, darkGreen, smoothstep(0.8, 1.0, 1.0 - fresnel));

    // bright highlight
    col += vec3(1.0) * pow(fresnel, 4.0) * 0.9;

    // emission boost on high fresnel
    col += green * fresnel * 0.3;

    // meteorite fade: bottom of logo → transparent
    float fade = smoothstep(-1.2, 0.4, vWorldPos.y);

    gl_FragColor = vec4(col, fade * 0.9);
  }
`;

/* ────────────────��─────────────────────────��─────────────────
   FRACTAL CURVE GENERATOR
   Generates concentric fingerprint-like curves
──────────────���─────────────────────────────��─────────────── */
function generateFractalCurves(count: number): THREE.CatmullRomCurve3[] {
  const curves: THREE.CatmullRomCurve3[] = [];

  for (let c = 0; c < count; c++) {
    const t = c / count;
    const radiusX = 0.2 + t * 0.9;
    const radiusY = 0.15 + t * 0.7;
    const radiusZ = 0.05 + t * 0.25;
    const twist = t * Math.PI * 3;
    const segments = 60 + Math.floor(t * 20);

    const points: THREE.Vector3[] = [];
    for (let s = 0; s <= segments; s++) {
      const angle = (s / segments) * Math.PI * 2;

      // Fingerprint-like distortion
      const noise1 = Math.sin(angle * 3 + twist) * 0.08;
      const noise2 = Math.cos(angle * 5 - twist * 0.7) * 0.05;
      const noise3 = Math.sin(angle * 7 + c * 0.8) * 0.03;

      const x = Math.cos(angle) * (radiusX + noise1 + noise2);
      const y = Math.sin(angle) * (radiusY + noise2 + noise3);
      const z = Math.sin(angle * 2 + twist) * radiusZ + Math.cos(angle * 3) * radiusZ * 0.3;

      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.5);
    curves.push(curve);
  }

  return curves;
}

/* ──────────────────────────────────────��─────────────────────
   ORBITAL PARTICLES
──────────────────────────────────────────────────────────── */
function LogoParticles({ isHovered }: { isHovered: boolean }) {
  const count = 80;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = 1.0 + Math.random() * 1.3;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  const speeds = useMemo(() => Array.from({ length: count }, () => 0.01 + Math.random() * 0.03), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.06;
    ref.current.rotation.x = t * 0.03;
    const targetScale = isHovered ? 1.4 : 1.0;
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.06);
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#3BEA3B"
        size={0.018}
        sizeAttenuation
        depthWrite={false}
        opacity={0.65}
      />
    </Points>
  );
}

/* ───────────────────────��──────────────────────────���─────────
   BURST PARTICLES (on click)
────────────────────���─────────────────────────────────────── */
function BurstParticles({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const count = 60;
  const positions = useMemo(() => new Float32Array(count * 3).fill(0), []);
  const velocities = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 0.15,
      y: (Math.random() - 0.5) * 0.15,
      z: (Math.random() - 0.5) * 0.15,
    })), []);
  const life = useRef(0);

  useEffect(() => {
    if (active) life.current = 1;
  }, [active]);

  useFrame((_, delta) => {
    if (!ref.current || life.current <= 0) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      pos.setX(i, (pos.getX(i) || 0) + velocities[i].x * life.current);
      pos.setY(i, (pos.getY(i) || 0) + velocities[i].y * life.current);
      pos.setZ(i, (pos.getZ(i) || 0) + velocities[i].z * life.current);
    }
    pos.needsUpdate = true;
    life.current -= delta * 1.5;
    if (life.current < 0) {
      for (let i = 0; i < count * 3; i++) positions[i] = 0;
      pos.needsUpdate = true;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#3BEA3B"
        size={0.03}
        sizeAttenuation
        depthWrite={false}
        opacity={0.9}
      />
    </Points>
  );
}

/* ─────────────────────────���──────────────────────────��───────
   ORBITING LIGHT
─────────────────────────���────────────────────────────────── */
function OrbitLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.set(
        Math.cos(t * 0.785) * 3,
        Math.sin(t * 0.5) * 1.5,
        Math.sin(t * 0.785) * 3
      );
    }
  });
  return <pointLight ref={ref} color="#3BEA3B" intensity={4} distance={10} />;
}

/* ────────────────────────────────────────────────────────────
   LOGO MESH GROUP
──────────────────────��────────────────────────────────���──── */
function LogoMeshGroup({
  mouseNorm,
  isHovered,
  isClicked,
}: {
  mouseNorm: React.MutableRefObject<{ x: number; y: number }>;
  isHovered: boolean;
  isClicked: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const meshes = useRef<THREE.Mesh[]>([]);

  const { curves, uniforms } = useMemo(() => {
    const c = generateFractalCurves(22);
    const u = c.map(() => ({
      uTime:      { value: 0 },
      uSpeed:     { value: 1 },
      uCameraPos: { value: new THREE.Vector3() },
    }));
    return { curves: c, uniforms: u };
  }, []);

  // mount animation
  const mountProgress = useRef(0);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.y = 8;
    groupRef.current.rotation.z = 0.8;
  }, []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const group = groupRef.current;
    if (!group) return;

    // mount animation
    if (mountProgress.current < 1) {
      mountProgress.current = Math.min(1, mountProgress.current + delta * 0.56);
      const eased = 1 - Math.pow(1 - mountProgress.current, 3);
      group.position.y = 8 * (1 - eased) + Math.sin(eased * Math.PI) * 0.05;
      group.rotation.z = 0.8 * (1 - eased);
    } else {
      // idle rotation
      group.rotation.y += 0.003;

      // mouse parallax
      const targetX = mouseNorm.current.y * 0.3;
      const targetY = mouseNorm.current.x * 0.5;
      group.rotation.x += (targetX - group.rotation.x) * 0.05;
      // Y is driven by idle + mouse
      const idleY = group.rotation.y;
      group.rotation.y += (targetY - group.rotation.y % (Math.PI * 2)) * 0.015;
    }

    // breathe
    const breathe = 1 + Math.sin(t * 0.7) * 0.015;
    const clickScale = isClicked ? 1.2 : 1.0;
    const targetScale = breathe * clickScale;
    group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);

    // update shader uniforms
    const speed = isHovered ? 3.0 : 1.0;
    uniforms.forEach((u) => {
      u.uTime.value = t;
      u.uSpeed.value += (speed - u.uSpeed.value) * 0.1;
      u.uCameraPos.value.copy(camera.position);
    });
  });

  // build tube geometries once
  const tubeGeos = useMemo(() =>
    curves.map((curve, i) => {
      const t = i / curves.length;
      const radius = 0.008 + t * 0.012;
      return new THREE.TubeGeometry(curve, 120, radius, 6, true);
    }), [curves]);

  return (
    <group ref={groupRef}>
      {tubeGeos.map((geo, i) => (
        <mesh
          key={i}
          geometry={geo}
          ref={(el) => { if (el) meshes.current[i] = el; }}
        >
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms[i]}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ──────────────────────────────────────────────────────��─────
   SCENE
──────────────────────────────────────────────────────────── */
function Scene({
  isHovered,
  isClicked,
}: {
  isHovered: boolean;
  isClicked: boolean;
}) {
  const mouseNorm = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseNorm.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <ambientLight color="#0a0a0a" intensity={0.15} />
      <pointLight color="#ffffff" intensity={0.6} position={[2, 3, 2]} />
      <OrbitLight />
      <LogoMeshGroup mouseNorm={mouseNorm} isHovered={isHovered} isClicked={isClicked} />
      <LogoParticles isHovered={isHovered} />
      <BurstParticles active={isClicked} />
    </>
  );
}

/* ───────────────────────────────────────────────────────���────
   EXPORT
───────────────────────��────────────────────────────────���─── */
export default function FractalLogo3D({ mobile = false }: { mobile?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const size = mobile ? 300 : 600;

  const handleClick = useCallback(() => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 350);
  }, []);

  return (
    <div
      style={{ width: size, height: size, cursor: isHovered ? "crosshair" : "none" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <Scene isHovered={isHovered} isClicked={isClicked} />
      </Canvas>
    </div>
  );
}
