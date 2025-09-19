import { JSX } from "react";
import { useGLTF } from "@react-three/drei";
import { publicModelPath } from "../../../config/3d-model.config";
import { SkinnedMesh } from "three";
import { RigidBody } from "@react-three/rapier";

type Props = JSX.IntrinsicElements["group"] & {};

const path = publicModelPath("robot_convex_hull.glb");

export function TrimeshRobot({ ...props }: Props) {
  const { nodes } = useGLTF(path);

  return (
    <group {...props} dispose={null}>
      <RigidBody type="fixed" colliders="trimesh">
        <mesh
          geometry={(nodes.Cylinder004 as SkinnedMesh).geometry}
          material={(nodes.Cylinder004 as SkinnedMesh).material}
          material-opacity={0}
          material-transparent={true}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload(path);
