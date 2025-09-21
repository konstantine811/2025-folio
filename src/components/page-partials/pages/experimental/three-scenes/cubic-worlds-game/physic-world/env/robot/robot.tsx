import { JSX, useEffect, useRef } from "react";
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
  Object.entries(materials).forEach(([key, mat]) => {
    console.log("mat", key, mat);
  });
  return (
    <>
      <group {...props} dispose={null} ref={groupRef}>
        <mesh
          receiveShadow
          castShadow
          geometry={(nodes.Cube728 as Mesh).geometry}
          material={
            new MeshStandardMaterial({
              color: "#A49682",
              metalness: 0.2,
              roughness: 1.5,
              side: 2, // FrontSide
            })
          }
        />

        <mesh
          receiveShadow
          castShadow
          geometry={(nodes.Cube728_1 as Mesh).geometry}
          material={
            new MeshStandardMaterial({
              color: "white",
              metalness: 0.5,
              roughness: 0.5,
              side: 2, // FrontSide
            })
          }
        />
        <mesh
          receiveShadow
          castShadow
          geometry={(nodes.Cube728_2 as Mesh).geometry}
          material={
            new MeshStandardMaterial({
              color: "black",
              metalness: 0.5,
              roughness: 0.5,
              side: 2, // FrontSide
            })
          }
        />
        <mesh
          receiveShadow
          castShadow
          geometry={(nodes.Cube728_3 as Mesh).geometry}
          material={
            new MeshStandardMaterial({
              color: "white",
              metalness: 0.5,
              roughness: 0.5,
              side: 2, // FrontSide
            })
          }
        />
        <TrimeshRobot />
      </group>
    </>
  );
}

useGLTF.preload(path);
