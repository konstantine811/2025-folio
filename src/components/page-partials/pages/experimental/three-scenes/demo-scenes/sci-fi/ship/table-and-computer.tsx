import { JSX } from "react";
import { useGLTF } from "@react-three/drei";
import {
  CuboidCollider,
  interactionGroups,
  RigidBody,
} from "@react-three/rapier";
import { useControls } from "leva";
import { type Mesh } from "three";
import {
  SCIFI_CABLE_GROUP,
  SCIFI_CHARACTER_CONTROLLER_GROUP,
  SCIFI_PROP_COLLIDER_GROUP,
} from "../sci-fi-collision-groups";
import {
  TABLE_CABLE_PROXY_CONTROLS_PATH,
  useSciFiTableCableProxyTransform,
} from "./table-cable-proxies";

const modelPath = "/3d-models/sci-fi/table_and_computer.glb";

export function TableAndComputer(props: JSX.IntrinsicElements["group"]) {
  const { nodes } = useGLTF(modelPath);
  const {
    position,
    rotationY,
    scale,
    cableProxyOnePosition,
    cableProxyOneHalfExtents,
    cableProxyTwoPosition,
    cableProxyTwoHalfExtents,
  } = useSciFiTableCableProxyTransform();
  const { showCableProxyWireframes } = useControls(
    TABLE_CABLE_PROXY_CONTROLS_PATH,
    {
      showCableProxyWireframes: {
        value: false,
        label: "Show cable proxy wireframes",
      },
    },
  );

  const transformPosition: [number, number, number] = [
    position.x,
    position.y,
    position.z,
  ];
  const transformRotation: [number, number, number] = [
    0,
    (rotationY * Math.PI) / 180,
    0,
  ];
  const transformScale: [number, number, number] = [scale, scale, scale];
  const scalePosition = (value: { x: number; y: number; z: number }) =>
    [value.x * scale, value.y * scale, value.z * scale] as [
      number,
      number,
      number,
    ];
  const propCollisionGroups = interactionGroups(SCIFI_PROP_COLLIDER_GROUP, [
    SCIFI_CABLE_GROUP,
    SCIFI_CHARACTER_CONTROLLER_GROUP,
    0,
  ]);
  const cableOnlyCollisionGroups = interactionGroups(SCIFI_PROP_COLLIDER_GROUP, [
    SCIFI_CABLE_GROUP,
  ]);
  const scaleSize = (value: { x: number; y: number; z: number }) =>
    [value.x * scale * 2, value.y * scale * 2, value.z * scale * 2] as [
      number,
      number,
      number,
    ];

  return (
    <>
      <group
        {...props}
        dispose={null}
        position={transformPosition}
        rotation={transformRotation}
        scale={transformScale}
      >
        <group scale={1.232}>
          <primitive object={nodes.Bone} />
          <primitive object={nodes.Bone004} />
        </group>
      </group>

      <RigidBody
        key={`${position.x}_${position.y}_${position.z}_${rotationY}_${scale}`}
        type="fixed"
        colliders="trimesh"
        includeInvisible
        friction={0.9}
        position={transformPosition}
        rotation={transformRotation}
        collisionGroups={propCollisionGroups}
      >
        <group scale={transformScale}>
          <mesh
            geometry={(nodes.table_collider as Mesh).geometry}
            position={[0.001, 0.957, 0.001]}
            rotation={[-Math.PI, 0, -Math.PI]}
            scale={[-0.305, -0.035, -0.319]}
            visible={false}
          />
          <group position={[0, 0, 0.07]}>
            <mesh
              geometry={(nodes.monitor_bottom_collider as Mesh).geometry}
              visible={false}
            />
            <mesh
              geometry={(nodes.monitor_top_collider as Mesh).geometry}
              visible={false}
            />
          </group>
        </group>
      </RigidBody>

      <RigidBody
        key={`cable_proxy_${position.x}_${position.y}_${position.z}_${rotationY}_${scale}_${cableProxyOnePosition.x}_${cableProxyOnePosition.y}_${cableProxyOnePosition.z}_${cableProxyOneHalfExtents.x}_${cableProxyOneHalfExtents.y}_${cableProxyOneHalfExtents.z}_${cableProxyTwoPosition.x}_${cableProxyTwoPosition.y}_${cableProxyTwoPosition.z}_${cableProxyTwoHalfExtents.x}_${cableProxyTwoHalfExtents.y}_${cableProxyTwoHalfExtents.z}`}
        type="fixed"
        colliders={false}
        position={transformPosition}
        rotation={transformRotation}
      >
        <CuboidCollider
          args={scalePosition(cableProxyOneHalfExtents)}
          position={scalePosition(cableProxyOnePosition)}
          collisionGroups={cableOnlyCollisionGroups}
          solverGroups={cableOnlyCollisionGroups}
          friction={2.4}
          restitution={0}
        />
        <CuboidCollider
          args={scalePosition(cableProxyTwoHalfExtents)}
          position={scalePosition(cableProxyTwoPosition)}
          collisionGroups={cableOnlyCollisionGroups}
          solverGroups={cableOnlyCollisionGroups}
          friction={2.4}
          restitution={0}
        />
      </RigidBody>

      {showCableProxyWireframes ? (
        <group
          position={transformPosition}
          rotation={transformRotation}
          userData={{ camExcludeCollision: true }}
        >
          <mesh position={scalePosition(cableProxyOnePosition)}>
            <boxGeometry args={scaleSize(cableProxyOneHalfExtents)} />
            <meshBasicMaterial
              color="#39d5ff"
              wireframe
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>
          <mesh position={scalePosition(cableProxyTwoPosition)}>
            <boxGeometry args={scaleSize(cableProxyTwoHalfExtents)} />
            <meshBasicMaterial
              color="#39d5ff"
              wireframe
              transparent
              opacity={0.8}
              depthWrite={false}
            />
          </mesh>
        </group>
      ) : null}
    </>
  );
}

useGLTF.preload(modelPath);
