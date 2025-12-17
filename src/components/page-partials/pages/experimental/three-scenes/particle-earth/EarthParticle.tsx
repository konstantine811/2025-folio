import { useCallback, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import {
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
  AfterimagePass,
} from "three-stdlib";
import { OutputPass } from "three/examples/jsm/Addons.js";

const PARTICLE_COUNT = 15000;
const SPARK_COUNT = 2000;
const STAR_COUNT = 7000;
const morphSpeed = 0.03;

type MorphData = {
  from: Float32Array;
  to: Float32Array;
  next: number;
};

function normalise(points: THREE.Vector3[], size: number) {
  if (points.length === 0) return [];
  const box = new THREE.Box3().setFromPoints(points);
  const maxDim = Math.max(...box.getSize(new THREE.Vector3()).toArray()) || 1;
  const centre = box.getCenter(new THREE.Vector3());
  return points.map((p) =>
    p
      .clone()
      .sub(centre)
      .multiplyScalar(size / maxDim)
  );
}

function torusKnot(n: number) {
  const geometry = new THREE.TorusKnotGeometry(10, 3, 200, 16, 2, 3);
  const points: THREE.Vector3[] = [];
  const positionAttribute = geometry.attributes
    .position as THREE.BufferAttribute;
  for (let i = 0; i < positionAttribute.count; i++) {
    points.push(new THREE.Vector3().fromBufferAttribute(positionAttribute, i));
  }
  const result: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    result.push(points[i % points.length].clone());
  }
  geometry.dispose();
  return normalise(result, 50);
}

function halvorsen(n: number) {
  const pts: THREE.Vector3[] = [];
  let x = 0.1,
    y = 0,
    z = 0;
  const a = 1.89;
  const dt = 0.005;
  for (let i = 0; i < n * 25; i++) {
    const dx = -a * x - 4 * y - 4 * z - y * y;
    const dy = -a * y - 4 * z - 4 * x - z * z;
    const dz = -a * z - 4 * x - 4 * y - x * x;
    x += dx * dt;
    y += dy * dt;
    z += dz * dt;
    if (i > 200 && i % 25 === 0) {
      pts.push(new THREE.Vector3(x, y, z));
    }
    if (pts.length >= n) break;
  }
  while (pts.length < n)
    pts.push(pts[Math.floor(Math.random() * pts.length)].clone());
  return normalise(pts, 60);
}

function dualHelix(n: number) {
  const pts: THREE.Vector3[] = [];
  const turns = 5;
  const radius = 15;
  const height = 40;
  for (let i = 0; i < n; i++) {
    const isSecondHelix = i % 2 === 0;
    const angle = (i / n) * Math.PI * 2 * turns;
    const y = (i / n) * height - height / 2;
    const r = radius + (isSecondHelix ? 5 : -5);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    pts.push(new THREE.Vector3(x, y, z));
  }
  return normalise(pts, 60);
}

function deJong(n: number) {
  const pts: THREE.Vector3[] = [];
  let x = 0.1,
    y = 0.1;
  const a = 1.4,
    b = -2.3,
    c = 2.4,
    d = -2.1;
  for (let i = 0; i < n; i++) {
    const xn = Math.sin(a * y) - Math.cos(b * x);
    const yn = Math.sin(c * x) - Math.cos(d * y);
    x = xn;
    y = yn;
    const z = Math.sin(x * y * 0.5);
    pts.push(new THREE.Vector3(x, y, z));
  }
  return normalise(pts, 55);
}

