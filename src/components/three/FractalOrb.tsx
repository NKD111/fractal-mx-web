"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ── Shader material ── */
const vertexShader = `
  uniform float uTime;
  uniform float uPulse;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Classic Perlin 3D noise
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  vec3 fade(vec3 t){ return t*t*t*(t*(t*6.0-15.0)+10.0); }
  float cnoise(vec3 P){
    vec3 Pi0=floor(P); vec3 Pi1=Pi0+vec3(1.0);
    Pi0=mod(Pi0,289.0); Pi1=mod(Pi1,289.0);
    vec3 Pf0=fract(P); vec3 Pf1=Pf0-vec3(1.0);
    vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);
    vec4 iy=vec4(Pi0.yy,Pi1.yy);
    vec4 iz0=Pi0.zzzz; vec4 iz1=Pi1.zzzz;
    vec4 ixy=permute(permute(ix)+iy);
    vec4 ixy0=permute(ixy+iz0); vec4 ixy1=permute(ixy+iz1);
    vec4 gx0=ixy0/7.0; vec4 gy0=fract(floor(gx0)/7.0)-0.5;
    gx0=fract(gx0); vec4 gz0=vec4(0.5)-abs(gx0)-abs(gy0);
    vec4 sz0=step(gz0,vec4(0.0)); gx0-=sz0*(step(0.0,gx0)-0.5); gy0-=sz0*(step(0.0,gy0)-0.5);
    vec4 gx1=ixy1/7.0; vec4 gy1=fract(floor(gx1)/7.0)-0.5;
    gx1=fract(gx1); vec4 gz1=vec4(0.5)-abs(gx1)-abs(gy1);
    vec4 sz1=step(gz1,vec4(0.0)); gx1-=sz1*(step(0.0,gx1)-0.5); gy1-=sz1*(step(0.0,gy1)-0.5);
    vec3 g000=vec3(gx0.x,gy0.x,gz0.x); vec3 g100=vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010=vec3(gx0.z,gy0.z,gz0.z); vec3 g110=vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001=vec3(gx1.x,gy1.x,gz1.x); vec3 g101=vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011=vec3(gx1.z,gy1.z,gz1.z); vec3 g111=vec3(gx1.w,gy1.w,gz1.w);
    vec4 norm0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
    g000*=norm0.x; g010*=norm0.y; g100*=norm0.z; g110*=norm0.w;
    vec4 norm1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
    g001*=norm1.x; g011*=norm1.y; g101*=norm1.z; g111*=norm1.w;
    float n000=dot(g000,Pf0); float n100=dot(g100,vec3(Pf1.x,Pf0.yz));
    float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)); float n110=dot(g110,vec3(Pf1.xy,Pf0.z));
    float n001=dot(g001,vec3(Pf0.xy,Pf1.z)); float n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
    float n011=dot(g011,vec3(Pf0.x,Pf1.yz)); float n111=dot(g111,Pf1);
    vec3 fade_xyz=fade(Pf0);
    vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
    vec2 n_yz=mix(n_z.xy,n_z.zw,fade_xyz.y);
    float n_xyz=mix(n_yz.x,n_yz.y,fade_xyz.x);
    return 2.2*n_xyz;
  }

  void main(){
    vNormal = normal;
    float n = cnoise(position * 1.8 + uTime * 0.18);
    float displacement = n * 0.22 * uPulse;
    vec3 displaced = position + normal * displacement;
    vPosition = displaced;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main(){
    // Fresnel
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 3.0);

    vec3 green = vec3(0.231, 0.918, 0.231); // #3BEA3B
    vec3 dark  = vec3(0.04, 0.04, 0.04);

    vec3 col = mix(dark, green, fresnel * 0.9);

    // subtle pulsing inner glow
    float pulse = sin(uTime * 0.6) * 0.5 + 0.5;
    col += green * fresnel * pulse * 0.4;

    gl_FragColor = vec4(col, 0.92);
  }
`;

/* ── Orbiting light ── */
function OrbitLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.set(
        Math.cos(t * 0.7) * 2.2,
        Math.sin(t * 0.5) * 1.4,
        Math.sin(t * 0.7) * 2.2
      );
    }
  });
  return <pointLight ref={ref} color="#3BEA3B" intensity={6} distance={8} />;
}

/* ── Floating particles ── */
function OrbParticles() {
  const count = 200;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.2 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.04;
      ref.current.rotation.x = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color="#3BEA3B"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

/* ── Main orb mesh ── */
function OrbMesh({ mouseNorm }: { mouseNorm: React.MutableRefObject<{ x: number; y: number }> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const pulseRef = useRef(1.0);

  const uniforms = useMemo(
    () => ({
      uTime:  { value: 0 },
      uPulse: { value: 1.0 },
    }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = t;
      pulseRef.current = 1.0 + Math.sin(t * 0.8) * 0.025;
      matRef.current.uniforms.uPulse.value = pulseRef.current;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.12;
      meshRef.current.rotation.x = t * 0.05;
      // mouse tilt
      meshRef.current.rotation.z +=
        (-mouseNorm.current.x * 0.18 - meshRef.current.rotation.z) * 0.04;
      meshRef.current.rotation.x +=
        (mouseNorm.current.y * 0.1 - meshRef.current.rotation.x) * 0.02;
      meshRef.current.scale.setScalar(pulseRef.current);
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 6]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

/* ── Scene wrapper ── */
function Scene() {
  const mouseNorm = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseNorm.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <ambientLight intensity={0.05} />
      <OrbitLight />
      <OrbMesh mouseNorm={mouseNorm} />
      <OrbParticles />
    </>
  );
}

/* ── Export ── */
export default function FractalOrb() {
  return (
    <div className="w-[520px] h-[520px] max-w-[90vw] max-h-[90vw]">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
