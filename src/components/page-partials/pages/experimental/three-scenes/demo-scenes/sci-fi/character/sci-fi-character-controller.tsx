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
};

export function SciFiToggleCharacter({
  mode,
  scrollProgressRef,
  animationType,
}: SciFiToggleCharacterProps) {
  if (mode === "scroll") {
    return (
      <group position={[0, 0, 13.821]} scale={1}>
        <SciFiCharacter
          driver="scroll"
          scrollProgressRef={scrollProgressRef}
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
