import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { ReactNode, useRef } from "react";
import { Group } from "three";

import { useCharacterControllerPhysics } from "../useCharacterControllerPhysics";
import { Component, Entity, EntityType } from "../ecs";
import { WeaponSensor } from "../character-attachment/weapon-sensor";
import { CharacterRenderProps } from "../store/character-controller-store";

const DEFAULT_CAPSULE_HALF_HEIGHT = 0.8;
const DEFAULT_CAPSULE_RADIUS = 0.4;

type CharacterControllerProps = {
  startPosition?: [number, number, number];
  modelPosition?: [number, number, number];
  modelScale?: number;

  /** Rapier capsule half-height (cylinder section). Default: 0.8 */
  capsuleHalfHeight?: number;
  /** Rapier capsule radius. Default: 0.4 */
  capsuleRadius?: number;

  hasWeaponSensor?: boolean;

  /** Rapier collision groups for the player capsule (from interactionGroups). */
  capsuleCollisionGroups?: number;
  /** Groups ground/wall raycasts may hit. Default: [1, 2] */
  raycastFilterGroups?: readonly number[];
  /** Rapier membership group for ground/wall raycasts. Default: 0 */
  raycastMembershipGroup?: number;

  /** Initial visual Y rotation for modelRef (radians). Default: 0 */
  startModelRotationY?: number;

  /** When false, external code drives the main camera during play. */
  manageCamera?: boolean;

  gravityScale?: number;
  moveSpeed?: number;
  jumpForce?: number;
  airControl?: number;

  renderCharacter: (props: CharacterRenderProps) => ReactNode;
};

export function CharacterController({
  startPosition = [0, 6, 1],
  capsuleHalfHeight = DEFAULT_CAPSULE_HALF_HEIGHT,
  capsuleRadius = DEFAULT_CAPSULE_RADIUS,
  hasWeaponSensor = false,
  capsuleCollisionGroups,
  raycastFilterGroups,
  raycastMembershipGroup,
  startModelRotationY = 0,
  manageCamera = true,
  gravityScale = 3,
  moveSpeed,
  jumpForce,
  airControl,
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
    raycastMembershipGroup,
    raycastFilterGroups,
    startModelRotationY,
    manageCamera,
    moveSpeed,
    jumpForce,
    airControl,
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
            gravityScale={gravityScale}
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
              collisionGroups={capsuleCollisionGroups}
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
