import { useGLTF } from "@react-three/drei";
import { JSX } from "react";
import { Color, SkinnedMesh } from "three";

type Props = JSX.IntrinsicElements["group"] & {};

export function Glasses({ ...props }: Props) {
  const { nodes } = useGLTF("/3d-models/cubic-worlds-model/glasses.glb");
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.frame as SkinnedMesh).geometry}
      >
        <gradientMaterial
          transparent
          depthWrite={false}
          // ↓ приклади налаштувань (аналог твоїх Group Input)
          baseColor={new Color("#000000")}
          randomK={0}
          specularAmount={0}
          specularPower={0}
          bottomHeight={10.2}
          bottomSoftness={10.2}
          edgeStrength={0}
          edgePower={20.2}
          emissionStrength={0}
          transparency={0}
          noiseScale={40.0}
        />
      </mesh>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.glass as SkinnedMesh).geometry}
      >
        <gradientMaterial
          transparent
          depthWrite={false}
          // ↓ приклади налаштувань (аналог твоїх Group Input)
          baseColor={new Color("#CCE0F6")}
          bottomHeight={1.232}
          bottomSoftness={1}
          specularPower={10}
          transparency={0.2}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload("/3d-models/cubic-worlds-model/glasses.glb");
