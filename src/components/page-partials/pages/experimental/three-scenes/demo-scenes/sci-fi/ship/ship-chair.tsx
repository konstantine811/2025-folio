import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import {
  MeshCollider,
  RigidBody,
  type RigidBodyProps,
  interactionGroups,
} from "@react-three/rapier";
import { Mesh, MeshStandardMaterial } from "three";
import {
  SCIFI_CABLE_GROUP,
  SCIFI_CHARACTER_CONTROLLER_GROUP,
  SCIFI_PROP_COLLIDER_GROUP,
} from "../sci-fi-collision-groups";

const modelPath = "/3d-models/sci-fi/chairglb.glb";

/** < 1 darkens albedo; emissive is cleared to stop blow-out under scene lights. */
const CHAIR_MATERIAL_BRIGHTNESS = 0.5;

function useTunedChairMaterial(source: MeshStandardMaterial) {
  const material = useMemo(() => source.clone(), [source]);
  const baseColor = useMemo(() => source.color.clone(), [source]);

  useEffect(() => {
    material.color.copy(baseColor).multiplyScalar(CHAIR_MATERIAL_BRIGHTNESS);
    material.emissive.setHex(0x000000);
    material.emissiveIntensity = 0;
    material.needsUpdate = true;
  }, [material, baseColor]);

  useEffect(() => () => material.dispose(), [material]);

  return material;
}

/** Dynamic chair — pushable by the controller capsule, world and cables. */
const chairCollisionGroups = interactionGroups(SCIFI_PROP_COLLIDER_GROUP, [
  0,
  SCIFI_CHARACTER_CONTROLLER_GROUP,
  SCIFI_CABLE_GROUP,
]);

/** Chair the character sits on at the start of the scroll timeline. */
export function ShipChair(props: RigidBodyProps) {
  const { nodes, materials } = useGLTF(modelPath);

  const seat = nodes["Chair-ADDE001"] as Mesh;
  const frame = nodes["Chair-ADDE001_1"] as Mesh;
  const collider = nodes.chair_collider as Mesh;

  const plasticMaterial = useTunedChairMaterial(
    materials["Chair-Plastic.001"] as MeshStandardMaterial,
  );
  const metalMaterial = useTunedChairMaterial(
    materials["Chair-Metal.001"] as MeshStandardMaterial,
  );

  return (
    <RigidBody
      {...props}
      type="dynamic"
      colliders={false}
      includeInvisible
      friction={1}
      restitution={0}
      linearDamping={0.4}
      angularDamping={0.6}
      position={[0, 0, 7]}
      collisionGroups={chairCollisionGroups}
    >
      <group position={[0, 0.055, 6.801]}>
        <group position={[0, 0.4, -0.073]} scale={0.961}>
          <mesh
            castShadow
            receiveShadow
            geometry={seat.geometry}
            material={plasticMaterial}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={frame.geometry}
            material={metalMaterial}
          />
        </group>
      </group>

      <MeshCollider type="hull">
        <mesh
          geometry={collider.geometry}
          position={[0, 0.282, 6.719]}
          scale={0.214}
          material-visible={false}
        />
      </MeshCollider>
    </RigidBody>
  );
}

useGLTF.preload(modelPath);
