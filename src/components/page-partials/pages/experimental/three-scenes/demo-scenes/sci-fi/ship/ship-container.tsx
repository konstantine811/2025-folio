import { JSX, useEffect, useMemo, useRef } from "react";
import { useGLTF, useTexture } from "@react-three/drei";
import { Group, Mesh, MeshPhysicalMaterial } from "three";
import {
  CuboidCollider,
  RigidBody,
  interactionGroups,
} from "@react-three/rapier";
import { useRegisterCameraCollisionMeshes } from "@/components/common/hooks/camera/useRegisterCameraCollisionMeshes";
import { ShipContainerBack } from "./ship-container-back";
import { ShipDoor } from "./ship-door";
import { ShipWallSupport } from "./ship-wall-support";
import { ShipChair } from "./ship-chair";
import { useSciFiChairControls } from "./ship-chair-cable-proxies";

const modelPath = "/3d-models/sci-fi/ship-container.glb";
const texturePath = "/3d-models/sci-fi/ship_baking.jpg";
const cableCollisionGroup = 4;
const cableFloorCollisionGroup = 5;

const camWall = { camIncludeCollision: true } as const;
const camExcludeCollision = { camExcludeCollision: true } as const;
const camFloorExclude = camExcludeCollision;

type ShipContainerProps = JSX.IntrinsicElements["group"] & {
  /** Hide in-canvas Html prompts (e.g. CameraControls inspect mode). */
  hideSceneHtml?: boolean;
};

export function ShipContainer({
  hideSceneHtml = false,
  ...props
}: ShipContainerProps) {
  const rootRef = useRef<Group>(null);
  const chairControls = useSciFiChairControls();
  const { nodes, materials } = useGLTF(modelPath);

  useRegisterCameraCollisionMeshes(rootRef, [nodes]);

  const windowGlassMat = useMemo(() => {
    const mesh = nodes.window_glass as Mesh;
    const source = (
      Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
    ) as MeshPhysicalMaterial | undefined;

    if (!source?.clone) {
      throw new Error(
        `Ship window_glass material missing. GLB keys: ${Object.keys(materials).join(", ")}`,
      );
    }

    const mat = source.clone();
    mat.normalScale.set(0, 0);
    mat.opacity = 0.3;
    return mat;
  }, [nodes, materials]);

  useEffect(() => () => windowGlassMat.dispose(), [windowGlassMat]);

  return (
    <group {...props} ref={rootRef} dispose={null} name="ground">
      <mesh
        castShadow
        receiveShadow
        geometry={(nodes.support as Mesh).geometry}
        material={materials.support}
        position={[0.054, 2.533, -0.042]}
        userData={camExcludeCollision}
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
          receiveShadow={false}
          geometry={(nodes.window_glass as Mesh).geometry}
          material={windowGlassMat}
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
      <ShipContainerBack />
      <ShipDoor position={[0, 0.17, 0.2]} hideHtmlOverlay={hideSceneHtml} />
      <ShipWallSupport />
      {chairControls.chairEnabled ? (
        <ShipChair controls={chairControls} />
      ) : null}
    </group>
  );
}

useGLTF.preload(modelPath);
useTexture.preload(texturePath);
