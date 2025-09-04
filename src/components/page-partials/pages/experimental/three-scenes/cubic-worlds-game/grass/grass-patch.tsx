// GrassPatch.tsx
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Mesh,
  ShaderMaterial,
  Vector2,
} from "three";

type GrassPatchProps = {
  /** кількість лез у патчі по X,Z (разом = numX*numZ) */
  numX?: number;
  numZ?: number;
  /** розмір патча (квадрат) у метрах */
  patchSize?: number;
  /** дрібні випадкові відхилення позиції від ґриду (0..0.5) */
  jitter?: number;
  /** висота/ширина одного леза (у локальному просторі) */
  bladeHeight?: number;
  bladeWidth?: number;
  /** кількість сегментів по висоті (чим більше — тим плавніше згин) */
  segments?: number;
  /** seed для розкиду лез */
  seed?: number;
  /** вітер */
  windAmp?: number;
  windFreq?: number;
  windDir?: Vector2; // нормалізований
};

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** робимо полоску (plane-strip) з сегментами, з UV та маскою tip (0..1 по висоті) */
function makeBladeBase(segments: number, width: number, height: number) {
  const rows = segments + 1;
  const positions: number[] = [];
  const uvs: number[] = [];
  const tip: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < rows; i++) {
    const t = i / segments; // 0..1
    const y = t * height;
    // звужуємо до верху трохи
    const w = (1.0 - 1.001 * t) * width * 0.5;

    // ліво
    positions.push(-w, y, 0);
    uvs.push(0, t);
    tip.push(t);

    // право
    positions.push(+w, y, 0);
    uvs.push(1, t);
    tip.push(t);

    if (i < segments) {
      const a = i * 2;
      const b = a + 1;
      const c = a + 2;
      const d = a + 3;
      indices.push(a, c, b, b, c, d);
    }
  }

  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  g.setAttribute("aTip", new Float32BufferAttribute(tip, 1));
  g.setIndex(indices);
  g.computeVertexNormals(); // не критично, але хай буде
  return g;
}

export function GrassPatch({
  numX = 32,
  numZ = 32,
  patchSize = 6,
  jitter = 0.2,
  bladeHeight = 1.0,
  bladeWidth = 0.08,
  segments = 5,
  seed = 1234,
}: GrassPatchProps) {
  const meshRef = useRef<Mesh>(null!);
  const matRef = useRef<ShaderMaterial>(null!);

  // 1) база леза
  const base = useMemo(
    () => makeBladeBase(segments, bladeWidth, bladeHeight),
    [segments, bladeWidth, bladeHeight]
  );

  // 2) інстанс-геометрія (offset + rand)
  const geom = useMemo(() => {
    const g = new InstancedBufferGeometry();
    // копіюємо атрибути бази
    g.index = base.index;
    g.attributes.position = base.attributes.position;
    g.attributes.uv = base.attributes.uv;
    g.setAttribute("aTip", base.getAttribute("aTip"));

    const count = numX * numZ;
    g.instanceCount = count;

    const offsets = new Float32Array(count * 3);
    const rands = new Float32Array(count);

    const rng = mulberry32(seed);
    const aBends = new Float32Array(count);
    let k = 0;
    for (let i = 0; i < numX; i++) {
      for (let j = 0; j < numZ; j++) {
        // грід у межах [-0.5..0.5] * patchSize
        const fx = i / (numX - 1) - 0.5;
        const fz = j / (numZ - 1) - 0.5;
        const jx = (rng() * 2 - 1) * jitter;
        const jz = (rng() * 2 - 1) * jitter;
        const x = (fx + jx) * patchSize;
        const z = (fz + jz) * patchSize;
        aBends[k] = 0.6 + 0.4 * rng(); // 0.6..1.0
        offsets[k * 3 + 0] = x;
        offsets[k * 3 + 1] = 0.0;
        offsets[k * 3 + 2] = z;

        rands[k] = rng();
        k++;
      }
    }

    g.setAttribute("offset", new InstancedBufferAttribute(offsets, 3));
    g.setAttribute("rand", new InstancedBufferAttribute(rands, 1));
    g.setAttribute("aBend", new InstancedBufferAttribute(aBends, 1));

    g.computeBoundingSphere();
    return g;
  }, [base, numX, numZ, patchSize, jitter, seed]);

  // 4) час для вітру
  useFrame((_, dt) => {
    if (matRef.current) matRef.current.uniforms.time.value += dt;
  });

  return (
    <mesh ref={meshRef} geometry={geom}>
      <grassGradientMaterialSecond
        ref={matRef}
        attach="material"
        transparent
        side={DoubleSide}
        // приклади твіку:
        maxLean={0.4}
        bendExp={2.4}
        bladeHalfWidth={1.035}
        normalYaw={0.25}
        uWindAmp={1.06}
        uWindFreq={1.2}
        uWindDir={new Vector2(0.85, 0.2).normalize()}
      />
    </mesh>
  );
}
