import { JSX, useEffect, useMemo } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import {
  MeshPhysicalMaterial,
  MeshStandardMaterial,
} from "three";
import { useControls } from "leva";

const modelPath = "/3d-models/sci-fi/ship-container.glb";
const texturePath = "/3d-models/sci-fi/ship_baking.jpg";
export function ShipContainer(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(modelPath);

  const bakedTexture = useTexture(texturePath);
  bakedTexture.flipY = false;
  bakedTexture.colorSpace = "srgb";
  const { tint } = useControls({
    tint: { value: "#7f7986", label: "Baked tint" },
  });
  const bakedMat = useMemo(
    () =>
      new MeshStandardMaterial({
        map: bakedTexture,
        roughness: 0.77,
        metalness: 0.8,
        color: tint,
      }),
    [bakedTexture, tint],
  );

  const {
    opacity: gOpacity,
    roughness: gRoughness,
    metalness: gMetalness,
    color: gColor,
    transmission: gTransmission,
    thickness: gThickness,
    ior: gIor,
  } = useControls("Window glass (mutate GLTF)", {
    opacity: { value: 0.35, min: 0, max: 1, step: 0.01 },
    roughness: { value: 0.15, min: 0, max: 1, step: 0.01 },
    metalness: { value: 0, min: 0, max: 1, step: 0.01 },
    color: "#ffffff",
    transmission: { value: 0.9, min: 0, max: 1, step: 0.01 },
    thickness: { value: 0.5, min: 0, max: 5, step: 0.01 },
    ior: { value: 1.5, min: 1, max: 2.5, step: 0.01 },
  });

  useEffect(() => {
    const m = materials["Glass.001"] as
      | MeshStandardMaterial
      | MeshPhysicalMaterial;
    if (!m) return;
    m.transparent = gOpacity < 0.999;
    m.opacity = gOpacity;
    m.roughness = gRoughness;
    m.metalness = gMetalness;
    m.color.set(gColor);
    if (m instanceof MeshPhysicalMaterial) {
      m.transmission = gTransmission;
      m.thickness = gThickness;
      m.ior = gIor;
    }
    m.needsUpdate = true;
  }, [
    materials,
    gOpacity,
    gRoughness,
    gMetalness,
    gColor,
    gTransmission,
    gThickness,
    gIor,
  ]);

  useEffect(
    () => () => {
      bakedMat.dispose();
    },
    [bakedMat],
  );
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.support.geometry}
        material={materials.support}
        position={[0.054, 2.533, -0.042]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.window_frame.geometry}
        material={materials["Material.004"]}
        position={[0, 2.639, -0.92]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.ship_top.geometry}
        material={materials.shop_top}
        position={[0, 5.272, 17.861]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.ship_floor.geometry}
        material={materials.floor}
        position={[0, 0.057, 17.861]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.ship_top_white.geometry}
        material={materials.ship_top_white}
        position={[0, 5.257, 19.199]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.ship_husk.geometry}
        material={materials.shop_husk}
        position={[0, 2.671, 17.861]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.window_glass.geometry}
        material={materials["Glass.001"]}
        position={[0, 2.639, -0.951]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.light_frame.geometry}
        material={materials["Material.003"]}
        position={[0, 5.178, 1.543]}
      />
    </group>
  );
}

useGLTF.preload(modelPath);
useTexture.preload(texturePath);
