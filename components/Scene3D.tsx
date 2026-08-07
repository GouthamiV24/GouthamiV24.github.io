"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";

// Scroll-driven camera controller
function ScrollCamera() {
  const { camera } = useThree();
  const scrollRef = useRef(0);
  const targetRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollFraction = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      targetRef.current = scrollFraction;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame(() => {
    // Smooth interpolation towards target scroll position
    scrollRef.current += (targetRef.current - scrollRef.current) * 0.05;
    const t = scrollRef.current;

    // Camera travels forward and slightly downward as user scrolls
    camera.position.z = 25 - t * 20;    // fly forward into the vortex
    camera.position.y = 5 - t * 8;       // descend slightly
    camera.rotation.x = -t * 0.15;       // subtle tilt downward
  });

  return null;
}

function ParticleVortex() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = 15000;
  
  // Generate a circular texture for smooth, glowing particles
  const circleTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.3, "rgba(255,255,255,0.8)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(32, 32, 32, 0, Math.PI * 2);
      context.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    
    const color1 = new THREE.Color("#a78bfa");
    const color2 = new THREE.Color("#22d3ee");
    const tempColor = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 20 + 2;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 40;
      const swirlAngle = angle + height * 0.2;
      
      pos[i * 3] = Math.cos(swirlAngle) * radius;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(swirlAngle) * radius;

      const mixRatio = radius / 22;
      tempColor.lerpColors(color1, color2, mixRatio);
      
      if (Math.random() > 0.92) {
        tempColor.setHex(0xffffff);
      }
      
      col[i * 3] = tempColor.r;
      col[i * 3 + 1] = tempColor.g;
      col[i * 3 + 2] = tempColor.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      pointsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 1.5;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        map={circleTexture}
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function GridFloor() {
  const gridRef = useRef<THREE.GridHelper>(null);
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.z = (state.clock.elapsedTime * 2) % 2;
    }
  });

  return (
    <gridHelper
      ref={gridRef}
      args={[100, 50, "#8b5cf6", "#06b6d4"]}
      position={[0, -10, 0]}
      rotation={[0, 0, 0]}
      material-opacity={0.2}
      material-transparent={true}
    />
  );
}

export default function Scene3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 5, 25], fov: 60 }}
        gl={{ antialias: false, alpha: true }}
      >
        <fog attach="fog" args={["#030014", 10, 40]} />
        <ScrollCamera />
        <ParticleVortex />
        <GridFloor />
      </Canvas>
    </div>
  );
}
