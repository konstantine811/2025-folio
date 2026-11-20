import { normalizeRange } from "@/utils/math/normalize";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { SciFiShipSpace } from "../sci-fi-ship-space";
import { JSX, RefObject, useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { createPortal, useGraph, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import { Group, Object3D, SkinnedMesh } from "three";
import { sciFiCharacterConfig, SciFiCharacterAnimations } from "./sci-fi.config";
import { useLocomotionAnimationDriver } from "../../../character-controller/character-animation/useLocomotionAnimationDriver";
import { useStableWalkAnimations } from "./useStableWalkAnimations";
import { SciFiHelmetAttachments } from "./sci-fi-helmet-attachments";
import { SciFiCharacterModelView } from "./sci-fi-model-view";
import { SciFiCharacterCableProxies } from "./sci-fi-character-cable-proxies";
import { useScrollAnimationDriver } from "../../../character-controller/character-animation/useScrollAnimationDriver";
import { CharacterAnimations } from "../../../character-controller/models/character-controller.model";

type SciFiCharacterBaseProps = JSX.IntrinsicElements["group"];

type SciFiCharacterSharedProps = {
  /** Visual Y rotation in radians; does not affect scroll walk offset. */
  modelRotationY?: number;
};

type SciFiCharacterScrollProps = SciFiCharacterBaseProps &
  SciFiCharacterSharedProps & {
    driver: "scroll";
    scrollProgressRef: RefObject<number>;
  };

type SciFiCharacterControllerProps = SciFiCharacterBaseProps &
  SciFiCharacterSharedProps & {
    driver: "controller";
    initialScrollProgress?: number;

    animationType: CharacterAnimations;

    isMoving?: boolean;
    isSprinting?: boolean;
    isGrounded?: boolean;
  };

type SciFiCharacterProps =
  | SciFiCharacterScrollProps
  | SciFiCharacterControllerProps;

const STABLE_HEAD_CLIP_NAMES = [
  sciFiCharacterConfig.animations.walk,
  SciFiCharacterAnimations.walk,
  SciFiCharacterAnimations.idle,
  SciFiCharacterAnimations.run,
];

function resolveHeadBone(nodes: Record<string, Object3D>) {
  const human = nodes.human as SkinnedMesh | undefined;
  const fromSkeleton = human?.skeleton?.bones.find(
    (bone) => bone.name === "mixamorigHead",
  );
  return (fromSkeleton ?? nodes.mixamorigHead) as Object3D | undefined;
}

export function SciFiCharacter(props: SciFiCharacterProps) {
  const { driver, modelRotationY = 0, ...groupProps } = props;
  const { scene } = useThree();
  const shipSpace = useContext(SciFiShipSpace);
  const fallbackScrollProgressRef = useRef(0);
  const group = useRef<Group>(null);
  const modelRoot = useRef<Group>(null);

  const currentActionRef = useRef<string | null>(null);

  const { scene: sourceScene, materials, animations } = useGLTF(
    sciFiCharacterConfig.modelPath,
  );

  // A mixer must own its bones, including during scroll/controller handoff.
  const characterScene = useMemo(() => clone(sourceScene), [sourceScene]);
  const { nodes } = useGraph(characterScene);

  const characterAnimations = useStableWalkAnimations({
    animations,
    walkAnimationNames: STABLE_HEAD_CLIP_NAMES,
    stableBoneTracks: sciFiCharacterConfig.stableWalkBoneTracks,
  });

  const { actions, mixer } = useAnimations(characterAnimations, group);

  const initialIdleAnimation = driver === "controller" ? props.animationType.idle : null;
  // Capture once: later controller renders must not restart the handoff.
  const initialScrollProgress = useRef(driver === "controller" ? props.initialScrollProgress : undefined);
  useLayoutEffect(() => {
    if (!initialIdleAnimation) return;
    const idle = actions[initialIdleAnimation];
    if (!idle) return;
    const progress = initialScrollProgress.current;
    const outgoing = [];
    if (progress !== undefined) {
      const config = sciFiCharacterConfig.scroll;
      const stand = actions[sciFiCharacterConfig.animations.sitToStand];
      const walk = actions[sciFiCharacterConfig.animations.walk];
      const blend = normalizeRange(progress, config.walkScrollStart, config.standScrollEnd);
      if (stand && walk) {
        stand.reset().play();
        stand.time = stand.getClip().duration * normalizeRange(progress, 0, config.standScrollEnd);
        stand.paused = true;
        stand.setEffectiveWeight(1 - blend);
        walk.reset().play();
        walk.time = (walk.getClip().duration * normalizeRange(progress, config.walkScrollStart, config.walkScrollEnd) * config.walkCycles) % walk.getClip().duration;
        walk.paused = true;
        walk.setEffectiveWeight(blend);
        outgoing.push(stand, walk);
      }
    }
    idle.reset().play();
    if (outgoing.length) {
      outgoing.forEach(action => action.fadeOut(0.4));
      idle.fadeIn(0.4);
    }
    currentActionRef.current = initialIdleAnimation;
    mixer.update(0);
    return () => {
      idle.stop();
      outgoing.forEach(action => action.stop());
    };
  }, [initialIdleAnimation, actions, mixer]);

  const head = useMemo(() => resolveHeadBone(nodes), [nodes]);
  const skeletonRoot = nodes.mixamorigHips as Object3D | undefined;

  const isScrollDriver = driver === "scroll";
  const isControllerDriver = driver === "controller";

  const { debugCableProxies } = useControls("Sci-fi debug", {
    debugCableProxies: {
      value: false,
      label: "Cable proxy wireframes",
    },
  });

  useEffect(() => {
    if (!isControllerDriver || !modelRoot.current) return;
    modelRoot.current.position.z = 0;
  }, [isControllerDriver]);


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

  const cableProxies = (
    <SciFiCharacterCableProxies
      skeletonRoot={skeletonRoot}
      debugVisual={debugCableProxies}
    />
  );

  return (
    <group ref={group} {...groupProps} dispose={null}>
      <SciFiHelmetAttachments
        head={head}
        skeletonRoot={skeletonRoot}
        bodyProxyCollisionsEnabled
        helmetPosition={sciFiCharacterConfig.helmet.position}
        helmetRotation={sciFiCharacterConfig.helmet.rotation}
        helmetScale={sciFiCharacterConfig.helmet.scale}
      />

      <SciFiCharacterModelView
        modelRootRef={modelRoot}
        nodes={nodes}
        materials={materials}
        modelRotationY={modelRotationY}
      />

      {createPortal(cableProxies, shipSpace ?? scene)}
    </group>
  );
}

useGLTF.preload(sciFiCharacterConfig.modelPath);
