import {
  MeshTransmissionMaterial,
  useDetectGPU,
  useGLTF,
} from "@react-three/drei";
import { JSX } from "react";
import { SkinnedMesh } from "three";

type Props = JSX.IntrinsicElements["group"] & {
  transmissionSettings: {
    [key: string]:
      | { value: number; min?: number; max?: number; step?: number }
      | string
      | number
      | boolean;
  };
};

const WawaCard = ({ transmissionSettings, ...props }: Props) => {
  const { nodes, materials } = useGLTF("/3d-models/wawa-models/WawaCard.glb");
  const { tier, isMobile } = useDetectGPU();

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Plane as SkinnedMesh).geometry}
        material={materials.glass}
        rotation={[0, -1.571, 0]}
      >
        {tier !== 0 && !isMobile && (
          <MeshTransmissionMaterial
            {...transmissionSettings}
            toneMapped={false}
          />
        )}
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.number_ as SkinnedMesh).geometry}
          material={materials["white shiny"]}
          position={[0.145, 0.01, 0.705]}
          rotation={[0, 1.571, 0]}
          scale={0.172}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Text as SkinnedMesh).geometry}
          material={materials.logo}
          position={[-0.318, 0.012, -0.632]}
          rotation={[0, 1.571, 0]}
          scale={0.403}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Text002 as SkinnedMesh).geometry}
          material={materials["white.001"]}
          position={[0.423, 0.009, -0.534]}
          rotation={[0, 1.571, 0]}
          scale={0.018}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Text004 as SkinnedMesh).geometry}
          material={materials["white shiny"]}
          position={[0.427, 0.009, -0.542]}
          rotation={[0, 1.571, 0]}
          scale={0.064}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.wawa_sensei_3 as SkinnedMesh).geometry}
          material={materials["white shiny"]}
          position={[0.435, 0.009, 0.694]}
          rotation={[0, 1.571, 0]}
          scale={0.097}
        />
      </mesh>
    </group>
  );
};

export default WawaCard;

useGLTF.preload("/3d-models/wawa-models/WawaCard.glb");
