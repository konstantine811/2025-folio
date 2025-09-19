import { JSX } from "react";
import { useGLTF } from "@react-three/drei";
import { SkinnedMesh } from "three";
import { TrimeshRobot } from "./trimesh-robot";
import { publicModelPath } from "../../../config/3d-model.config";

type Props = JSX.IntrinsicElements["group"] & {};

const path = publicModelPath("robot.glb");
export function Robot({ ...props }: Props) {
  const { nodes, materials } = useGLTF(path);

  return (
    <>
      <group {...props} dispose={null}>
        <mesh
          receiveShadow
          castShadow
          geometry={(nodes.Cube728 as SkinnedMesh).geometry}
          material={materials["robot_2.001"]}
        />

        <mesh
          receiveShadow
          castShadow
          geometry={(nodes.Cube728_1 as SkinnedMesh).geometry}
          material={materials["robot.003"]}
        />
        <mesh
          receiveShadow
          castShadow
          geometry={(nodes.Cube728_2 as SkinnedMesh).geometry}
          material={materials["black.002"]}
        />
        <mesh
          receiveShadow
          castShadow
          geometry={(nodes.Cube728_3 as SkinnedMesh).geometry}
          material={materials["robot.002"]}
        />
        <TrimeshRobot />
      </group>
    </>
  );
}

useGLTF.preload(path);
