import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
  type RigidBodyProps,
} from "@react-three/rapier";
import { usePauseStore } from "@/components/common/game-controller/store/usePauseMode";
import { Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { sciFiPropDynamicCollisionGroups } from "../sci-fi-collision-groups";
import { registerSciFiVerletPropBoxProvider } from "../sci-fi-verlet-prop-boxes";
import {
  resolveChairCableProxyBoxes,
  type SciFiChairControls,
} from "./ship-chair-cable-proxies";
import type { ResolvedCableProxyBox } from "../character/sci-fi-cable-proxy-limbs";

const modelPath = "/3d-models/sci-fi/chairglb.glb";

const SHIP_CHAIR_DEFAULT_POSITION: [number, number, number] = [0, 0.1, 7];

/** Anchor for proxy + physics cuboids (matches exported chair_collider). */
const CHAIR_COLLIDER_ANCHOR: [number, number, number] = [0, 0.282, 6.719];

/** Low friction — trimesh-on-floor was sticking until breakaway. */
const CHAIR_PHYSICS_FRICTION = 0.35;

function cuboidColliderPosition(offset: {
  x: number;
  y: number;
  z: number;
}): [number, number, number] {
  return [
    CHAIR_COLLIDER_ANCHOR[0] + offset.x,
    CHAIR_COLLIDER_ANCHOR[1] + offset.y,
    CHAIR_COLLIDER_ANCHOR[2] + offset.z,
  ];
}

function resetChairToDefaultPose(body: RapierRigidBody | null) {
  if (!body) return;

  const [x, y, z] = SHIP_CHAIR_DEFAULT_POSITION;
  body.setTranslation({ x, y, z }, true);
  body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
  body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  body.setAngvel({ x: 0, y: 0, z: 0 }, true);
}

/** < 1 darkens albedo; emissive is cleared to stop blow-out under scene lights. */
const CHAIR_MATERIAL_BRIGHTNESS = 0.5;

function useTunedChairMaterial(source: MeshStandardMaterial) {
  const material = useMemo(() => source.clone(), [source]);
  const baseColor = useMemo(() => source.color.clone(), [source]);

  useEffect(() => {
    material.color.copy(baseColor).multiplyScalar(CHAIR_MATERIAL_BRIGHTNESS);
    material.emissive.setHex(0x000000);
    material.emissiveIntensity = 0;
    material.needsUpdate = true;
  }, [material, baseColor]);

  useEffect(() => () => material.dispose(), [material]);

  return material;
}

type ChairVerletProxyWireframeProps = {
  show: boolean;
  resolveBoxes: () => readonly ResolvedCableProxyBox[];
};

const PROXY_WIREFRAME_COLORS = ["#39d5ff", "#a78bfa"] as const;

function ChairVerletProxyWireframe({
  show,
  resolveBoxes,
}: ChairVerletProxyWireframeProps) {
  const groupRefs = useRef<(Group | null)[]>([]);
  const sizeRef = useRef(new Vector3());

  useFrame(() => {
    if (!show) return;

    const boxes = resolveBoxes();
    for (let i = 0; i < groupRefs.current.length; i += 1) {
      const group = groupRefs.current[i];
      const box = boxes[i];
      if (!group) continue;

      if (!box) {
        group.visible = false;
        continue;
      }

      group.visible = true;
      group.position.copy(box.center);
      group.quaternion.copy(box.quaternion);
      sizeRef.current.copy(box.halfExtents).multiplyScalar(2);
      group.scale.copy(sizeRef.current);
    }
  });

  if (!show) return null;

  return (
    <group userData={{ camExcludeCollision: true }}>
      {PROXY_WIREFRAME_COLORS.map((color, index) => (
        <group
          key={index}
          ref={(node) => {
            groupRefs.current[index] = node;
          }}
        >
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial
              color={color}
              wireframe
              transparent
              opacity={0.85}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

type ShipChairProps = RigidBodyProps & {
  controls: SciFiChairControls;
};

/** Chair the character sits on at the start of the scroll timeline. */
export function ShipChair({ controls, ...props }: ShipChairProps) {
  const { nodes, materials } = useGLTF(modelPath);

  const seat = nodes["Chair-ADDE001"] as Mesh;
  const frame = nodes["Chair-ADDE001_1"] as Mesh;
  const collider = nodes.chair_collider as Mesh;

  const plasticMaterial = useTunedChairMaterial(
    materials["Chair-Plastic.001"] as MeshStandardMaterial,
  );
  const metalMaterial = useTunedChairMaterial(
    materials["Chair-Metal.001"] as MeshStandardMaterial,
  );

  const bodyRef = useRef<RapierRigidBody>(null);
  const colliderMeshRef = useRef<Mesh>(null);
  const verletBoxesRef = useRef<ResolvedCableProxyBox[]>([]);
  const proxyConfigRef = useRef(controls);
  proxyConfigRef.current = controls;

  const isPaused = usePauseStore((s) => s.isPaused);
  const wasPausedRef = useRef(isPaused);

  useEffect(() => {
    if (!wasPausedRef.current && isPaused) {
      resetChairToDefaultPose(bodyRef.current);
    }
    wasPausedRef.current = isPaused;
  }, [isPaused]);

  const resolveVerletBoxes = () => {
    const mesh = colliderMeshRef.current;
    if (!mesh) return [];

    mesh.updateWorldMatrix(true, false);
    const {
      baseHalfExtents,
      baseLocalOffset,
      backHalfExtents,
      backLocalOffset,
    } = proxyConfigRef.current;
    resolveChairCableProxyBoxes(
      mesh.matrixWorld,
      [
        { halfExtents: baseHalfExtents, localOffset: baseLocalOffset },
        { halfExtents: backHalfExtents, localOffset: backLocalOffset },
      ],
      verletBoxesRef.current,
    );
    return verletBoxesRef.current;
  };

  useEffect(() => {
    return registerSciFiVerletPropBoxProvider(resolveVerletBoxes);
  }, []);

  const chairCollision = sciFiPropDynamicCollisionGroups();

  const camExcludeCollision = { camExcludeCollision: true } as const;

  return (
    <group userData={camExcludeCollision}>
      <RigidBody
        ref={bodyRef}
        {...props}
      type="dynamic"
      colliders={false}
      ccd
      canSleep={false}
      friction={CHAIR_PHYSICS_FRICTION}
      restitution={0}
      mass={10}
      linearDamping={0.25}
      angularDamping={0.5}
        position={SHIP_CHAIR_DEFAULT_POSITION}
        collisionGroups={chairCollision}
        solverGroups={chairCollision}
      >
        <group position={[0, 0.055, 6.801]}>
          <group position={[0, 0.4, -0.073]} scale={0.961}>
            <mesh
              castShadow
              receiveShadow
              geometry={seat.geometry}
              material={plasticMaterial}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={frame.geometry}
              material={metalMaterial}
            />
          </group>
        </group>

      <CuboidCollider
        args={[
          controls.baseHalfExtents.x,
          controls.baseHalfExtents.y,
          controls.baseHalfExtents.z,
        ]}
        position={cuboidColliderPosition(controls.baseLocalOffset)}
        friction={CHAIR_PHYSICS_FRICTION}
      />
      <CuboidCollider
        args={[
          controls.backHalfExtents.x,
          controls.backHalfExtents.y,
          controls.backHalfExtents.z,
        ]}
        position={cuboidColliderPosition(controls.backLocalOffset)}
        friction={CHAIR_PHYSICS_FRICTION}
      />
      <mesh
        ref={colliderMeshRef}
        geometry={collider.geometry}
        position={CHAIR_COLLIDER_ANCHOR}
        scale={0.214}
        visible={false}
      />
      </RigidBody>

      <ChairVerletProxyWireframe
        show={controls.showWireframe}
        resolveBoxes={resolveVerletBoxes}
      />
    </group>
  );
}

useGLTF.preload(modelPath);
