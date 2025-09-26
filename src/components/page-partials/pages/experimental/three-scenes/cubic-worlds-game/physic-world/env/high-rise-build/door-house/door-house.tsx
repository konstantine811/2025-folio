import {
  interactionGroups,
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { CollisionWorldType } from "../../../../../config/collision";
import { BufferGeometry, Material, NormalBufferAttributes } from "three";

type Props = {
  geometry: BufferGeometry<NormalBufferAttributes>;
  material: Material;
};

const DoorHouse = ({ geometry, material }: Props) => {
  const frameRef = useRef<RapierRigidBody>(null!); // нерухома рама
  const doorRef = useRef<RapierRigidBody>(null!); // динамічні двері

  const joint = useRevoluteJoint(frameRef, doorRef, [
    [0, 0, 0],
    [0, 0, 0],
    [0, 1, 0],
  ]);

  useEffect(() => {
    if (joint.current) {
      joint.current.setLimits(-Math.PI / 2, Math.PI / 2);
    }
  }, [joint]);
  return (
    <>
      <RigidBody
        ref={frameRef}
        type="fixed"
        colliders={false}
        position={[0, 0.14, 0]}
      />
      {/* <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh> */}
      <RigidBody
        ref={doorRef}
        colliders="hull"
        position={[0, 0.16, 0]}
        collisionGroups={interactionGroups(CollisionWorldType.doorHouse, [
          CollisionWorldType.mainCharacter,
        ])}
        mass={0}
        friction={0}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={geometry}
          material={material}
        />
      </RigidBody>
    </>
  );
};

export default DoorHouse;