function earthShape(n: number, maskTexture?: THREE.Texture): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const RADIUS = 50;
  const MASK_THRESHOLD = 0.1;

  if (!maskTexture || !maskTexture.image) {
    // Якщо текстура не завантажена, генеруємо випадкові точки на сфері
    for (let i = 0; i < n; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = RADIUS * Math.sin(phi) * Math.sin(theta);
      const z = RADIUS * Math.cos(phi);
      pts.push(new THREE.Vector3(x, y, z));
    }
    return normalise(pts, 50);
  }

  const img = maskTexture.image as HTMLImageElement;
  const w = img.naturalWidth || 0;
  const h = img.naturalHeight || 0;

  if (w === 0 || h === 0) {
    return normalise(pts, 50);
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;

  // Генеруємо точки на основі маски
  let attempts = 0;
  const maxAttempts = n * 10; // Максимальна кількість спроб

  while (pts.length < n && attempts < maxAttempts) {
    attempts++;
    const u = Math.random();
    const v = Math.random();
    const maskX = Math.floor(u * w);
    const maskY = Math.floor(v * h);
    const maskIdx = (maskY * w + maskX) * 4;

    if (maskIdx >= data.length) continue;

    const lum =
      (data[maskIdx] + data[maskIdx + 1] + data[maskIdx + 2]) / (3 * 255);

    // Якщо на континенті (світла область)
    if (lum >= MASK_THRESHOLD) {
      const theta = u * Math.PI * 2;
      const phi = v * Math.PI;
      const sx = -Math.sin(phi) * Math.sin(theta);
      const sy = Math.cos(phi);
      const sz = -Math.sin(phi) * Math.cos(theta);
      const jitter = (Math.random() - 0.5) * 0.01;
      pts.push(
        new THREE.Vector3(
          (sx + jitter) * RADIUS,
          (sy + jitter) * RADIUS,
          (sz + jitter) * RADIUS
        )
      );
    }
  }

  // Якщо не набрали достатньо точок, додаємо випадкові на сфері
  while (pts.length < n) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = RADIUS * Math.sin(phi) * Math.cos(theta);
    const y = RADIUS * Math.sin(phi) * Math.sin(theta);
    const z = RADIUS * Math.cos(phi);
    pts.push(new THREE.Vector3(x, y, z));
  }

  return normalise(pts, 50);
}

const PATTERNS = [torusKnot, halvorsen, dualHelix, deJong];

