import { useGLTF } from "@react-three/drei";
import { JSX, useEffect, useRef } from "react";
import { Group, Mesh, MeshStandardMaterial } from "three";
import { publicModelPath } from "../../../config/3d-model.config";
import { RigidBody } from "@react-three/rapier";
import { useEditModeStore } from "../../../store/useEditModeStore";
import ObstacleWrapper from "../../../nav-mesh/obstacle-wrapper";

type Props = JSX.IntrinsicElements["group"] & {};

const path = publicModelPath("dune.glb");

export function DuneModel({ ...props }: Props) {
  const { nodes, materials } = useGLTF(path);
  const groupRef = useRef<Group>(null);
  const setTargetMesh = useEditModeStore((s) => s.setTargets);
  const groundMat = materials.ground as MeshStandardMaterial;
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.name = "dune";
      setTargetMesh(groupRef.current);
    }
  }, [setTargetMesh]);
  return (
    <group {...props} dispose={null} ref={groupRef}>
      <RigidBody
        userData={{ isGround: true }}
        type="fixed"
        colliders="trimesh"
        friction={1}
        restitution={0}
      >
        <ObstacleWrapper>
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.dune104 as Mesh).geometry}
            rotation={[-0.075, -0.801, -0.039]}
          >
            <meshStandardMaterial
              attach="material"
              map={groundMat.map}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        </ObstacleWrapper>
      </RigidBody>
    </group>
  );
}

useGLTF.preload(path);
