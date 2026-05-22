import { SciFiCharacter } from "./sci-fi-character";
import { CharacterAnimations } from "../../../character-controller/models/character-controller.model";
import { CharacterController } from "../../../character-controller/controller/character-controller";
import { RefObject } from "react";
import {
  SCIFI_CHARACTER_CONTROLLER_GROUP,
  SCIFI_CONTROLLER_COLLIDES_WITH,
  sciFiControllerCapsuleCollisionGroups,
} from "../sci-fi-collision-groups";

type SciFiToggleCharacterProps = {
  mode: "scroll" | "controller";

  scrollProgressRef: RefObject<number>;

  animationType: CharacterAnimations;

  /** Visual facing offset for scroll mode (radians). */
  scrollModelRotationY?: number;
  /** Visual facing offset for controller mode (radians). */
  controllerModelRotationY?: number;
};

export function SciFiToggleCharacter({
  mode,
  scrollProgressRef,
  animationType,
  scrollModelRotationY = 0,
  controllerModelRotationY = 0,
}: SciFiToggleCharacterProps) {
  if (mode === "scroll") {
    return (
      <group position={[0, 0.1, 13.821]} scale={1}>
        <SciFiCharacter
          driver="scroll"
          scrollProgressRef={scrollProgressRef}
          modelRotationY={scrollModelRotationY}
          position={[0, 0, 0]}
          scale={1}
        />
      </group>
    );
  }

  return (
    <CharacterController
      hasWeaponSensor={false}
      capsuleCollisionGroups={sciFiControllerCapsuleCollisionGroups()}
      raycastMembershipGroup={SCIFI_CHARACTER_CONTROLLER_GROUP}
      raycastFilterGroups={SCIFI_CONTROLLER_COLLIDES_WITH}
      renderCharacter={({ modelRef, controllerState }) => (
        <group ref={modelRef} position={[0, -1.2, 0]} scale={1}>
          <SciFiCharacter
            driver="controller"
            modelRotationY={controllerModelRotationY}
            animationType={animationType}
            isMoving={controllerState.isMoving}
            isSprinting={controllerState.isSprinting}
            isGrounded={controllerState.isGrounded}
          />
        </group>
      )}
    />
  );
}
