import { JSX } from "react";
import { useGLTF } from "@react-three/drei";
import { publicModelPath } from "../../../config/3d-model.config";
import { Mesh } from "three";
import { RigidBody } from "@react-three/rapier";

type Props = JSX.IntrinsicElements["group"] & {};

const path = publicModelPath("bedroll.glb");

export function BedRoll({ ...props }: Props) {
  const { nodes, materials } = useGLTF(path);
  return (
    <group {...props} dispose={null}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.bedrolll as Mesh).geometry}
          material={materials.bedroll}
          position={[1.38, 0, -4.203]}
          rotation={[Math.PI, -0.101, Math.PI]}
          scale={[0.45, 0.025, 1.156]}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload(path);
