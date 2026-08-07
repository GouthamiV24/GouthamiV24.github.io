/* =========================================================
   ocean.js — 3D sunlit-water background
   Three.js r160 (ES modules via importmap)

   Contents
   -------------------------------------------------------
   1.  Capability + preference detection
   2.  Renderer / scene / camera
   3.  Procedural fish geometry (no external model)
   4.  Undulation shader (vertex wave + normal correction)
   5.  Boids-lite steering behaviour
   6.  Bubbles, plankton, caustics, god rays
   7.  Pointer parallax + fish avoidance
   8.  Render loop with visibility + reduced-motion guards
   ========================================================= */

import * as THREE from 'three';

/* ---------------------------------------------------------
   1. CAPABILITY DETECTION
   --------------------------------------------------------- */
const canvas = document.querySelector('#ocean-canvas');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarse = window.matchMedia('(pointer: coarse)').matches;
const isSmall = window.innerWidth < 768;

/** Progressive quality tier — keeps the main thread under budget on phones. */
const TIER = (() => {
  const mem = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  if (isSmall || mem <= 2 || cores <= 3) return 'low';
  if (mem <= 4 || cores <= 5) return 'mid';
  return 'high';
})();

const CONF = {
  low:  { bigFish: 3, schoolFish: 90,  bubbles: 90,  plankton: 260, dpr: 1.25, rays: 3, shadows: false },
  mid:  { bigFish: 5, schoolFish: 170, bubbles: 150, plankton: 420, dpr: 1.5,  rays: 4, shadows: false },
  high: { bigFish: 8, schoolFish: 280, bubbles: 220, plankton: 620, dpr: 1.75, rays: 6, shadows: false },
}[TIER];

/* Bail out gracefully if WebGL is unavailable — CSS gradients still carry the design. */
function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

const state = {
  running: true,
  paused: false,     // user-toggled
  visible: true,
  time: 0,
  pointer: new THREE.Vector2(0, 0),      // -1..1 normalised
  pointerSmooth: new THREE.Vector2(0, 0),
  pointerWorld: new THREE.Vector3(0, 0, 0),
  scroll: 0,
};

/* Expose a tiny API so ui.js can drive pause / progress without importing three. */
window.__ocean = {
  ready: false,
  setPaused(v) { state.paused = v; },
  isPaused() { return state.paused; },
};

/* ---------------------------------------------------------
   2. RENDERER / SCENE / CAMERA
   --------------------------------------------------------- */
let renderer, scene, camera, clock;
let fishes = [], school, bubbles, plankton, rays = [], caustics;
const shared = { uTime: { value: 0 } };

/* World bounds the creatures roam inside. */
const BOUNDS = new THREE.Vector3(30, 15, 20);

function init() {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: TIER === 'high',
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONF.dpr));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  scene = new THREE.Scene();
  // Fog matches the CSS water tone, so distant fish dissolve into the page
  // instead of ending on a hard silhouette edge.
  scene.fog = new THREE.FogExp2(0xdfeefb, 0.030);

  camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 160);
  camera.position.set(0, 0, 26);

  clock = new THREE.Clock();

  buildLights();
  buildFish();
  buildSchool();
  buildBubbles();
  buildPlankton();
  buildGodRays();
  buildCaustics();

  bindEvents();

  window.__ocean.ready = true;
  document.dispatchEvent(new CustomEvent('ocean:ready'));

  renderer.setAnimationLoop(tick);
}

/* ---------------------------------------------------------
   LIGHTS — cool key from above, violet rim from behind
   --------------------------------------------------------- */
function buildLights() {
  // Shallow water: bright sky above, pale sand bouncing light back up.
  scene.add(new THREE.HemisphereLight(0xe8f6ff, 0xa8c8e4, 1.5));

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(4, 18, 8);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x8b5cf6, 0.8);
  rim.position.set(-10, -4, -12);
  scene.add(rim);

  const bounce = new THREE.PointLight(0x38bdf8, 14, 60, 2);
  bounce.position.set(-8, 6, 12);
  scene.add(bounce);
}

/* =========================================================
   3. PROCEDURAL FISH GEOMETRY
   ---------------------------------------------------------
   Built from lofted elliptical cross-sections along +Z
   (nose at +Z so `lookAt` orients the fish along its heading),
   plus caudal / dorsal / pectoral fins merged into the same
   buffer so the whole animal is a single draw call.
   ========================================================= */

