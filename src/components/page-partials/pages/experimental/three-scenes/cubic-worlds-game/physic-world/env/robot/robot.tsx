import { JSX, useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Group, Mesh } from "three";
import { TrimeshRobot } from "./trimesh-robot";
import { publicModelPath } from "../../../config/3d-model.config";
import { useEditModeStore } from "../../../store/useEditModeStore";

type Props = JSX.IntrinsicElements["group"] & {};

const path = publicModelPath("robot.glb");
export function Robot({ ...props }: Props) {
  const { nodes, materials } = useGLTF(path);
  const groupRef = useRef<Group>(null);
  const setTargetMesh = useEditModeStore((s) => s.setTargets);
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.name = "robot";
      setTargetMesh(groupRef.current);
    }
  }, [setTargetMesh]);
  return (
    <>
      <group {...props} dispose={null} ref={groupRef}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube216 as Mesh).geometry}
          material={materials["robot_2.001"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube216_1 as Mesh).geometry}
          material={materials["robot.003"]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube216_2 as Mesh).geometry}
          material={materials["black.002"]}
        />
        <TrimeshRobot />
      </group>
    </>
  );
}

useGLTF.preload(path);
