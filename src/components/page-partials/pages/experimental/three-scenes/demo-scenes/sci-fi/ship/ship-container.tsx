import { JSX, useEffect, useMemo, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import {
  DoubleSide,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
} from "three";
import { useControls } from "leva";
import {
  CuboidCollider,
  RigidBody,
  interactionGroups,
} from "@react-three/rapier";
import { useRegisterCameraCollisionMeshes } from "@/components/common/hooks/camera/useRegisterCameraCollisionMeshes";
import { ShipContainerBack } from "./ship-container-back";
import { ShipDoor } from "./ship-door";

const modelPath = "/3d-models/sci-fi/ship-container.glb";
const texturePath = "/3d-models/sci-fi/ship_baking.jpg";
const cableCollisionGroup = 4;
const cableFloorCollisionGroup = 5;

const camWall = { camIncludeCollision: true } as const;
const camFloorExclude = { camExcludeCollision: true } as const;

type ShipContainerProps = JSX.IntrinsicElements["group"] & {
  /** FBO / preview only — meshes without Rapier or interactive door. */
  visualOnly?: boolean;
};

export function ShipContainer({
  visualOnly = false,
  ...props
}: ShipContainerProps) {
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
    highQualityTransmission: gHighQualityTransmission,
    opacity: gOpacity,
    roughness: gRoughness,
    color: gColor,
    transmission: gTransmission,
    thickness: gThickness,
    ior: gIor,
    clearcoat: gClearcoat,
    clearcoatRoughness: gClearcoatRoughness,
    envMapIntensity: gEnvMapIntensity,
  } = useControls("Window glass", {
    highQualityTransmission: {
      value: false,
      label: "High quality transmission",
    },
    opacity: { value: 0.75, min: 0, max: 1, step: 0.01 },
    roughness: { value: 1, min: 0, max: 1, step: 0.01 },
    color: "#101010",
    transmission: { value: 0.96, min: 0, max: 1, step: 0.01 },
    thickness: { value: 0.58, min: 0, max: 2, step: 0.01 },
    ior: { value: 1.45, min: 1, max: 2.5, step: 0.01 },
    clearcoat: { value: 1, min: 0, max: 1, step: 0.01 },
    clearcoatRoughness: { value: 0.63, min: 0, max: 1, step: 0.01 },
    envMapIntensity: { value: 2.9, min: 0, max: 5, step: 0.05 },
  });
  const glassMat = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: gColor,
        transparent: true,
        opacity: gOpacity,
        roughness: gRoughness,
        metalness: 0,
        transmission: gHighQualityTransmission ? gTransmission : 0,
        thickness: gHighQualityTransmission ? gThickness : 0,
        ior: gIor,
        clearcoat: gClearcoat,
        clearcoatRoughness: gClearcoatRoughness,
        envMapIntensity: gEnvMapIntensity,
        attenuationColor: gColor,
        attenuationDistance: 2.5,
        side: DoubleSide,
        depthWrite: false,
      }),
    [
      gClearcoat,
      gClearcoatRoughness,
      gColor,
      gEnvMapIntensity,
      gHighQualityTransmission,
      gIor,
      gOpacity,
      gRoughness,
      gThickness,
      gTransmission,
    ],
  );

  useEffect(
    () => () => {
      bakedMat.dispose();
      glassMat.dispose();
    },
    [bakedMat, glassMat],
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
      {visualOnly ? (
        <>
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.ship_floor as Mesh).geometry}
            material={bakedMat}
            position={[0, 0.057, 17.861]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.ship_husk as Mesh).geometry}
            material={bakedMat}
            position={[0, 2.671, 17.861]}
          />
          <mesh
            geometry={(nodes.window_glass as Mesh).geometry}
            material={glassMat}
            position={[0, 2.639, -0.951]}
            renderOrder={20}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={(nodes.window_frame as Mesh).geometry}
            material={materials["Material.004"]}
            position={[0, 2.639, -0.92]}
          />
        </>
      ) : (
        <>
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
              receiveShadow={false}
              geometry={(nodes.window_glass as Mesh).geometry}
              material={glassMat}
              position={[0, 2.639, -0.951]}
              renderOrder={20}
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
        </>
      )}
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
      {!visualOnly && (
        <>
          <ShipContainerBack />
          <ShipDoor position={[0, 0.17, 0.2]} portalDirection="to-stylized" />
        </>
      )}
    </group>
  );
}

useGLTF.preload(modelPath);
useTexture.preload(texturePath);