/** Catmull-Rom through the body silhouette control points. */
function bodyRadius(t) {
  const pts = [0.010, 0.115, 0.190, 0.240, 0.262, 0.268, 0.250, 0.212, 0.168, 0.120, 0.075, 0.038, 0.014];
  const x = t * (pts.length - 1);
  const i = Math.min(Math.floor(x), pts.length - 2);
  const f = x - i;
  const p0 = pts[Math.max(i - 1, 0)];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = pts[Math.min(i + 2, pts.length - 1)];
  return 0.5 * ((2 * p1) + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f * f + (-p0 + 3 * p1 - 3 * p2 + p3) * f * f * f);
}

function makeFishBody(len = 2.0, segs = 34, radial = 16) {
  const pos = [], nrm = [], uv = [], idx = [];
  const half = len / 2;

  for (let i = 0; i <= segs; i++) {
    const t = i / segs;                    // 0 = nose, 1 = tail base
    const z = half - t * len;
    const r = bodyRadius(t);
    const rx = r * 0.62;                   // laterally compressed
    const ry = r * 1.34;                   // taller than wide

    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const cx = Math.cos(a), sy = Math.sin(a);
      pos.push(cx * rx, sy * ry, z);
      nrm.push(cx / 0.62, sy / 1.34, 0);   // approximate — normalised below
      uv.push(j / radial, t);
    }
  }

  const row = radial + 1;
  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * row + j, b = a + row, c = b + 1, d = a + 1;
      idx.push(a, b, d, b, c, d);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.normalizeNormals();
  g.computeVertexNormals();
  return g;
}

/** Flat fin from a 2D outline, thickened slightly so it catches light. */
function makeFin(points, thickness = 0.018) {
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: thickness, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.006, bevelSegments: 1, curveSegments: 4,
  });
  g.translate(0, 0, -thickness / 2);
  return g;
}

/** Merge geometries without pulling in BufferGeometryUtils (keeps the import graph small).
 *  ExtrudeGeometry hands back non-indexed buffers, so synthesise a trivial index for those. */
