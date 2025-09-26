import { JSX, useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Group, Mesh, MeshStandardMaterial } from "three";
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

  const matRobotF = useMemo(() => {
    const m = (materials["robot_2.001"] as MeshStandardMaterial).clone();
    m.color.multiplyScalar(1); // 60% яскравості
    return m;
  }, [materials]);

  const matRobotT = useMemo(() => {
    const m = (materials["robot.003"] as MeshStandardMaterial).clone();
    m.color.multiplyScalar(1); // 60% яскравості
    return m;
  }, [materials]);
  return (
    <>
      <group {...props} dispose={null} ref={groupRef} frustumCulled={true}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube216 as Mesh).geometry}
          material={matRobotF}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube216_1 as Mesh).geometry}
          material={matRobotT}
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
