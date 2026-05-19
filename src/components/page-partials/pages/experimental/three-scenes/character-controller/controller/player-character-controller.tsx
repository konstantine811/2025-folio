// PlayerCharacterController.tsx

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
  return (
    <CharacterController
      hasWeaponSensor
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
