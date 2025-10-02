import { JSX, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { publicModelPath } from "../../../config/3d-model.config";
import { Mesh } from "three";
import { useFrame } from "@react-three/fiber";
import RotorSound from "./rotor-sound";

const path = publicModelPath("propeller-lamp.glb");

type Props = JSX.IntrinsicElements["group"] & {};

export function RotorModel(props: Props) {
  const { nodes, materials } = useGLTF(path);
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.1;
    }
  });
  return (
    <group {...props} dispose={null}>
      <RotorSound />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Cube as Mesh).geometry}
        material={materials["black.002"]}
        position={[0.963, 5.661, 0.422]}
        scale={[0.108, 0.068, 0.108]}
      />
      <group
        position={[0.962, 5.351, 0.421]}
        scale={[0.006, 0.287, 0.006]}
        ref={meshRef}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube011 as Mesh).geometry}
          material={(nodes.Cube011 as Mesh).material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube011_1 as Mesh).geometry}
          material={materials["Material.002"]}
        />
      </group>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Cube002 as Mesh).geometry}
        material={(nodes.Cube002 as Mesh).material}
        position={[0.963, 5.592, 0.422]}
        scale={[0.042, 0.026, 0.042]}
      />
    </group>
  );
}

useGLTF.preload(path);
