import { useGLTF } from "@react-three/drei";
import {
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import { JSX, useRef } from "react";
import { SkinnedMesh } from "three";

type Props = JSX.IntrinsicElements["group"] & {};

export default function HouseModel({ ...props }: Props) {
  const { nodes, materials } = useGLTF(
    "/3d-models/cubic-worlds-model/house.glb"
  );
  const frameRef = useRef<RapierRigidBody>(null!); // нерухома рама
  const doorRef = useRef<RapierRigidBody>(null!); // динамічні двері

  // Створюємо шарнір (hinge): anchors і axes у ЛОКАЛЬНИХ системах кожного тіла
  useRevoluteJoint(frameRef, doorRef, [
    [0, 0, 0],
    [2.13, 0, 0.26],
    [0, 1, 0],
  ]);
  return (
    <group {...props} dispose={null}>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.house_wall as SkinnedMesh).geometry}
          material={materials["cube_material.002"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.door_handle as SkinnedMesh).geometry}
          material={materials["cube_material.004"]}
        />
      </RigidBody>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.roof as SkinnedMesh).geometry}
        material={materials["cube_material.002"]}
      />
      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.fundament as SkinnedMesh).geometry}
          material={materials["cube_material.003"]}
        />
      </RigidBody>
      <RigidBody
        ref={frameRef}
        type="fixed"
        colliders={false}
        position={[2.1, 0, 0.35]}
        // position={[0, 0, 0]}
      >
        <mesh>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshBasicMaterial color="red" wireframe />
        </mesh>
      </RigidBody>
      <RigidBody ref={doorRef} colliders="hull">
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.door as SkinnedMesh).geometry}
          material={materials["cube_material.004"]}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload("/3d-models/cubic-worlds-model/house.glb");
