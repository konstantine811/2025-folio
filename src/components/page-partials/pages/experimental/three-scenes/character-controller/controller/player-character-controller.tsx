// PlayerCharacterController.tsx

import { interactionGroups } from "@react-three/rapier";
import { CharacterController } from "./character-controller";
import { CharacterAnimations } from "../models/character-controller.model";
import CharacterModel from "./character-model";

type PlayerCharacterControllerProps = {
  modelPath: string;
  animationType: CharacterAnimations;
  modelWeaponPath: string;
};

export function PlayerCharacterController({
  modelPath,
  animationType,
  modelWeaponPath,
}: PlayerCharacterControllerProps) {
  const collidesWith = [0, 1, 2] as const;

  return (
    <CharacterController
      hasWeaponSensor
      capsuleCollisionGroups={interactionGroups(0, [...collidesWith])}
      raycastMembershipGroup={0}
      raycastFilterGroups={collidesWith}
      renderCharacter={({ modelRef, weaponAttachmentRef, controllerState }) => (
        <group ref={modelRef} position={[0, -1.2, 0]} scale={5.5}>
          <CharacterModel
            modelPath={modelPath}
            animationType={animationType}
            isMoving={controllerState.isMoving}
            isSprinting={controllerState.isSprinting}
            isGrounded={controllerState.isGrounded}
            hasCombat
            hasWeapon
            weaponAttachmentRef={weaponAttachmentRef}
            weaponConfig={{
              modelPath: modelWeaponPath,
              position: [0, 0.149, -0.18],
              rotation: [Math.PI / 2, 0, 0],
              scale: [0.15, 0.15, 0.15],
            }}
          />
        </group>
      )}
    />
  );
}
