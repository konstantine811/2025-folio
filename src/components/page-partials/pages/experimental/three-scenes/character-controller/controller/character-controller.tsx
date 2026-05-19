import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { ReactNode, useRef } from "react";
import { Group } from "three";

import { useCharacterControllerPhysics } from "../useCharacterControllerPhysics";
import { Component, Entity, EntityType } from "../ecs";
import { WeaponSensor } from "../character-attachment/weapon-sensor";
import { CharacterRenderProps } from "../store/character-controller-store";

const capsuleHalfHeight = 0.8;
const capsuleRadius = 0.4;

type CharacterControllerProps = {
  startPosition?: [number, number, number];
  modelPosition?: [number, number, number];
  modelScale?: number;

  hasWeaponSensor?: boolean;

  renderCharacter: (props: CharacterRenderProps) => ReactNode;
};

export function CharacterController({
  startPosition = [0, 6, 1],
  hasWeaponSensor = false,
  renderCharacter,
}: CharacterControllerProps) {
  const playerRef = useRef<EntityType>(null);
  const modelRef = useRef<Group>(null);
  const weaponAttachmentRef = useRef<Group>(null);

  const { controllerState } = useCharacterControllerPhysics({
    playerRef,
    modelRef,
    capsuleHalfHeight,
    capsuleRadius,
  });

  return (
    <>
      <Entity isPlayer ref={playerRef}>
        <Component name="rigidBody">
          <RigidBody
            colliders={false}
            mass={10}
            position={startPosition}
            enabledRotations={[false, false, false]}
            lockRotations
            gravityScale={3}
            friction={0.5}
            linearDamping={1}
            angularDamping={1}
            restitution={0}
            ccd={true}
            type="dynamic"
            userData={{ camExcludeCollision: true, type: "player" }}
          >
            <CapsuleCollider
              args={[capsuleHalfHeight, capsuleRadius]}
              position={[0, 0, 0]}
            />

            {renderCharacter({
              modelRef,
              weaponAttachmentRef,
              controllerState,
            })}
          </RigidBody>
        </Component>
      </Entity>

      <WeaponSensor
        enabled={hasWeaponSensor}
        weaponAttachmentRef={weaponAttachmentRef}
        position={[0.6, 1.05, 0.68]}
        size={[0.6, 0.07, 0.07]}
        collisionGroups={[2]}
      />
    </>
  );
}
