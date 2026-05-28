import { JSX, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { Group, Mesh } from "three";
import { RigidBody } from "@react-three/rapier";
import { useRegisterCameraCollisionMeshes } from "@/components/common/hooks/camera/useRegisterCameraCollisionMeshes";

const modelPath = "/3d-models/sci-fi/ship-container_back.glb";

const camWall = { camIncludeCollision: true } as const;

/** Back wall with door opening — trimesh collider (not a simple box). */
export function ShipContainerBack(props: JSX.IntrinsicElements["group"]) {
  const rootRef = useRef<Group>(null);
  const { nodes, materials } = useGLTF(modelPath);

  useRegisterCameraCollisionMeshes(rootRef, [nodes]);

  return (
    <group {...props} ref={rootRef} dispose={null}>
      <RigidBody type="fixed" colliders="trimesh" friction={1}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.ship_wall_back as Mesh).geometry}
          material={materials.shop_husk}
          position={[0, 0, -0.156]}
          userData={camWall}
        />
      </RigidBody>
    </group>
  );
}

useGLTF.preload(modelPath);
