import {
  MeshTransmissionMaterial,
  useGLTF,
  useScroll,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { JSX, useRef } from "react";
import { Group, SkinnedMesh } from "three";

type Props = JSX.IntrinsicElements["group"] & {
  transmissionSettings: {
    [key: string]:
      | { value: number; min?: number; max?: number; step?: number }
      | string
      | number
      | boolean;
  };
};

const WawaCoin = ({ transmissionSettings, ...props }: Props) => {
  const { nodes, materials } = useGLTF("/3d-models/wawa-models/WawaCoin.glb");
  const data = useScroll();
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      const rotSpeed = Math.max(1, (1 - data.range(1 / 4, 1 / 4)) * 3);
      ref.current.rotation.y += rotSpeed * delta;
    }
  });
  return (
    <group {...props} ref={ref}>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Circle as SkinnedMesh).geometry}
        material={materials.glass}
      >
        <MeshTransmissionMaterial
          {...transmissionSettings}
          toneMapped={false}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Text as SkinnedMesh).geometry}
        material={materials["logo"]}
        position={[0, 0.088, 0.069]}
        scale={0.483}
      />
    </group>
  );
};

export default WawaCoin;
useGLTF.preload("/3d-models/wawa-models/WawaCoin.glb");
