import { JSX, useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import { Group, Mesh, MeshStandardMaterial } from "three";
import { RigidBody } from "@react-three/rapier";
import { useRegisterCameraCollisionMeshes } from "@/components/common/hooks/camera/useRegisterCameraCollisionMeshes";

const modelPath = "/3d-models/sci-fi/ship-container_back.glb";

const camWall = { camIncludeCollision: true } as const;

/** Leva folder (visible with #debug). */
export const SHIP_BACK_WALL_CONTROLS_PATH = "Sci-fi props / Ship back wall";

function useBackWallMaterial(source: MeshStandardMaterial) {
  const material = useMemo(() => source.clone(), [source]);

  const { color, brightness, roughness, metalness } = useControls(
    SHIP_BACK_WALL_CONTROLS_PATH,
    {
      color: { value: "#b8bcc4", label: "Albedo" },
      brightness: {
        value: 1,
        min: 0.1,
        max: 2,
        step: 0.01,
        label: "Brightness",
      },
      roughness: {
        value: source.roughness,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Roughness",
      },
      metalness: {
        value: source.metalness,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Metalness",
      },
    },
  );

  useEffect(() => {
    material.color.set(color).multiplyScalar(brightness);
    material.roughness = roughness;
    material.metalness = metalness;
    material.needsUpdate = true;
  }, [material, color, brightness, roughness, metalness]);

  useEffect(() => () => material.dispose(), [material]);

  return material;
}

/** Back wall with door opening — trimesh collider (not a simple box). */
export function ShipContainerBack(props: JSX.IntrinsicElements["group"]) {
  const rootRef = useRef<Group>(null);
  const { nodes, materials } = useGLTF(modelPath);
  const wallMaterial = useBackWallMaterial(
    materials.shop_husk as MeshStandardMaterial,
  );

  useRegisterCameraCollisionMeshes(rootRef, [nodes]);

  return (
    <group {...props} ref={rootRef} dispose={null}>
      <RigidBody type="fixed" colliders="trimesh" friction={1}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.ship_wall_back as Mesh).geometry}
          material={wallMaterial}
          position={[0, 0, -0.156]}
          userData={camWall}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload(modelPath);
