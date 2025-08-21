// Grass.tsx
import * as THREE from "three";
import { InstancedBufferAttribute, Object3D, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";

/** ---------- 1) Матеріал трави (шейдер) ---------- */
function GrassMaterial() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uWindAmp: { value: 0.25 },
      uWindFreq: { value: 1.4 },
      uWindDir: { value: new THREE.Vector2(1, 0).normalize() },
      uColorBottom: { value: new THREE.Color("#3a7a2a") },
      uColorTop: { value: new THREE.Color("#8bdc5b") },
    }),
    []
  );

  useFrame((_, dt) => {
    materialRef.current.uniforms.uTime.value += dt;
  });

  return (
    <shaderMaterial
      ref={materialRef}
      transparent={false}
      depthWrite={true}
      side={THREE.DoubleSide}
      defines={{ USE_INSTANCING: "" }}
      uniforms={uniforms}
      vertexShader={
        /* glsl */ `
        uniform float uTime;
        uniform float uWindAmp;
        uniform float uWindFreq;
        uniform vec2 uWindDir;

        attribute float aBend;

        varying float vY;

        void main(){
          vY = uv.y;

          // локальна позиція леза
          vec3 pos = position;

          // плавний вигин верхівки (сильніше на вершині за рахунок vY^2)
          float t = uTime * uWindFreq;
          // невеличкий фазовий шум на інстансах через world pos (row 3 of instanceMatrix)
          #ifdef USE_INSTANCING
            float phase = (instanceMatrix[3].x + instanceMatrix[3].z) * 0.1;
          #else
            float phase = 0.0;
          #endif
          float wind = sin(t + phase) * uWindAmp;

          float sway = wind * aBend * vY * vY; // відхилення вершини
          pos.x += sway; // згинаємо по X локально

          // стандартна матриця інстансингу
          #ifdef USE_INSTANCING
            vec4 worldPosition = modelMatrix * instanceMatrix * vec4(pos, 1.0);
          #else
            vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
          #endif
          vec4 viewPosition = viewMatrix * worldPosition;
          gl_Position = projectionMatrix * viewPosition;
        }
      `
      }
      fragmentShader={
        /* glsl */ `
        varying float vY;
        uniform vec3 uColorBottom;
        uniform vec3 uColorTop;

        void main(){
          vec3 col = mix(uColorBottom, uColorTop, smoothstep(0.0, 1.0, vY));
          gl_FragColor = vec4(col, 1.0);
        }
      `
      }
    />
  );
}

/** ---------- 2) Окремий тайл трави (InstancedMesh) ---------- */
type GrassTileProps = {
  tileX: number; // координата тайла в сітці (ціла)
  tileZ: number;
  tileSize: number; // розмір тайла в метрах
  count: number; // кількість лез у тайлі
  seed: number; // базовий seed
  yAt?: (x: number, z: number) => number; // опційно: висота рельєфу
};

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function GrassTile({
  tileX,
  tileZ,
  tileSize,
  count,
  seed,
  yAt,
}: GrassTileProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new Object3D(), []);
  const tmp = useMemo(() => new Vector3(), []);

  // геометрія одного леза: вузька площинка, 4 сегменти по висоті для плавного згину
  const blade = useMemo(() => new THREE.PlaneGeometry(0.08, 1.0, 1, 4), []);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const rng = mulberry32((tileX * 73856093) ^ (tileZ * 19349663) ^ seed);

    // інстанс-атрибут: скільки лезо "гнеться" (0..1)
    const aBend = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // випадкова позиція в межах тайла
      const ox = (rng() - 0.5) * tileSize;
      const oz = (rng() - 0.5) * tileSize;
      const worldX = tileX * tileSize + ox;
      const worldZ = tileZ * tileSize + oz;
      const y = yAt ? yAt(worldX, worldZ) : 0;

      // випадкова висота (масштаб Y) і невеликий нахил
      const h = THREE.MathUtils.lerp(0.6, 1.4, rng());
      const yaw = rng() * Math.PI * 2;

      dummy.position.set(worldX, y, worldZ);
      dummy.scale.set(1, h, 1);
      tmp.set(0, 1, 0).applyAxisAngle(new Vector3(0, 1, 0), yaw);
      dummy.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), yaw);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      aBend[i] = THREE.MathUtils.lerp(0.6, 1.0, rng());
    }

    // підвішуємо інстанс-атрибут до геометрії
    const geom = meshRef.current.geometry as THREE.BufferGeometry;
    geom.setAttribute("aBend", new InstancedBufferAttribute(aBend, 1));
    geom.computeBoundingSphere(); // велика сфера не завадить, щоб не обрізало
    meshRef.current.instanceMatrix.needsUpdate = true;
    // простий шлях — вимкнути фрустумне відсікання для тайлу
    meshRef.current.frustumCulled = false;
  }, [count, tileSize, tileX, tileZ, seed, yAt, dummy, tmp]);

  return (
    // окремий інстансед-меш для тайла
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <primitive object={blade} attach="geometry" />
      <GrassMaterial />
    </instancedMesh>
  );
}

/** ---------- 3) Нескінченне поле (пересуває сітку тайлів за камерою) ---------- */
type InfiniteGrassProps = {
  radius?: number; // радіус у тайлах (3 => 7x7 тайлів)
  tileSize?: number;
  density?: number; // лез на 1м^2
  seed?: number;
  yAt?: (x: number, z: number) => number; // опційно: висота землі
};

export function InfiniteGrass({
  radius = 3,
  tileSize = 6,
  density = 20,
  seed = 1337,
  yAt,
}: InfiniteGrassProps) {
  const { camera } = useThree();
  const centerTile = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  // скільки лез на тайл
  const countPerTile = Math.max(1, Math.floor(tileSize * tileSize * density));

  // ініціалізація центру
  useLayoutEffect(() => {
    centerTile.current.x = Math.floor(camera.position.x / tileSize);
    centerTile.current.z = Math.floor(camera.position.z / tileSize);
  }, [camera.position, tileSize]);

  // оновлюємо центр при рухові камери (коли перейшла межу наступного тайла)
  useFrame(() => {
    const cx = Math.floor(camera.position.x / tileSize);
    const cz = Math.floor(camera.position.z / tileSize);
    if (cx !== centerTile.current.x || cz !== centerTile.current.z) {
      centerTile.current.x = cx;
      centerTile.current.z = cz;
    }
  });

  // малюємо квадрат тайлів навколо центру
  const tiles = [];
  for (let dz = -radius; dz <= radius; dz++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const key = `${dx}_${dz}`;
      const tileX = centerTile.current.x + dx;
      const tileZ = centerTile.current.z + dz;
      tiles.push(
        <GrassTile
          key={key}
          tileX={tileX}
          tileZ={tileZ}
          tileSize={tileSize}
          count={countPerTile}
          seed={seed}
          yAt={yAt}
        />
      );
    }
  }

  return <group>{tiles}</group>;
}
