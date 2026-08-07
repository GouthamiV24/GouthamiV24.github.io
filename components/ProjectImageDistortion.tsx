"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform float uHover;
uniform float uTime;
varying vec2 vUv;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = vUv;
  
  // Create a watery ripple effect based on time and hover state
  float noise = snoise(uv * 4.0 + uTime * 0.5);
  vec2 distortion = vec2(noise * 0.05, noise * 0.05) * uHover;
  
  // Sample the texture with the distortion
  vec4 color = texture2D(tDiffuse, uv + distortion);
  
  // Add a slight color shift based on distortion
  color.r += distortion.x * 2.0 * uHover;
  color.b += distortion.y * 2.0 * uHover;

  gl_FragColor = color;
}
`;

function DistortionMaterial({ imageSrc, isHovered }: { imageSrc: string; isHovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load(imageSrc);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [imageSrc]);

  const uniforms = useMemo(() => ({
    tDiffuse: { value: texture },
    uHover: { value: 0.0 },
    uTime: { value: 0.0 }
  }), [texture]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value += delta;
      
      // Smoothly interpolate the hover state
      const targetHover = isHovered ? 1.0 : 0.0;
      material.uniforms.uHover.value += (targetHover - material.uniforms.uHover.value) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function ProjectImageDistortion({ src, isHovered }: { src: string; isHovered: boolean }) {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
        <DistortionMaterial imageSrc={src} isHovered={isHovered} />
      </Canvas>
    </div>
  );
}
