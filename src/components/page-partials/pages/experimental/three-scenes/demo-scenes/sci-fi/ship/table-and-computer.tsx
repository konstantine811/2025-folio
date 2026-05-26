import { JSX } from "react";
import { useGLTF } from "@react-three/drei";
import { interactionGroups, RigidBody } from "@react-three/rapier";
import { useControls } from "leva";
import { type Mesh } from "three";
import {
  SCIFI_CHARACTER_CONTROLLER_GROUP,
  SCIFI_PROP_COLLIDER_GROUP,
} from "../sci-fi-collision-groups";

const modelPath = "/3d-models/sci-fi/table_and_computer.glb";

export function TableAndComputer(props: JSX.IntrinsicElements["group"]) {
  const { nodes } = useGLTF(modelPath);
  const {
    position,
    rotationY,
    scale,
  } = useControls("Sci-fi props / Table computer", {
    position: { value: { x: -2.35, y: 0.1, z: 9.18 }, step: 0.05 },
    rotationY: { value: 29, min: -180, max: 180, step: 1 },
    scale: { value: 0.93, min: 0.1, max: 3, step: 0.01 },
  });

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
  const propCollisionGroups = interactionGroups(SCIFI_PROP_COLLIDER_GROUP, [
    SCIFI_CHARACTER_CONTROLLER_GROUP,
    0,
  ]);

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
          <mesh
            geometry={(nodes.monitor_bottom_collider as Mesh).geometry}
            visible={false}
          />
          <mesh
            geometry={(nodes.monitor_top_collider as Mesh).geometry}
            visible={false}
          />
        </group>
      </RigidBody>
    </>
  );
}

useGLTF.preload(modelPath);
