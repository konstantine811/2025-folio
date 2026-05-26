import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
  type Mesh,
  type Object3D,
} from "three";

export const STYLIZED_TOYOTA_CAR_MODEL_PATH =
  "/3d-models/stylized-world/car_toyota.glb";

/** Align glTF (+Z hood) with physics chassis (front at -Z). */
export const STYLIZED_TOYOTA_CAR_MODEL_ROTATION: [number, number, number] = [
  0,
  Math.PI,
  0,
];

/** Model wheelbase ~3.03 m; physics wheelbase 1.4 m. */
export const STYLIZED_TOYOTA_CAR_MODEL_SCALE = 1.4 / 3.027;

/** Drop model so body sits on physics wheel radius. Shift X if arches look off-center. */
export const STYLIZED_TOYOTA_CAR_MODEL_OFFSET: [number, number, number] = [
  0,
  -0.52,
  0,
];

/** Must match WHEEL_RADIUS in stylized-car-controller. */
export const PHYSICS_WHEEL_RADIUS = 0.22;

/** Align glTF wheel mesh roll axis with Rapier axle (-X). */
export const WHEEL_MESH_ROTATION: [number, number, number] = [0, 0, 0];

/**
 * Fine-tune each wheel mesh on its physics anchor (chassis space, meters).
 * Index: 0 FL, 1 FR, 2 RL, 3 RR — negative X pulls left, positive X pulls right.
 */
export const WHEEL_MESH_OFFSETS: ReadonlyArray<[number, number, number]> = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];

/** Shift left/right split plane in glTF wheel geometry if one side is wider. */
export const WHEEL_SPLIT_PLANE_X = 0;

export type ToyotaWheelVisual = {
  geometry: BufferGeometry;
  scale: number;
};

const _center = new Vector3();

function splitGeometryByCenterX(
  geometry: BufferGeometry,
  keepLeft: boolean,
): BufferGeometry {
  const source = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  const position = source.getAttribute("position") as BufferAttribute;
  const normal = source.getAttribute("normal") as BufferAttribute | undefined;
  const positions: number[] = [];
  const normals: number[] = [];

  const bounds = new Box3().setFromBufferAttribute(position);
  const centerX = (bounds.min.x + bounds.max.x) * 0.5 + WHEEL_SPLIT_PLANE_X;

  for (let i = 0; i < position.count; i += 3) {
    const centroidX =
      (position.getX(i) + position.getX(i + 1) + position.getX(i + 2)) / 3;
    const isLeft = centroidX < centerX;
    if (keepLeft !== isLeft) continue;

    for (let vertex = 0; vertex < 3; vertex += 1) {
      const index = i + vertex;
      positions.push(
        position.getX(index),
        position.getY(index),
        position.getZ(index),
      );
      if (normal) {
        normals.push(
          normal.getX(index),
          normal.getY(index),
          normal.getZ(index),
        );
      }
    }
  }

  const result = new BufferGeometry();
  result.setAttribute("position", new Float32BufferAttribute(positions, 3));
  if (normals.length > 0) {
    result.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  } else {
    result.computeVertexNormals();
  }
  result.computeBoundingSphere();
  return result;
}

function centerWheelGeometryForHub(geometry: BufferGeometry) {
  const centered = geometry.clone();
  centered.computeBoundingBox();
  if (!centered.boundingBox) return centered;

  centered.boundingBox.getCenter(_center);
  const hubRadius = Math.max(
    centered.boundingBox.max.y - _center.y,
    _center.y - centered.boundingBox.min.y,
    0.001,
  );

  centered.translate(-_center.x, -_center.y, -_center.z);
  centered.computeBoundingBox();
  if (centered.boundingBox) {
    const bottomOffset = centered.boundingBox.min.y + hubRadius;
    centered.translate(0, bottomOffset, 0);
  }
  centered.computeBoundingSphere();
  return centered;
}

function scaleToPhysicsRadius(geometry: BufferGeometry) {
  geometry.computeBoundingSphere();
  const modelRadius = geometry.boundingSphere?.radius ?? 0.28;
  return PHYSICS_WHEEL_RADIUS / Math.max(modelRadius, 0.001);
}

function buildWheelVisual(
  geometry: BufferGeometry,
  keepLeft: boolean,
): ToyotaWheelVisual {
  const split = splitGeometryByCenterX(geometry, keepLeft);
  const centered = centerWheelGeometryForHub(split);
  split.dispose();

  return {
    geometry: centered,
    scale: scaleToPhysicsRadius(centered),
  };
}

export function useToyotaWheelVisuals() {
  const { nodes, materials } = useGLTF(STYLIZED_TOYOTA_CAR_MODEL_PATH);

  return useMemo(() => {
    const frontSource = (nodes.frontwheel as Mesh).geometry;
    const rearSource = (nodes.tailwheel as Mesh).geometry;

    return {
      material: materials["toyotamaterial.002"],
      wheels: [
        buildWheelVisual(frontSource, true),
        buildWheelVisual(frontSource, false),
        buildWheelVisual(rearSource, true),
        buildWheelVisual(rearSource, false),
      ] as ToyotaWheelVisual[],
    };
  }, [materials, nodes]);
}

type BodyProps = {
  nodes: Record<string, Object3D>;
  materials: Record<string, import("three").Material>;
};

export function StylizedToyotaCarBody({ nodes, materials }: BodyProps) {
  const material = materials["toyotamaterial.002"];
  const transparentMaterial = materials["toyotatransparent.002"];

  return (
    <group dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.dashboard as Mesh).geometry}
        material={material}
        position={[0.047, 1.247, 0.799]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.door as Mesh).geometry}
        material={material}
        position={[0.88, 1.154, 0.483]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.door1 as Mesh).geometry}
        material={material}
        position={[-0.876, 1.154, 0.483]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.interior as Mesh).geometry}
        material={material}
        position={[0.002, 1.27, 0.362]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.seat as Mesh).geometry}
        material={material}
        position={[0.423, 1.036, 0.421]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.steeringwheel as Mesh).geometry}
        material={material}
        position={[0.446, 1.217, 0.643]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.suspension as Mesh).geometry}
        material={material}
        position={[0.001, 1.953, 0.185]}
      />
      <group position={[0.022, 1.04, -0.068]}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Plane005 as Mesh).geometry}
          material={material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Plane005_1 as Mesh).geometry}
          material={transparentMaterial}
        />
      </group>
    </group>
  );
}

export function StylizedToyotaCarBodyVisual() {
  const { nodes, materials } = useGLTF(STYLIZED_TOYOTA_CAR_MODEL_PATH);

  return (
    <group
      rotation={STYLIZED_TOYOTA_CAR_MODEL_ROTATION}
      scale={STYLIZED_TOYOTA_CAR_MODEL_SCALE}
      position={STYLIZED_TOYOTA_CAR_MODEL_OFFSET}
    >
      <StylizedToyotaCarBody nodes={nodes} materials={materials} />
    </group>
  );
}

useGLTF.preload(STYLIZED_TOYOTA_CAR_MODEL_PATH);
