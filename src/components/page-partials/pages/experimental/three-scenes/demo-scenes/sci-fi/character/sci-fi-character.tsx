import { JSX, RefObject, useEffect, useRef } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Group, Object3D } from "three";
import { sciFiCharacterConfig } from "./sci-fi.config";
import { useLocomotionAnimationDriver } from "../../../character-controller/character-animation/useLocomotionAnimationDriver";
import { useStableWalkAnimations } from "./useStableWalkAnimations";
import { SciFiHelmetAttachments } from "./sci-fi-helmet-attachments";
import { SciFiCharacterModelView } from "./sci-fi-model-view";
import { useScrollAnimationDriver } from "../../../character-controller/character-animation/useScrollAnimationDriver";
import { CharacterAnimations } from "../../../character-controller/models/character-controller.model";

type SciFiCharacterBaseProps = JSX.IntrinsicElements["group"];

type SciFiCharacterScrollProps = SciFiCharacterBaseProps & {
  driver: "scroll";
  scrollProgressRef: RefObject<number>;
};

type SciFiCharacterControllerProps = SciFiCharacterBaseProps & {
  driver: "controller";

  animationType: CharacterAnimations;

  isMoving?: boolean;
  isSprinting?: boolean;
  isGrounded?: boolean;
};

type SciFiCharacterProps =
  | SciFiCharacterScrollProps
  | SciFiCharacterControllerProps;

export function SciFiCharacter(props: SciFiCharacterProps) {
  const { driver, ...groupProps } = props;
  const fallbackScrollProgressRef = useRef(0);
  const group = useRef<Group>(null);
  const modelRoot = useRef<Group>(null);

  const currentActionRef = useRef<string | null>(null);

  const { nodes, materials, animations } = useGLTF(
    sciFiCharacterConfig.modelPath,
  );

  const characterAnimations = useStableWalkAnimations({
    animations,
    walkAnimationName: sciFiCharacterConfig.animations.walk,
    stableBoneTracks: sciFiCharacterConfig.stableWalkBoneTracks,
  });

  const { actions, mixer } = useAnimations(characterAnimations, group);

  const head = nodes.mixamorigHead as Object3D | undefined;

  const isScrollDriver = driver === "scroll";
  const isControllerDriver = driver === "controller";

  /**
   * Коли переключаємось з scroll на controller,
   * треба прибрати scroll offset, бо scroll driver рухав modelRoot по Z.
   */
  useEffect(() => {
    if (!isControllerDriver) return;
    if (!modelRoot.current) return;

    modelRoot.current.position.z = 0;
  }, [isControllerDriver]);

  /**
   * Коли міняємо driver, скидаємо currentActionRef,
   * щоб locomotion driver не думав, що стара action ще активна.
   */
  useEffect(() => {
    currentActionRef.current = null;
  }, [driver]);

  /**
   * Scroll animation driver.
   * Працює тільки в режимі driver="scroll".
   */
  useScrollAnimationDriver({
    enabled: isScrollDriver,

    actions,
    mixer,
    modelRootRef: modelRoot,

    scrollProgressRef: isScrollDriver
      ? props.scrollProgressRef
      : fallbackScrollProgressRef,

    sitToStandAnimation: sciFiCharacterConfig.animations.sitToStand,
    walkAnimation: sciFiCharacterConfig.animations.walk,

    standScrollEnd: sciFiCharacterConfig.scroll.standScrollEnd,
    walkScrollStart: sciFiCharacterConfig.scroll.walkScrollStart,
    walkScrollEnd: sciFiCharacterConfig.scroll.walkScrollEnd,

    walkDistance: sciFiCharacterConfig.scroll.walkDistance,
    walkCycles: sciFiCharacterConfig.scroll.walkCycles,
  });

  /**
   * Controller locomotion driver.
   * Працює тільки в режимі driver="controller".
   */
  useLocomotionAnimationDriver({
    enabled: isControllerDriver,

    actions,
    currentActionRef,

    animationType: isControllerDriver
      ? props.animationType
      : (sciFiCharacterConfig.fallbackAnimationType as unknown as CharacterAnimations),

    isMoving: isControllerDriver ? props.isMoving : false,
    isSprinting: isControllerDriver ? props.isSprinting : false,
    isGrounded: isControllerDriver ? props.isGrounded : true,
  });

  return (
    <group ref={group} {...groupProps} dispose={null}>
      <SciFiHelmetAttachments
        head={head}
        helmetPosition={sciFiCharacterConfig.helmet.position}
        helmetRotation={sciFiCharacterConfig.helmet.rotation}
        helmetScale={sciFiCharacterConfig.helmet.scale}
      />

      <SciFiCharacterModelView
        modelRootRef={modelRoot}
        nodes={nodes}
        materials={materials}
      />
    </group>
  );
}

useGLTF.preload(sciFiCharacterConfig.modelPath);
