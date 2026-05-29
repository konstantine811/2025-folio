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

/** Base transform of the rib mesh as exported by gltfjsx. */
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

/** Repeated wall-support ribs (vestibule) — InstancedMesh, tunable via Leva. */
export function ShipWallSupport(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(modelPath);
  const meshRef = useRef<InstancedMesh>(null);

  const geometry = (nodes.edge_ribs as Mesh).geometry;
  const sourceMaterial = materials.edge_ribs as MeshStandardMaterial;

  /** Clone so darkening this prop never mutates the shared GLTF material. */
  const material = useMemo(() => sourceMaterial.clone(), [sourceMaterial]);
  const baseColor = useMemo(
    () => sourceMaterial.color.clone(),
    [sourceMaterial],
  );

  const {
    darkness,
    roughness,
    metalness,
    count,
    direction,
    spacing,
    offsetX,
    offsetY,
    offsetZ,
  } = useControls(SHIP_WALL_SUPPORT_CONTROLS_PATH, {
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

  const temp = useMemo(
    () => ({
      matrix: new Matrix4(),
      position: new Vector3(),
      quaternion: new Quaternion(),
      scale: new Vector3(...baseRibScale),
    }),
    [],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dir = axisVectors[direction];
    for (let i = 0; i < count; i += 1) {
      temp.position.set(
        baseRibPosition[0] + dir[0] * spacing * i,
        baseRibPosition[1] + dir[1] * spacing * i,
        baseRibPosition[2] + dir[2] * spacing * i,
      );
      temp.matrix.compose(temp.position, temp.quaternion, temp.scale);
      mesh.setMatrixAt(i, temp.matrix);
    }

    mesh.count = count;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [count, direction, spacing, temp]);

  return (
    <group {...props} dispose={null}>
      <group position={[offsetX, offsetY, offsetZ]}>
        <instancedMesh
          ref={meshRef}
          args={[geometry, material, MAX_INSTANCES]}
          castShadow
          receiveShadow
          frustumCulled={false}
        />
      </group>
    </group>
  );
}

useGLTF.preload(modelPath);