function createStars() {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(STAR_COUNT * 3);
  const col = new Float32Array(STAR_COUNT * 3);
  const size = new Float32Array(STAR_COUNT);
  const rnd = new Float32Array(STAR_COUNT);
  const R = 900;

  for (let i = 0; i < STAR_COUNT; i++) {
    const i3 = i * 3;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = R * Math.cbrt(Math.random());

    pos[i3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i3 + 2] = r * Math.cos(phi);

    const c = new THREE.Color().setHSL(
      Math.random() * 0.6,
      0.3 + 0.3 * Math.random(),
      0.55 + 0.35 * Math.random()
    );
    col[i3] = c.r;
    col[i3 + 1] = c.g;
    col[i3 + 2] = c.b;

    size[i] = 0.25 + Math.pow(Math.random(), 4) * 2.1;
    rnd[i] = Math.random() * Math.PI * 2;
  }

  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("random", new THREE.BufferAttribute(rnd, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      attribute float size;
      attribute float random;
      varying vec3 vColor;
      varying float vRnd;
      void main(){
        vColor = color;
        vRnd = random;
        vec4 mv = modelViewMatrix * vec4(position,1.);
        gl_PointSize = size * (250. / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float time;
      varying vec3 vColor;
      varying float vRnd;
      void main(){
        vec2 uv = gl_PointCoord - .5;
        float d = length(uv);
        float a = 1. - smoothstep(.4,.5,d);
        a *= .7 + .3 * sin(time*(.6+vRnd*.3)+vRnd*5.);
        if (a < .02) discard;
        gl_FragColor = vec4(vColor, a);
      }`,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geo, mat);
}

function makeParticles(count: number, palette: THREE.Color[]) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const rnd = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const base = palette[(Math.random() * palette.length) | 0];
    const hsl = { h: 0, s: 0, l: 0 };
    base.getHSL(hsl);
    hsl.h += (Math.random() - 0.5) * 0.05;
    hsl.s = Math.min(1, Math.max(0.7, hsl.s + (Math.random() - 0.5) * 0.3));
    hsl.l = Math.min(0.9, Math.max(0.5, hsl.l + (Math.random() - 0.5) * 0.4));
    const c = new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
    col[i3] = c.r;
    col[i3 + 1] = c.g;
    col[i3 + 2] = c.b;
    size[i] = 0.7 + Math.random() * 1.1;
    rnd[i3] = Math.random() * 10;
    rnd[i3 + 1] = Math.random() * Math.PI * 2;
    rnd[i3 + 2] = 0.5 + 0.5 * Math.random();
  }

  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("random", new THREE.BufferAttribute(rnd, 3));

  const mat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, hueSpeed: { value: 0.12 } },
    vertexShader: `
      uniform float time;
      attribute float size;
      attribute vec3 random;
      varying vec3 vCol;
      varying float vR;
      void main(){
        vCol = color;
        vR = random.z;
        vec3 p = position;
        float t = time * .25 * random.z;
        float ax = t + random.y;
        float ay = t * .75 + random.x;
        float amp = (.6 + sin(random.x + t * .6) * .3) * random.z;
        p.x += sin(ax + p.y * .06 + random.x * .1) * amp;
        p.y += cos(ay + p.z * .06 + random.y * .1) * amp;
        p.z += sin(ax * .85 + p.x * .06 + random.z * .1) * amp;
        vec4 mv = modelViewMatrix * vec4(p,1.);
        float pulse = .9 + .1 * sin(time * 1.15 + random.y);
        gl_PointSize = size * pulse * (350. / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float time;
      uniform float hueSpeed;
      varying vec3 vCol;
      varying float vR;

      vec3 hueShift(vec3 c, float h) {
          const vec3 k = vec3(0.57735);
          float cosA = cos(h);
          float sinA = sin(h);
          return c * cosA + cross(k, c) * sinA + k * dot(k, c) * (1.0 - cosA);
      }

      void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float core = smoothstep(0.05, 0.0, d);
          float angle = atan(uv.y, uv.x);
          float flare = pow(max(0.0, sin(angle * 6.0 + time * 2.0 * vR)), 4.0);
          flare *= smoothstep(0.5, 0.0, d);
          float glow = smoothstep(0.4, 0.1, d);
          float alpha = core * 1.0 + flare * 0.5 + glow * 0.2;
          vec3 color = hueShift(vCol, time * hueSpeed);
          vec3 finalColor = mix(color, vec3(1.0, 0.95, 0.9), core);
          finalColor = mix(finalColor, color, flare * 0.5 + glow * 0.5);
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(finalColor, alpha);
      }`,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geo, mat);
}

function createSparkles(count: number) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const rnd = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    size[i] = 0.5 + Math.random() * 0.8;
    rnd[i * 3] = Math.random() * 10;
    rnd[i * 3 + 1] = Math.random() * Math.PI * 2;
    rnd[i * 3 + 2] = 0.5 + 0.5 * Math.random();
  }

  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("size", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("random", new THREE.BufferAttribute(rnd, 3));

  const mat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      uniform float time;
      attribute float size;
      attribute vec3 random;
      void main() {
          vec3 p = position;
          float t = time * 0.25 * random.z;
          float ax = t + random.y, ay = t * 0.75 + random.x;
          float amp = (0.6 + sin(random.x + t * 0.6) * 0.3) * random.z;
          p.x += sin(ax + p.y * 0.06 + random.x * 0.1) * amp;
          p.y += cos(ay + p.z * 0.06 + random.y * 0.1) * amp;
          p.z += sin(ax * 0.85 + p.x * 0.06 + random.z * 0.1) * amp;
          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
      }`,
    fragmentShader: `
      uniform float time;
      void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          float alpha = 1.0 - smoothstep(0.4, 0.5, d);
          if (alpha < 0.01) discard;
          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geo, mat);
}

function usePostprocessing() {
  const { gl, scene, camera, size } = useThree();
  const composerRef = useRef<EffectComposer | null>(null);

  useEffect(() => {
    const composer = new EffectComposer(gl);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(size.width, size.height),
        0.45,
        0.5,
        0.85
      )
    );
    const after = new AfterimagePass();
    after.uniforms.damp.value = 0.92;
    composer.addPass(after);
    composer.addPass(new OutputPass());
    composer.setSize(size.width, size.height);
    composerRef.current = composer;

    return () => {
      composer.dispose();
      composerRef.current = null;
    };
  }, [gl, scene, camera, size.width, size.height]);

  useEffect(() => {
    composerRef.current?.setSize(size.width, size.height);
  }, [size.width, size.height]);

  useFrame((_, delta) => {
    if (composerRef.current) {
      composerRef.current.render(delta);
    }
  }, 1);
}

function MorphingScene({
  onReady,
}: {
  onReady?: (controls: { beginMorph: () => void }) => void;
}) {
  const { scene } = useThree();
  const clockRef = useRef(new THREE.Clock());
  const particlesRef = useRef<THREE.Points | null>(null);
  const sparklesRef = useRef<THREE.Points | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const currentPatternRef = useRef(0);
  const isTransRef = useRef(false);
  const progRef = useRef(0);
  const morphDataRef = useRef<MorphData | null>(null);

  // Завантажуємо текстуру маски Землі
  const earthMask = useTexture("/images/textures/earth/earth.png");

  // Створюємо функцію earthShape з замиканням для текстури
  const earthShapeWithTexture = useCallback(
    (n: number) => earthShape(n, earthMask),
    [earthMask]
  );

  // Додаємо форму Землі до списку патернів
  const patterns = useMemo(
    () => [...PATTERNS, earthShapeWithTexture],
    [earthShapeWithTexture]
  );

  usePostprocessing();

  const applyPattern = useCallback(
    (i: number) => {
      const particles = particlesRef.current;
      const sparkles = sparklesRef.current;
      if (!particles || !sparkles) return;

      const pts = patterns[i](PARTICLE_COUNT);
      const particleArr = particles.geometry.attributes.position
        .array as Float32Array;
      const sparkleArr = sparkles.geometry.attributes.position
        .array as Float32Array;

      for (let j = 0; j < PARTICLE_COUNT; j++) {
        const idx = j * 3;
        const p = pts[j] || new THREE.Vector3();
        particleArr[idx] = p.x;
        particleArr[idx + 1] = p.y;
        particleArr[idx + 2] = p.z;
        if (j < SPARK_COUNT) {
          sparkleArr[idx] = p.x;
          sparkleArr[idx + 1] = p.y;
          sparkleArr[idx + 2] = p.z;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      sparkles.geometry.attributes.position.needsUpdate = true;
    },
    [patterns]
  );

  const beginMorph = useCallback(() => {
    const particles = particlesRef.current;
    if (!particles) return;
    if (isTransRef.current) return;

    isTransRef.current = true;
    progRef.current = 0;

    const next = (currentPatternRef.current + 1) % patterns.length;
    const fromPts = (
      particles.geometry.attributes.position.array as Float32Array
    ).slice() as Float32Array;
    const toPts = patterns[next](PARTICLE_COUNT);
    const to = new Float32Array(PARTICLE_COUNT * 3);

    if (toPts.length > 0) {
      for (let j = 0; j < PARTICLE_COUNT; j++) {
        const idx = j * 3;
        const p = toPts[j];
        to[idx] = p.x;
        to[idx + 1] = p.y;
        to[idx + 2] = p.z;
      }
      morphDataRef.current = { from: fromPts, to, next };
    }
  }, [patterns]);

  useEffect(() => {
    scene.fog = new THREE.FogExp2(0x050203, 0.012);

    const stars = createStars();
    const palette = [
      0xff3c78, 0xff8c00, 0xfff200, 0x00cfff, 0xb400ff, 0xffffff, 0xff4040,
    ].map((c) => new THREE.Color(c));
    const particles = makeParticles(PARTICLE_COUNT, palette);
    const sparkles = createSparkles(SPARK_COUNT);

    starsRef.current = stars;
    particlesRef.current = particles;
    sparklesRef.current = sparkles;

    scene.add(stars);
    scene.add(particles);
    scene.add(sparkles);

    applyPattern(currentPatternRef.current);

    return () => {
      scene.remove(stars);
      scene.remove(particles);
      scene.remove(sparkles);

      stars.geometry.dispose();
      (stars.material as THREE.Material).dispose();
      particles.geometry.dispose();
      (particles.material as THREE.Material).dispose();
      sparkles.geometry.dispose();
      (sparkles.material as THREE.Material).dispose();
    };
  }, [scene, applyPattern]);

  useEffect(() => {
    onReady?.({ beginMorph });
  }, [onReady, beginMorph]);

  useFrame(() => {
    const t = clockRef.current.getElapsedTime();

    if (particlesRef.current) {
      const mat = particlesRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.time.value = t;
    }
    if (sparklesRef.current) {
      const mat = sparklesRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.time.value = t;
    }
    if (starsRef.current) {
      const mat = starsRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms.time) {
        mat.uniforms.time.value = t;
      }
    }

    if (
      isTransRef.current &&
      morphDataRef.current &&
      particlesRef.current &&
      sparklesRef.current
    ) {
      progRef.current += morphSpeed;
      const eased =
        progRef.current >= 1 ? 1 : 1 - Math.pow(1 - progRef.current, 3);
      const { from, to } = morphDataRef.current;
      const particleArr = particlesRef.current.geometry.attributes.position
        .array as Float32Array;
      const sparkleArr = sparklesRef.current.geometry.attributes.position
        .array as Float32Array;

      for (let i = 0; i < particleArr.length; i++) {
        const val = from[i] + (to[i] - from[i]) * eased;
        particleArr[i] = val;
        if (i < sparkleArr.length) {
          sparkleArr[i] = val;
        }
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      sparklesRef.current.geometry.attributes.position.needsUpdate = true;

      if (progRef.current >= 1) {
        currentPatternRef.current = morphDataRef.current.next;
        isTransRef.current = false;
      }
    }
  });

  return <></>;
}

export default MorphingScene;
