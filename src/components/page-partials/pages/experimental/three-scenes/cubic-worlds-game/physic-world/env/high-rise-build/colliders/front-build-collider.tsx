import { JSX } from "react";
import { useGLTF } from "@react-three/drei";
import { publicModelPath } from "../../../../config/3d-model.config";
import { Mesh } from "three";
import { interactionGroups, RigidBody } from "@react-three/rapier";
import { CollisionWorldType } from "../../../../../config/collision";

const path = publicModelPath("house_appartment_colliders/high_rise_build.glb");

type Props = JSX.IntrinsicElements["group"] & {};
export function FrontBuildColliderModel({ ...props }: Props) {
  const { nodes } = useGLTF(path);
  return (
    <group {...props} dispose={null}>
      <RigidBody
        type="fixed"
        colliders="trimesh"
        collisionGroups={interactionGroups(CollisionWorldType.doorFrame)}
      >
        <mesh
          material-visible={false}
          geometry={(nodes.Plane012 as Mesh).geometry}
          position={[7.894, -9.788, 26.567]}
          rotation={[1.581, 0, 0]}
          scale={15.65}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload(path);
