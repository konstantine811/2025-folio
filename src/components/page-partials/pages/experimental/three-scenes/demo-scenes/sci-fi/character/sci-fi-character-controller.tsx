import { SciFiCharacter } from "./sci-fi-character";
import { CharacterAnimations } from "../../../character-controller/models/character-controller.model";
import { CharacterController } from "../../../character-controller/controller/character-controller";
import { RefObject, useMemo } from "react";
import {
  SCIFI_CHARACTER_CONTROLLER_GROUP,
  SCIFI_CONTROLLER_COLLIDES_WITH,
  sciFiControllerCapsuleCollisionGroups,
} from "../sci-fi-collision-groups";
import {
  getSciFiCapsuleFeetToCenterOffset,
  getSciFiControllerSpawnFromScroll,
  sciFiCharacterConfig,
  sciFiScrollPlacement,
} from "./sci-fi.config";

const { halfHeight: sciFiCapsuleHalfHeight, radius: sciFiCapsuleRadius } =
  sciFiCharacterConfig.controllerCapsule;
const sciFiModelOffsetY = -getSciFiCapsuleFeetToCenterOffset();

type SciFiToggleCharacterProps = {
  mode: "scroll" | "controller";

  scrollProgressRef: RefObject<number>;

  animationType: CharacterAnimations;

  /** Visual facing offset for scroll mode (radians). */
  scrollModelRotationY?: number;
  /** Visual facing offset for controller mode (radians). */
  controllerModelRotationY?: number;

  /** Pass false while scroll→play camera handoff runs. */
  manageCamera?: boolean;
};

export function SciFiToggleCharacter({
  mode,
  scrollProgressRef,
  animationType,
  scrollModelRotationY = 0,
  controllerModelRotationY = 0,
  manageCamera = true,
}: SciFiToggleCharacterProps) {
  const controllerStartPosition = useMemo((): [number, number, number] => {
    if (mode !== "controller") {
      return getSciFiControllerSpawnFromScroll(0);
    }

    return getSciFiControllerSpawnFromScroll(scrollProgressRef.current ?? 0);
  }, [mode, scrollProgressRef]);

  if (mode === "scroll") {
    return (
      <group
        position={[0, sciFiScrollPlacement.groupY, sciFiScrollPlacement.startZ]}
        scale={1}
      >
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
      key={controllerStartPosition.join(",")}
      startPosition={controllerStartPosition}
      startModelRotationY={scrollModelRotationY}
      manageCamera={manageCamera}
      capsuleHalfHeight={sciFiCapsuleHalfHeight}
      capsuleRadius={sciFiCapsuleRadius}
      moveSpeed={sciFiCharacterConfig.controllerMovement.moveSpeed}
      jumpForce={sciFiCharacterConfig.controllerMovement.jumpForce}
      gravityScale={sciFiCharacterConfig.controllerMovement.gravityScale}
      hasWeaponSensor={false}
      capsuleCollisionGroups={sciFiControllerCapsuleCollisionGroups()}
      raycastMembershipGroup={SCIFI_CHARACTER_CONTROLLER_GROUP}
      raycastFilterGroups={SCIFI_CONTROLLER_COLLIDES_WITH}
      renderCharacter={({ modelRef, controllerState }) => (
        <group ref={modelRef} position={[0, sciFiModelOffsetY, 0]} scale={1}>
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
