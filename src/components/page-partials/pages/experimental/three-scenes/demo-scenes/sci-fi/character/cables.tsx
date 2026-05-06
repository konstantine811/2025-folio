import { useGLTF } from "@react-three/drei";
import { JSX } from "react";
import { Mesh } from "three";

const cablesPath = "/3d-models/sci-fi/cables.glb";

export function CablesModel(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(cablesPath);
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Cable_1 as Mesh).geometry}
        material={materials["Material.002"]}
        position={[-0.77, 0.827, 22.09]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Cable_2 as Mesh).geometry}
        material={materials["Material.002"]}
        position={[0.069, 1.592, 9.634]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[2.775, 1, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Cable_3 as Mesh).geometry}
        material={materials["Material.002"]}
        position={[-0.077, 1.626, 9.626]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[2.775, 1, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Cable_4 as Mesh).geometry}
        material={materials["Material.002"]}
        position={[0.099, 1.626, 9.625]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[2.775, 1, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Cable_5 as Mesh).geometry}
        material={materials["Material.002"]}
        position={[-0.056, 1.601, 9.659]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[2.775, 1, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Cable_6 as Mesh).geometry}
        material={materials["Material.002"]}
        position={[0.081, 1.599, 9.666]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[2.775, 1, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Cable_7 as Mesh).geometry}
        material={materials["Material.002"]}
        position={[0.114, 1.633, 9.567]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[2.775, 1, 1]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.Cable_8 as Mesh).geometry}
        material={materials["Material.002"]}
        position={[-0.095, 1.634, 9.566]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[2.775, 1, 1]}
      />
    </group>
  );
}

useGLTF.preload("/cables.glb");
