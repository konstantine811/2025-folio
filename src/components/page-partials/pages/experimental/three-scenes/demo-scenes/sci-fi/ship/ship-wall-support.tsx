import { JSX, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import {
  Color,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from "three";

const modelPath = "/3d-models/sci-fi/ship-wall-support.glb";

/** Leva folder (visible with #debug). */
export const SHIP_WALL_SUPPORT_CONTROLS_PATH = "Sci-fi props / Wall support";

const MAX_INSTANCES = 1000;
/** Smaller chunks → tighter bounding volumes → better frustum culling. */
const INSTANCE_CHUNK_SIZE = 48;

const baseRibPosition: [number, number, number] = [0, 0.002, 1.148];
const baseRibScale: [number, number, number] = [1, 1, 0.802];

const axisVectors = {
  "+X": [1, 0, 0],
  "-X": [-1, 0, 0],
  "+Y": [0, 1, 0],
  "-Y": [0, -1, 0],
  "+Z": [0, 0, 1],
  "-Z": [0, 0, 1],
} as const;

type AxisKey = keyof typeof axisVectors;

const axisOptions = Object.keys(axisVectors) as AxisKey[];

/** Excluded from follow-camera raycast (see useFollowCamera customTraverseAdd). */
const camExcludeCollision = { camExcludeCollision: true } as const;

const instanceCompose = {
  matrix: new Matrix4(),
  position: new Vector3(),
  quaternion: new Quaternion(),
  scale: new Vector3(...baseRibScale),
};

function writeInstanceMatrices(
  mesh: InstancedMesh,
  globalStart: number,
  localCount: number,
  direction: AxisKey,
  spacing: number,
) {
  const dir = axisVectors[direction];

  for (let local = 0; local < localCount; local += 1) {
    const index = globalStart + local;
    instanceCompose.position.set(
      baseRibPosition[0] + dir[0] * spacing * index,
      baseRibPosition[1] + dir[1] * spacing * index,
      baseRibPosition[2] + dir[2] * spacing * index,
    );
    instanceCompose.matrix.compose(
      instanceCompose.position,
      instanceCompose.quaternion,
      instanceCompose.scale,
    );
    mesh.setMatrixAt(local, instanceCompose.matrix);
  }

  mesh.count = localCount;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
}

type RibInstanceChunkProps = {
  geometry: Mesh["geometry"];
  material: MeshStandardMaterial;
  globalStart: number;
  localCount: number;
  direction: AxisKey;
  spacing: number;
  castShadow: boolean;
  receiveShadow: boolean;
};

function RibInstanceChunk({
  geometry,
  material,
  globalStart,
  localCount,
  direction,
  spacing,
  castShadow,
  receiveShadow,
}: RibInstanceChunkProps) {
  const meshRef = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || localCount <= 0) return;

    writeInstanceMatrices(mesh, globalStart, localCount, direction, spacing);
  }, [globalStart, localCount, direction, spacing]);

  if (localCount <= 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, localCount]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled
      userData={camExcludeCollision}
    />
  );
}

/** Repeated wall-support ribs (vestibule) — chunked InstancedMesh for culling + perf toggles. */
export function ShipWallSupport(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(modelPath);

  const geometry = (nodes.edge_ribs as Mesh).geometry;
  const sourceMaterial = materials.edge_ribs as MeshStandardMaterial;

  const material = useMemo(() => sourceMaterial.clone(), [sourceMaterial]);
  const baseColor = useMemo(
    () => sourceMaterial.color.clone(),
    [sourceMaterial],
  );

  const {
    enabled,
    darkness,
    roughness,
    metalness,
    castShadow,
    receiveShadow,
    count,
    direction,
    spacing,
    offsetX,
    offsetY,
    offsetZ,
  } = useControls(SHIP_WALL_SUPPORT_CONTROLS_PATH, {
    enabled: { value: true, label: "Enable ribs" },
    darkness: {
      value: 0.18,
      min: 0.1,
      max: 1,
      step: 0.01,
      label: "Brightness",
    },
    roughness: {
      value: 0.6,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Roughness",
    },
    metalness: {
      value: 0.29,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Metalness",
    },
    castShadow: { value: false, label: "Cast shadows" },
    receiveShadow: { value: false, label: "Receive shadows" },
    count: {
      value: 187,
      min: 1,
      max: MAX_INSTANCES,
      step: 1,
      label: "Copies",
    },
    direction: {
      value: "-Z" as AxisKey,
      options: axisOptions,
      label: "Direction",
    },
    spacing: {
      value: 0.2,
      min: 0.01,
      max: 5,
      step: 0.01,
      label: "Spacing",
    },
    offsetX: { value: 0, min: -20, max: 20, step: 0.01, label: "Offset X" },
    offsetY: { value: 0, min: -20, max: 20, step: 0.01, label: "Offset Y" },
    offsetZ: { value: -1, min: -40, max: 40, step: 0.01, label: "Offset Z" },
  });

  useEffect(() => {
    material.color = new Color().copy(baseColor).multiplyScalar(darkness);
    material.roughness = roughness;
    material.metalness = metalness;
    material.needsUpdate = true;
  }, [material, baseColor, darkness, roughness, metalness]);

  useEffect(() => () => material.dispose(), [material]);

  const chunks = useMemo(() => {
    const list: { globalStart: number; localCount: number }[] = [];
    for (let start = 0; start < count; start += INSTANCE_CHUNK_SIZE) {
      list.push({
        globalStart: start,
        localCount: Math.min(INSTANCE_CHUNK_SIZE, count - start),
      });
    }
    return list;
  }, [count]);

  if (!enabled) return null;

  return (
    <group {...props} dispose={null} userData={camExcludeCollision}>
      <group position={[offsetX, offsetY, offsetZ]} userData={camExcludeCollision}>
        {chunks.map(({ globalStart, localCount }, chunkIndex) => (
          <RibInstanceChunk
            key={`${chunkIndex}-${globalStart}-${localCount}-${direction}-${spacing}`}
            geometry={geometry}
            material={material}
            globalStart={globalStart}
            localCount={localCount}
            direction={direction}
            spacing={spacing}
            castShadow={castShadow}
            receiveShadow={receiveShadow}
          />
        ))}
      </group>
    </group>
  );
}

useGLTF.preload(modelPath);
