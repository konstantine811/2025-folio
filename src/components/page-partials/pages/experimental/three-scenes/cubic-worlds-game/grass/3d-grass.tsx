import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { JSX, useLayoutEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  FrontSide,
  InstancedBufferAttribute,
  InstancedMesh,
  MathUtils,
  Mesh,
  Object3D,
  ShaderMaterial,
  SkinnedMesh,
  Texture,
  Vector2,
  Vector3,
} from "three";

function GrassGradientMat(
  props: JSX.IntrinsicElements["grassGradientMaterial"]
) {
  const ref = useRef<ShaderMaterial>(null!);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.uniforms.time.value += dt;
  });
  return (
    <grassGradientMaterial
      ref={ref}
      transparent
      depthWrite
      side={FrontSide}
      defines={{ USE_INSTANCING: "" }}
      {...props}
    />
  );
}

/** ============================ */
/** 1) УТИЛІТИ ДЛЯ ГЕОМЕТРІЇ     */
/** ============================ */

function getFirstMeshGeometry(root: Object3D): BufferGeometry {
  let found: BufferGeometry | null = null;
  root.traverse((obj) => {
    if (!found && obj.type === "Mesh") {
      found = (obj as Mesh).geometry as BufferGeometry;
    }
  });
  if (!found) throw new Error("GLTF не містить Mesh із геометрією.");
  return found!;
}

// Додаємо aTip (0..1) за Y-віссю
function prepareGrassGeom(src: BufferGeometry) {
  const geom = src.clone();
  geom.computeBoundingBox();
  const bb = geom.boundingBox!;
  const pos = geom.attributes.position as BufferAttribute;
  const count = pos.count;

  const tip = new Float32Array(count);
  const height = Math.max(1e-6, bb.max.y - bb.min.y);
  for (let i = 0; i < count; i++) {
    const y = pos.getY(i);
    tip[i] = (y - bb.min.y) / height;
  }
  geom.setAttribute("aTip", new BufferAttribute(tip, 1));
  geom.computeBoundingSphere();
  return geom;
}

/** ============================ */
/** 2) RNG                       */
/** ============================ */

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** ============================================== */
/** 3) ХУК ДЛЯ ПІДГОТОВКИ ГЕОМЕТРІЇ З GLTF          */
/** ============================================== */

function useGrassGeometry(modelUrl: string, meshName?: string) {
  const { nodes, scene } = useGLTF(modelUrl);

  const baseGeom = useMemo(() => {
    if (meshName) {
      const node = nodes?.[meshName] as SkinnedMesh;
      if (!node || !node.geometry) {
        console.warn(
          `[Grass] Не знайдено mesh "${meshName}" у GLTF. Буде використано перший mesh у сцені.`
        );
        return getFirstMeshGeometry(scene);
      }
      return node.geometry as BufferGeometry;
    }
    return getFirstMeshGeometry(scene);
  }, [meshName, scene, nodes]);

  return useMemo(() => prepareGrassGeom(baseGeom), [baseGeom]);
}

/** Витягнути albedo/edge маски з матеріалу GLTF */
function useEmbeddedMaps(modelUrl: string, meshName?: string) {
  const gltf = useGLTF(modelUrl);
  let mesh: Mesh | null = null;

  if (meshName && gltf.nodes?.[meshName]) {
    mesh = gltf.nodes[meshName] as Mesh;
  } else {
    gltf.scene.traverse((o: Object3D) => {
      if (!mesh && (o as Mesh).isMesh) mesh = o as Mesh;
    });
  }

  let albedo: Texture | null = null;

  const mat: any = mesh?.material;
  console.log("mat", mat);
  if (mat?.map) {
    albedo = mat.map as Texture;
    // три.js сам декодує sRGB, якщо текстура позначена sRGB і renderer.outputEncoding налаштований.
    albedo.anisotropy = 8;
  }
  // edge маску беремо з aoMap/alphaMap, якщо є

  return { albedo };
}
/** ===================================================== */
/** 4) ТАЙЛ ТРАВИ (InstancedMesh з твоєю геометрією)     */
/** ===================================================== */

