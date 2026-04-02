import { useAnimations, useGLTF } from "@react-three/drei";
import { RefObject, useEffect, useRef } from "react";
import { Group, Mesh } from "three";
import { CharacterAnimations } from "../models/character-controller.model";
import { useControlStore } from "@/components/common/game-controller/store/control-game-store";
import {
  playAction,
  playAttack,
  resolveLocomotionAnimation,
} from "./play-action";
import { animationConfig } from "../config/character-controller.config";
import { BoneAttachment } from "../character-attachment/bone-attacment";
import { Sword } from "../character-attachment/sword";
import { useCombatStatusStore } from "../store/combat-status-store";

const CharacterModel = ({
  modelPath,
  animationType,
  isMoving,
  isSprinting,
  isGrounded,
  weaponAttachmentRef,
}: {
  modelPath: string;
  isMoving?: boolean;
  isSprinting?: boolean;
  isGrounded?: boolean;
  animationType: CharacterAnimations;
  weaponAttachmentRef?: RefObject<Group | null>;
}) => {
  const groupRef = useRef<Group>(null);
  const { scene, animations } = useGLTF(modelPath, true);
  const { actions } = useAnimations(animations, groupRef);
  const isActionsReady = Object.keys(actions).length > 0;
  // 1) читаємо стан ЛКМ зі стора
  const isPrimaryClick = useControlStore((s) => s.primaryClick);
  // 2) читаємо стан дії
  const currentActionRef = useRef<string | null>(null);
  const isAttackingRef = useRef(false);
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
          if (mat) mat.depthWrite = true;
        });
      }
    });
  }, [scene]);

  useEffect(() => {
    if (!isPrimaryClick) return;
    if (isSprinting || isMoving || !isGrounded) return;
    playAttack(
      animationType,
      actions,
      currentActionRef,
      isAttackingRef,
      isGrounded,
      isMoving ?? false,
      isSprinting ?? false,
      setPlayerAttacking,
    );
  }, [
    isPrimaryClick,
    isSprinting,
    isMoving,
    isGrounded,
    actions,
    animationType,
    currentActionRef,
    isAttackingRef,
    setPlayerAttacking,
  ]);

  useEffect(() => {
    if (!isActionsReady) return;

    const target = resolveLocomotionAnimation({
      isGrounded,
      isMoving,
      isSprinting,
      animationType,
    });

    const targetAction = actions[target];
    if (!targetAction) return;

    if (currentActionRef.current === target && targetAction.isRunning()) return;
    isAttackingRef.current = false;
    playAction(actions, currentActionRef, target, animationConfig.locomotion);
  }, [
    isActionsReady,
    actions,
    isGrounded,
    isMoving,
    isSprinting,
    animationType,
  ]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      <BoneAttachment
        ref={weaponAttachmentRef}
        parentScene={scene}
        boneName="mixamorigRightHand"
        position={[0, 0.149, -0.18]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.15, 0.15, 0.15]}
      >
        <Sword modelPath="/3d-models/ps-game/sword.glb" />
      </BoneAttachment>
    </group>
  );
};

export default CharacterModel;
