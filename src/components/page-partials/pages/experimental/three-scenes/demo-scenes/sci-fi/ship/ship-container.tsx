import { JSX, useEffect, useMemo, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import { useControls } from "leva";
import { CuboidCollider, RigidBody, interactionGroups } from "@react-three/rapier";
import { useRegisterCameraCollisionMeshes } from "@/components/common/hooks/camera/useRegisterCameraCollisionMeshes";

const modelPath = "/3d-models/sci-fi/ship-container.glb";
const texturePath = "/3d-models/sci-fi/ship_baking.jpg";
const cableCollisionGroup = 4;
const cableFloorCollisionGroup = 5;

const camWall = { camIncludeCollision: true } as const;
const camFloorExclude = { camExcludeCollision: true } as const;

export function ShipContainer(props: JSX.IntrinsicElements["group"]) {
  const rootRef = useRef<Group>(null);
  const { nodes, materials } = useGLTF(modelPath);

  useRegisterCameraCollisionMeshes(rootRef, [nodes]);

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
    <group {...props} ref={rootRef} dispose={null} name="ground">
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.support as Mesh).geometry}
        material={materials.support}
        position={[0.054, 2.533, -0.042]}
        userData={camWall}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.ship_top as Mesh).geometry}
        material={materials.shop_top}
        position={[0, 5.272, 17.861]}
        userData={camWall}
      />
      <RigidBody type="fixed" colliders="trimesh" friction={1}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.ship_floor as Mesh).geometry}
          material={materials.floor}
          position={[0, 0.057, 17.861]}
          userData={camFloorExclude}
        />
      </RigidBody>
      <RigidBody type="fixed" colliders="trimesh" friction={1}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.ship_husk as Mesh).geometry}
          material={materials.shop_husk}
          position={[0, 2.671, 17.861]}
          userData={camWall}
        />
      </RigidBody>
      <RigidBody type="fixed" colliders="trimesh" friction={0.6}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.window_glass as Mesh).geometry}
          material={materials["Glass.001"]}
          position={[0, 2.639, -0.951]}
          userData={camWall}
        />
      </RigidBody>
      <RigidBody type="fixed" colliders="trimesh" friction={1}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.window_frame as Mesh).geometry}
          material={materials["Material.004"]}
          position={[0, 2.639, -0.92]}
          userData={camWall}
        />
      </RigidBody>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[5.8, 0.08, 12.5]}
          position={[0, 0.035, 17.861]}
          collisionGroups={interactionGroups(cableFloorCollisionGroup, [
            cableCollisionGroup,
          ])}
          friction={2.2}
          restitution={0}
        />
      </RigidBody>
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.ship_top_white as Mesh).geometry}
        material={materials.ship_top_white}
        position={[0, 5.257, 19.199]}
        userData={camWall}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.light_frame as Mesh).geometry}
        material={materials["Material.003"]}
        position={[0, 5.178, 1.543]}
      />
    </group>
  );
}

useGLTF.preload(modelPath);
useTexture.preload(texturePath);