/** 4) Тайл трави                                         */
/** ===================================================== */
type GrassTileProps = {
  tileX: number;
  tileZ: number;
  tileSize: number;
  count: number;
  seed: number;
  modelUrl: string;
  meshName?: string;
  yAt?: (x: number, z: number) => number;
  materialProps?: Partial<JSX.IntrinsicElements["grassGradientMaterial"]>;
};

export function GrassTile({
  tileX,
  tileZ,
  tileSize,
  count,
  seed,
  modelUrl,
  meshName,
  yAt,
  materialProps,
}: GrassTileProps) {
  const meshRef = useRef<InstancedMesh>(null!);
  const dummy = useMemo(() => new Object3D(), []);
  const tmp = useMemo(() => new Vector3(), []);

  const blade = useGrassGeometry(modelUrl, meshName);
  const { albedo } = useEmbeddedMaps(modelUrl, meshName);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    const rng = mulberry32((tileX * 73856093) ^ (tileZ * 19349663) ^ seed);
    const aBend = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const ox = (rng() - 0.5) * tileSize;
      const oz = (rng() - 0.5) * tileSize;
      const worldX = tileX * tileSize + ox;
      const worldZ = tileZ * tileSize + oz;
      const y = yAt ? yAt(worldX, worldZ) : 0;

      const h = MathUtils.lerp(0.6, 1.4, rng());
      const yaw = rng() * Math.PI * 2;

      dummy.position.set(worldX, y, worldZ);
      dummy.scale.set(1, h, 1);
      dummy.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), yaw);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      aBend[i] = MathUtils.lerp(0.6, 1.0, rng());
    }

    const geom = meshRef.current.geometry as BufferGeometry;

    geom.setAttribute("aBend", new InstancedBufferAttribute(aBend, 1));
    geom.computeBoundingSphere();
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.frustumCulled = true;
  }, [count, tileSize, tileX, tileZ, seed, yAt, dummy, tmp]);

  return (
    <instancedMesh ref={meshRef} args={[blade, undefined, count]} receiveShadow>
      <GrassGradientMat
        // тільки те, що реально потрібно
        albedoMap={albedo ?? null}
        edgeMaskMap={null}
        useEdgeMask={0}
        // вітер (можеш підкрутити)
        uWindAmp={0.06}
        uWindFreq={1.2}
        uWindDir={new Vector2(0.85, 0.2).normalize()}
        // прозорість за потреби
        transparency={0.0}
        {...materialProps}
      />
    </instancedMesh>
  );
}
/** ===================================================== */
/** 5) НЕСКІНЧЕННЕ ПОЛЕ (сітка тайлів навколо камери)     */
/** ===================================================== */

type InfiniteGrassProps = {
  radius?: number;
  tileSize?: number;
  density?: number;
  seed?: number;
  modelUrl?: string;
  meshName?: string;
  yAt?: (x: number, z: number) => number;
  materialProps?: Partial<JSX.IntrinsicElements["grassGradientMaterial"]>;
};

export function InfiniteGrass({
  radius = 3,
  tileSize = 6,
  density = 20,
  seed = 1337,
  modelUrl = "/3d-models/cubic-worlds-model/grass.glb",
  meshName,
  yAt,
  materialProps,
}: InfiniteGrassProps) {
  const { camera } = useThree();
  const centerTile = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  const countPerTile = Math.max(1, Math.floor(tileSize * tileSize * density));

  useLayoutEffect(() => {
    centerTile.current.x = Math.floor(camera.position.x / tileSize);
    centerTile.current.z = Math.floor(camera.position.z / tileSize);
  }, [camera.position, tileSize]);

  useFrame(() => {
    const cx = Math.floor(camera.position.x / tileSize);
    const cz = Math.floor(camera.position.z / tileSize);
    if (cx !== centerTile.current.x || cz !== centerTile.current.z) {
      centerTile.current.x = cx;
      centerTile.current.z = cz;
    }
  });

  const tiles: JSX.Element[] = [];
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
          modelUrl={modelUrl}
          meshName={meshName}
          yAt={yAt}
          materialProps={materialProps}
        />
      );
    }
  }

  return <group>{tiles}</group>;
}

/** ===================================================== */
/** 6) GLTF PRELOAD (опційно)                             */
/** ===================================================== */
useGLTF.preload?.("/3d-models/cubic-worlds-model/grass.glb");
