import { useGLTF } from "@react-three/drei";
import {
  interactionGroups,
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import { JSX, useEffect, useRef } from "react";
import { SkinnedMesh } from "three";
import { CollisionWorldType } from "../../../config/collision";

type Props = JSX.IntrinsicElements["group"] & {};

export default function HouseModel({ ...props }: Props) {
  const { nodes, materials } = useGLTF(
    "/3d-models/cubic-worlds-model/house.glb"
  );
  const frameRef = useRef<RapierRigidBody>(null!); // нерухома рама
  const doorRef = useRef<RapierRigidBody>(null!); // динамічні двері

  // Створюємо шарнір (hinge): anchors і axes у ЛОКАЛЬНИХ системах кожного тіла
  const joint = useRevoluteJoint(frameRef, doorRef, [
    [0, 0, 0],
    [2.13, 0, 0.34],
    [0, 1, 0],
  ]);

  useEffect(() => {
    if (joint.current) {
      joint.current.setLimits(-Math.PI / 2, Math.PI / 2);
    }
  }, [joint]);
  return (
    <group {...props} dispose={null}>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh
          geometry={(nodes.house_wall as SkinnedMesh).geometry}
          material={materials["cube_material.002"]}
        />
      </RigidBody>
      <RigidBody
        collisionGroups={interactionGroups(CollisionWorldType.doorFrame)}
        type="fixed"
        colliders="trimesh"
      >
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.door_handle as SkinnedMesh).geometry}
          material={materials["cube_material.004"]}
        />
      </RigidBody>
      <mesh
        geometry={(nodes.roof as SkinnedMesh).geometry}
        material={materials["cube_material.002"]}
      />
      <RigidBody type="fixed" colliders="trimesh">
        <mesh
          geometry={(nodes.fundament as SkinnedMesh).geometry}
          material={materials["cube_material.003"]}
        />
      </RigidBody>
      <RigidBody
        ref={frameRef}
        type="fixed"
        colliders={false}
        position={[2.1, 0, 0.33]}
      />

      <RigidBody
        collisionGroups={interactionGroups(CollisionWorldType.doorHouse, [
          CollisionWorldType.mainCharacter,
        ])}
        ref={doorRef}
        colliders="hull"
        friction={2}
        mass={5}
      >
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
