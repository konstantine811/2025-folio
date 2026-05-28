import { JSX, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Mesh, MeshStandardMaterial } from "three";

const modelPath = "/3d-models/sci-fi/ship-door.glb";

const doorRotation: [number, number, number] = [Math.PI, 0, Math.PI];
const doorMaterialKey = "04";

/** GLB exports material "04" with alphaMode BLEND — force opaque rendering. */
function createOpaqueDoorMaterial(source: MeshStandardMaterial) {
  const material = source.clone();
  material.transparent = false;
  material.opacity = 1;
  material.depthWrite = true;
  material.alphaTest = 0.5;
  return material;
}

/** Door meshes at the back wall opening — tweak positions in this file as needed. */
export function ShipDoor(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(modelPath);
  const material = useMemo(
    () => createOpaqueDoorMaterial(materials[doorMaterialKey] as MeshStandardMaterial),
    [materials],
  );

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["04-01001"] as Mesh).geometry}
        material={material}
        position={[0.022, -0.101, 36.546]}
        rotation={doorRotation}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["04-02001"] as Mesh).geometry}
        material={material}
        position={[0, -0.101, 36.546]}
        rotation={doorRotation}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["04001"] as Mesh).geometry}
        material={material}
        position={[0, -0.101, 36.546]}
        rotation={doorRotation}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes["04002"] as Mesh).geometry}
        material={material}
        position={[0, -0.101, 36.546]}
        rotation={doorRotation}
      />
    </group>
  );
}

useGLTF.preload(modelPath);