function mergeGeoms(list) {
  const indexOf = (g) => g.index ? g.index.array : null;

  let vCount = 0, iCount = 0;
  for (const g of list) {
    const n = g.attributes.position.count;
    vCount += n;
    iCount += g.index ? g.index.count : n;
  }

  const position = new Float32Array(vCount * 3);
  const normal = new Float32Array(vCount * 3);
  const uv = new Float32Array(vCount * 2);
  const index = new Uint32Array(iCount);

  let vo = 0, io = 0;
  for (const g of list) {
    const n = g.attributes.position.count;
    position.set(g.attributes.position.array, vo * 3);
    if (g.attributes.normal) normal.set(g.attributes.normal.array, vo * 3);
    if (g.attributes.uv) uv.set(g.attributes.uv.array, vo * 2);

    const gi = indexOf(g);
    if (gi) {
      for (let k = 0; k < gi.length; k++) index[io + k] = gi[k] + vo;
      io += gi.length;
    } else {
      for (let k = 0; k < n; k++) index[io + k] = k + vo;
      io += n;
    }
    vo += n;
  }

  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(position, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  out.setIndex(new THREE.BufferAttribute(index, 1));
  return out;
}

function makeFishGeometry(len = 2.0) {
  const half = len / 2;
  const parts = [makeFishBody(len)];

  // caudal (tail) fin — lives in the Y/Z plane, behind the body
  const tail = makeFin([[0, 0], [-0.52, 0.46], [-0.40, 0.02], [-0.52, -0.46]], 0.02);
  tail.rotateY(Math.PI / 2);                 // shape XY -> ZY
  tail.translate(0, 0, -half + 0.02);
  parts.push(tail);

  // dorsal fin — along the spine
  const dorsal = makeFin([[0.34, 0], [0.02, 0.30], [-0.34, 0.06], [-0.34, 0]], 0.016);
  dorsal.rotateY(Math.PI / 2);
  dorsal.translate(0, bodyRadius(0.34) * 1.24, 0.02);
  parts.push(dorsal);

  // anal fin — underside, smaller mirror of the dorsal
  const anal = makeFin([[0.22, 0], [-0.02, -0.20], [-0.26, -0.02], [-0.26, 0]], 0.014);
  anal.rotateY(Math.PI / 2);
  anal.translate(0, -bodyRadius(0.62) * 1.2, -0.24);
  parts.push(anal);

  // pectoral fins — one per side, angled outward
  for (const side of [1, -1]) {
    const pec = makeFin([[0.16, 0], [-0.10, 0.16], [-0.26, -0.02], [-0.10, -0.08]], 0.012);
    pec.rotateX(Math.PI / 2);
    pec.rotateZ(side * 0.42);
    pec.translate(side * bodyRadius(0.30) * 0.55, -0.03, 0.16);
    parts.push(pec);
  }

  const geo = mergeGeoms(parts);
  geo.computeBoundingSphere();
  geo.userData.len = len;
  return geo;
}

/* ---------------------------------------------------------
   4. UNDULATION SHADER
   ---------------------------------------------------------
   Lateral sine travelling nose -> tail, amplitude ramped by
   a power curve so the head barely moves and the tail sweeps.
   The normal is counter-rotated by the analytic slope so
   lighting stays correct while the body bends.
   --------------------------------------------------------- */
function makeFishMaterial({ body, belly, glow, len, speed, phase, amp }) {
  const mat = new THREE.MeshStandardMaterial({
    color: body,
    roughness: 0.42,
    metalness: 0.18,
    // Barely-there emissive: against pale water a strong glow reads as
    // washed-out haze rather than as light.
    emissive: new THREE.Color(glow).multiplyScalar(0.05),
    side: THREE.DoubleSide,
    flatShading: false,
  });

  mat.userData.u = {
    uTime: shared.uTime,
    uPhase: { value: phase },
    uSpeed: { value: speed },
    uAmp: { value: amp },
    uLen: { value: len },
    uBelly: { value: new THREE.Color(belly) },
    uGlow: { value: new THREE.Color(glow) },
  };

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, mat.userData.u);

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', /* glsl */`
        #include <common>
        uniform float uTime, uPhase, uSpeed, uAmp, uLen;
        varying float vBellyY;
      `)
      .replace('#include <beginnormal_vertex>', /* glsl */`
        #include <beginnormal_vertex>
        {
          // t: 0 at nose, 1 at tail tip
          float t = clamp((uLen * 0.5 - position.z) / uLen, 0.0, 1.0);
          float mask = pow(t, 1.9);
          // d(wave)/dz — used to tilt the normal with the body bend
          float slope = cos(t * 7.0 - uTime * uSpeed + uPhase) * (-7.0 / uLen) * mask * uAmp;
          float a = atan(slope);
          float ca = cos(a), sa = sin(a);
          objectNormal = normalize(vec3(
            ca * objectNormal.x - sa * objectNormal.z,
            objectNormal.y,
            sa * objectNormal.x + ca * objectNormal.z
          ));
        }
      `)
      .replace('#include <begin_vertex>', /* glsl */`
        #include <begin_vertex>
        {
          float t = clamp((uLen * 0.5 - transformed.z) / uLen, 0.0, 1.0);
          float mask = pow(t, 1.9);
          transformed.x += sin(t * 7.0 - uTime * uSpeed + uPhase) * mask * uAmp;
          // subtle vertical glide so the swim never looks like a flat sine
          transformed.y += sin(uTime * uSpeed * 0.33 + uPhase) * 0.012;
          vBellyY = transformed.y;
        }
      `);

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', /* glsl */`
        #include <common>
        uniform vec3 uBelly, uGlow;
        varying float vBellyY;
      `)
      .replace('#include <color_fragment>', /* glsl */`
        #include <color_fragment>
        // countershading: lighter belly, saturated dorsal surface
        diffuseColor.rgb = mix(uBelly, diffuseColor.rgb, smoothstep(-0.16, 0.13, vBellyY));
      `)
      .replace('#include <emissivemap_fragment>', /* glsl */`
        #include <emissivemap_fragment>
        // iridescent fresnel rim, dialled back for the light background
        float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 3.0);
        totalEmissiveRadiance += uGlow * fres * 0.26;
      `);
  };

  // All fish share one shader program — only uniform values differ, so there is
  // no reason to force a unique compile per fish.
  return mat;
}

/* ---------------------------------------------------------
   5. FISH INSTANCES + STEERING
   --------------------------------------------------------- */
/* Light-water palette: saturated backs so each fish reads against pale water,
   and mid-tone bellies — a near-white belly simply vanishes on this background. */
const PALETTE = [
  { body: 0x0e6f8c, belly: 0x8fd3e8, glow: 0x22d3ee },
  { body: 0x4c2fa0, belly: 0xb9a8f0, glow: 0xa78bfa },
  { body: 0x0b6b78, belly: 0x8ee0d4, glow: 0x2dd4bf },
  { body: 0x8a2f60, belly: 0xf0a8c8, glow: 0xf472b6 },
  { body: 0x1f4f96, belly: 0x9ec4f0, glow: 0x60a5fa },
];

function buildFish() {
  for (let i = 0; i < CONF.bigFish; i++) {
    const len = 1.5 + Math.random() * 1.5;
    const pal = PALETTE[i % PALETTE.length];
    const phase = Math.random() * Math.PI * 2;

    const geo = makeFishGeometry(len);
    const mat = makeFishMaterial({
      ...pal,
      len,
      phase,
      speed: 5.0 + Math.random() * 2.2,
      amp: 0.10 + Math.random() * 0.05,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * BOUNDS.x * 1.6,
      (Math.random() - 0.5) * BOUNDS.y * 1.4,
      -6 - Math.random() * 22
    );

    mesh.userData = {
      heading: new THREE.Vector3(Math.random() - 0.5, (Math.random() - 0.5) * 0.25, Math.random() - 0.5).normalize(),
      speed: 1.5 + Math.random() * 1.4,
      wander: Math.random() * 100,
      roll: 0,
      lookTarget: new THREE.Vector3(),
    };

    scene.add(mesh);
    fishes.push(mesh);
  }
}

/** Cheap deterministic wander — three offset sines beat a real noise import here. */
function wanderVec(seed, t, out) {
  out.set(
    Math.sin(t * 0.31 + seed) + 0.6 * Math.sin(t * 0.73 + seed * 2.1),
    0.35 * Math.sin(t * 0.24 + seed * 1.7),
    Math.cos(t * 0.27 + seed * 1.3) + 0.6 * Math.cos(t * 0.61 + seed * 0.7)
  );
  return out.normalize();
}

const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3(), _v3 = new THREE.Vector3();

function updateFish(dt, t) {
  for (const f of fishes) {
    const d = f.userData;

    // 1. wander
    const desired = wanderVec(d.wander, t, _v1);

    // 2. stay inside the world box
    _v2.set(0, 0, 0);
    if (Math.abs(f.position.x) > BOUNDS.x) _v2.x = -Math.sign(f.position.x) * 2.2;
    if (Math.abs(f.position.y) > BOUNDS.y) _v2.y = -Math.sign(f.position.y) * 2.6;
    if (f.position.z > 6) _v2.z = -2.0;
    if (f.position.z < -34) _v2.z = 2.0;
    desired.add(_v2);

    // 3. shy away from the pointer
    _v3.subVectors(f.position, state.pointerWorld);
    const dist = _v3.length();
    if (dist < 9) desired.add(_v3.normalize().multiplyScalar((9 - dist) * 0.34));

    desired.normalize();

    // steer: slerp-ish blend, then bank into the turn
    const turn = desired.clone().sub(d.heading);
    d.roll = THREE.MathUtils.lerp(d.roll, -turn.x * 1.5, 1 - Math.pow(0.001, dt));
    d.heading.addScaledVector(turn, Math.min(1, dt * 1.5)).normalize();

    f.position.addScaledVector(d.heading, d.speed * dt);

    d.lookTarget.copy(f.position).add(d.heading);
    f.lookAt(d.lookTarget);
    f.rotateZ(d.roll);
  }
}

/* ---------------------------------------------------------
   6a. SCHOOL — a shoal of tiny fish as GPU points
   --------------------------------------------------------- */
function buildSchool() {
  const n = CONF.schoolFish;
  const pos = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  const size = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 46;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 22;
    pos[i * 3 + 2] = -8 - Math.random() * 26;
    seed[i] = Math.random() * 100;
    size[i] = 2.2 + Math.random() * 4.2;
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));

  const m = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    // Normal blending, not additive: additive *adds* light, which is invisible
    // against a near-white page. Every particle system here inks downward.
    uniforms: { uTime: shared.uTime, uColor: { value: new THREE.Color(0x0e7490) } },
    vertexShader: /* glsl */`
      attribute float aSeed, aSize;
      uniform float uTime;
      varying float vFade;
      void main() {
        vec3 p = position;
        float t = uTime * 0.5 + aSeed;
        // shoal drifts as a body, individuals jitter within it
        p.x += sin(t * 0.7) * 3.4 + sin(t * 2.6 + aSeed) * 0.35;
        p.y += cos(t * 0.5) * 1.3 + cos(t * 3.1 + aSeed) * 0.22;
        p.z += sin(t * 0.35 + aSeed * 0.5) * 2.2;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aSize * (240.0 / max(-mv.z, 0.001));
        gl_Position = projectionMatrix * mv;
        vFade = smoothstep(-46.0, -6.0, mv.z);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uColor;
      varying float vFade;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        // squash the sprite into a fish-ish lozenge
        float d = length(vec2(c.x * 0.7, c.y * 1.9));
        float a = smoothstep(0.5, 0.06, d);
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor, a * 0.34 * vFade);
      }
    `,
  });

  school = new THREE.Points(g, m);
  scene.add(school);
}

/* ---------------------------------------------------------
   6b. BUBBLES — rise, wobble, wrap
   --------------------------------------------------------- */
function buildBubbles() {
  const n = CONF.bubbles;
  const pos = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  const size = new Float32Array(n);
  const rate = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 54;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 44;
    pos[i * 3 + 2] = -2 - Math.random() * 30;
    seed[i] = Math.random() * 100;
    size[i] = 1.5 + Math.random() * 6;
    rate[i] = 0.5 + Math.random() * 1.5;
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  g.setAttribute('aRate', new THREE.BufferAttribute(rate, 1));

  const m = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: shared.uTime, uSpan: { value: 44.0 } },
    vertexShader: /* glsl */`
      attribute float aSeed, aSize, aRate;
      uniform float uTime, uSpan;
      varying float vFade;
      void main() {
        vec3 p = position;
        float y = p.y + uTime * aRate * 1.4;
        p.y = mod(y + uSpan * 0.5, uSpan) - uSpan * 0.5;
        float t = uTime * aRate + aSeed;
        p.x += sin(t * 1.6) * 0.42;
        p.z += cos(t * 1.2) * 0.42;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aSize * (200.0 / max(-mv.z, 0.001));
        gl_Position = projectionMatrix * mv;
        vFade = smoothstep(-44.0, -4.0, mv.z);
      }
    `,
    fragmentShader: /* glsl */`
      varying float vFade;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        // thin bright shell + faint interior = bubble read
        float shell = smoothstep(0.5, 0.42, d) * smoothstep(0.30, 0.42, d);
        float fill  = smoothstep(0.5, 0.0, d) * 0.14;
        float hi    = smoothstep(0.16, 0.0, length(c - vec2(-0.13, 0.13))) * 0.55;
        float a = (shell * 0.75 + fill + hi) * vFade;
        // Teal ink, not white: a white bubble on pale water has nothing to show against.
        gl_FragColor = vec4(vec3(0.16, 0.52, 0.66), a * 0.46);
      }
    `,
  });

  bubbles = new THREE.Points(g, m);
  scene.add(bubbles);
}

/* ---------------------------------------------------------
   6c. PLANKTON — depth-cue motes
   --------------------------------------------------------- */
function buildPlankton() {
  const n = CONF.plankton;
  const pos = new Float32Array(n * 3);
  const seed = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 70;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 44;
    pos[i * 3 + 2] = 4 - Math.random() * 44;
    seed[i] = Math.random() * 100;
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

  const m = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uTime: shared.uTime },
    vertexShader: /* glsl */`
      attribute float aSeed;
      uniform float uTime;
      varying float vTw;
      void main() {
        vec3 p = position;
        float t = uTime * 0.22 + aSeed;
        p.x += sin(t) * 0.7;
        p.y += cos(t * 0.8) * 0.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (1.0 + mod(aSeed, 2.0)) * (110.0 / max(-mv.z, 0.001));
        gl_Position = projectionMatrix * mv;
        vTw = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 1.6 + aSeed * 3.0));
      }
    `,
    fragmentShader: /* glsl */`
      varying float vTw;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vec3(0.26, 0.48, 0.64), a * 0.26 * vTw);
      }
    `,
  });

  plankton = new THREE.Points(g, m);
  scene.add(plankton);
}

/* ---------------------------------------------------------
   6d. GOD RAYS — tinted light shafts from the surface
   --------------------------------------------------------- */
function buildGodRays() {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uTime: shared.uTime, uSeed: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime, uSeed;
      varying vec2 vUv;
      void main() {
        float edge = smoothstep(0.0, 0.42, vUv.x) * smoothstep(1.0, 0.58, vUv.x);
        float fall = pow(1.0 - vUv.y, 1.7);
        float shimmer = 0.75 + 0.25 * sin(uTime * 0.6 + uSeed + vUv.y * 5.0);
        // Tinted shafts rather than added light — the sunbeam reads as a
        // faint blue column of water, which is what you actually see from below.
        gl_FragColor = vec4(vec3(0.46, 0.74, 0.92), edge * fall * shimmer * 0.15);
      }
    `,
  });

  for (let i = 0; i < CONF.rays; i++) {
    const m = mat.clone();
    m.uniforms.uTime = shared.uTime;
    m.uniforms.uSeed = { value: Math.random() * 10 };

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(6 + Math.random() * 6, 46), m);
    mesh.position.set((Math.random() - 0.5) * 52, 12, -12 - Math.random() * 22);
    mesh.rotation.z = (Math.random() - 0.5) * 0.34;
    mesh.userData.baseRot = mesh.rotation.z;
    mesh.userData.seed = Math.random() * 10;

    scene.add(mesh);
    rays.push(mesh);
  }
}

