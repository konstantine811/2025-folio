import { useAnimations, useGLTF } from "@react-three/drei";
import { RefObject, useEffect, useRef } from "react";
import { Group, Mesh } from "three";

import { CharacterAnimations } from "../models/character-controller.model";
import { useControlStore } from "@/components/common/game-controller/store/control-game-store";
import { useCombatStatusStore } from "../store/combat-status-store";
import { useLocomotionAnimationDriver } from "../character-animation/useLocomotionAnimationDriver";
import { useCombatAnimationDriver } from "../character-animation/useCombatAnimationDriver";
import { WeaponAttachment } from "../character-attachment/weapon-attachment";
import { WeaponAttachmentConfig } from "../models/weapon-attachment.model";

type CharacterModelBaseProps = {
  modelPath: string;
  animationType: CharacterAnimations;
  isMoving?: boolean;
  isSprinting?: boolean;
  isGrounded?: boolean;
  hasCombat?: boolean;
};

type CharacterModelWithoutWeapon = CharacterModelBaseProps & {
  hasWeapon?: false;
  weaponAttachmentRef?: never;
  weaponConfig?: never;
};

type CharacterModelWithWeapon = CharacterModelBaseProps & {
  hasWeapon: true;
  weaponAttachmentRef?: RefObject<Group | null>;
  weaponConfig: WeaponAttachmentConfig;
};

type CharacterModelProps =
  | CharacterModelWithoutWeapon
  | CharacterModelWithWeapon;

const CharacterModel = (props: CharacterModelProps) => {
  const {
    modelPath,
    animationType,
    isMoving,
    isSprinting,
    isGrounded,
    hasCombat = false,
  } = props;

  const groupRef = useRef<Group>(null);

  const currentActionRef = useRef<string | null>(null);
  const isAttackingRef = useRef(false);

  const { scene, animations } = useGLTF(modelPath, true);
  const { actions } = useAnimations(animations, groupRef);

  const isPrimaryClick = useControlStore((s) => s.primaryClick);
  const setPlayerAttacking = useCombatStatusStore((s) => s.setPlayerAttacking);

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];

        materials.forEach((mat) => {
          if (mat) {
            mat.depthWrite = true;
          }
        });
      }
    });
  }, [scene]);

  useLocomotionAnimationDriver({
    enabled: true,
    actions,
    currentActionRef,
    animationType,
    isMoving,
    isSprinting,
    isGrounded,
  });

  useCombatAnimationDriver({
    enabled: hasCombat,
    actions,
    currentActionRef,
    isAttackingRef,
    animationType,
    isPrimaryClick,
    isMoving,
    isSprinting,
    isGrounded,
    setPlayerAttacking,
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} />

      {props.hasWeapon && (
        <WeaponAttachment
          parentScene={scene as Group}
          weaponAttachmentRef={props.weaponAttachmentRef}
          modelPath={props.weaponConfig.modelPath}
          position={props.weaponConfig.position}
          rotation={props.weaponConfig.rotation}
          scale={props.weaponConfig.scale}
        />
      )}
    </group>
  );
};

export default CharacterModel;
