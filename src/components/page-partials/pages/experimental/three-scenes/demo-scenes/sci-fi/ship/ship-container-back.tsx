import { JSX, useEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import { Color, Group, Mesh, MeshStandardMaterial } from "three";
import { RigidBody } from "@react-three/rapier";
import { useRegisterCameraCollisionMeshes } from "@/components/common/hooks/camera/useRegisterCameraCollisionMeshes";

const modelPath = "/3d-models/sci-fi/ship-container_back.glb";

const camWall = { camIncludeCollision: true } as const;
const tintColorScratch = new Color();

/** Leva folder (visible with #debug). */
export const SHIP_BACK_WALL_CONTROLS_PATH = "Sci-fi props / Ship back wall";

type ShipContainerBackProps = JSX.IntrinsicElements["group"] & {
  /** Textured hull material from ship-container.glb (back GLB has no bake map). */
  hullMaterial: MeshStandardMaterial;
};

/** Back wall with door opening — trimesh collider (not a simple box). */
export function ShipContainerBack({
  hullMaterial,
  ...props
}: ShipContainerBackProps) {
  const rootRef = useRef<Group>(null);
  const { nodes } = useGLTF(modelPath);

  const wallMaterial = useMemo(() => {
    const next = hullMaterial.clone();
    next.name = "ship_back_wall";
    return next;
  }, [hullMaterial]);

  const { tint, brightness, wallRoughness, wallMetalness, useBakeMap } =
    useControls(SHIP_BACK_WALL_CONTROLS_PATH, {
      useBakeMap: { value: true, label: "Bake texture" },
      tint: {
        value: "#ffffff",
        label: "Tint (× bake map)",
      },
      brightness: {
        value: 1,
        min: 0.1,
        max: 2,
        step: 0.01,
        label: "Brightness",
      },
      wallRoughness: {
        value: 0.6,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Roughness",
      },
      wallMetalness: {
        value: 0,
        min: 0,
        max: 1,
        step: 0.01,
        label: "Metalness",
      },
    });

  tintColorScratch.set(tint).multiplyScalar(brightness);
  wallMaterial.color.copy(tintColorScratch);
  wallMaterial.roughness = wallRoughness;
  wallMaterial.metalness = wallMetalness;
  wallMaterial.map = useBakeMap ? hullMaterial.map : null;
  wallMaterial.needsUpdate = true;

  useEffect(() => () => wallMaterial.dispose(), [wallMaterial]);

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