/* ---------------------------------------------------------
   6e. CAUSTICS — animated interference plane near the surface
   --------------------------------------------------------- */
function buildCaustics() {
  const m = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: { uTime: shared.uTime },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform float uTime;
      varying vec2 vUv;

      // stacked sine interference -> water-caustic look, no texture needed
      float caustic(vec2 uv, float t) {
        vec2 p = uv * 7.0;
        float v = 0.0;
        for (int i = 0; i < 3; i++) {
          float fi = float(i);
          v += sin(p.x * 1.3 + t * 0.7 + fi * 1.4) * sin(p.y * 1.1 - t * 0.55 + fi * 2.1);
          p *= 1.72;
        }
        return v / 3.0;
      }

      void main() {
        float c = caustic(vUv, uTime);
        float bright = pow(abs(c), 3.0) * 2.6;
        float vig = smoothstep(0.0, 0.34, vUv.y) * smoothstep(1.0, 0.66, vUv.y)
                  * smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
        gl_FragColor = vec4(vec3(0.42, 0.72, 0.90), bright * vig * 0.20);
      }
    `,
  });

  caustics = new THREE.Mesh(new THREE.PlaneGeometry(90, 60), m);
  caustics.rotation.x = -Math.PI / 2.35;
  caustics.position.set(0, 15, -14);
  scene.add(caustics);
}

/* ---------------------------------------------------------
   7. EVENTS
   --------------------------------------------------------- */
function bindEvents() {
  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONF.dpr));
    });
  }, { passive: true });

  if (!isCoarse) {
    window.addEventListener('pointermove', (e) => {
      state.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      state.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });
  }

  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    state.scroll = max > 0 ? window.scrollY / max : 0;
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    state.visible = !document.hidden;
  });
}

/* ---------------------------------------------------------
   8. RENDER LOOP
   --------------------------------------------------------- */
function tick() {
  // Skip all work when hidden or user-paused — zero main-thread cost.
  if (!state.visible || state.paused) { clock.getDelta(); return; }

  const dt = Math.min(clock.getDelta(), 0.05);   // clamp so tab-return doesn't teleport fish
  state.time += dt;
  shared.uTime.value = state.time;

  // smoothed pointer -> camera parallax
  state.pointerSmooth.lerp(state.pointer, 1 - Math.pow(0.0015, dt));
  const px = state.pointerSmooth.x, py = state.pointerSmooth.y;

  if (!reduceMotion) {
    camera.position.x += (px * 3.2 - camera.position.x) * Math.min(1, dt * 2.2);
    camera.position.y += (py * 1.9 + state.scroll * 4.0 - camera.position.y) * Math.min(1, dt * 2.2);
    camera.lookAt(0, state.scroll * 2.0, -8);
  }

  // pointer projected to the fish plane so they can dodge it
  state.pointerWorld.set(px * 18, py * 11, -8);

  if (!reduceMotion) {
    updateFish(dt, state.time);

    for (const r of rays) {
      r.rotation.z = r.userData.baseRot + Math.sin(state.time * 0.22 + r.userData.seed) * 0.055;
    }
    if (caustics) caustics.position.x = Math.sin(state.time * 0.1) * 2.4;
  } else {
    // reduced motion: hold a still, composed frame
    for (const f of fishes) f.lookAt(f.position.clone().add(f.userData.heading));
  }

  renderer.render(scene, camera);
}

/* ---------------------------------------------------------
   9. BOOT
   Must run last: init() touches the `let` bindings above, so
   calling it any earlier hits the temporal dead zone.
   --------------------------------------------------------- */
if (!webglAvailable()) {
  canvas?.remove();
  document.dispatchEvent(new CustomEvent('ocean:ready'));
} else {
  init();
}
