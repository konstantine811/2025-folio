import { CameraControls, Stars } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { RefObject, useEffect, useRef } from "react";
import { Vector3 } from "three";
import { ShipContainer } from "./ship/ship-container";
import Earth from "./ship/earth";
// import { TableAndComputer } from "./ship/table-and-computer";
import type { CameraMode } from "./init";
import { normalizeRange } from "@/utils/math/normalize";
import { SciFiToggleCharacter } from "./character/sci-fi-character-controller";
import { CharacterAnimations } from "../../character-controller/models/character-controller.model";
import { usePauseStore } from "@/components/common/game-controller/store/usePauseMode";
import {
  SciFiCharacterAnimations,
  sciFiScrollPlacement,
  sciFiCharacterConfig,
} from "./character/sci-fi.config";
import { useControls } from "leva";

type ExperienceProps = {
  cameraMode: CameraMode;
  scrollProgressRef: RefObject<number>;
};

const characterStartZ = sciFiScrollPlacement.startZ;
const walkScrollStart = sciFiCharacterConfig.scroll.walkScrollStart;
const walkScrollEnd = sciFiCharacterConfig.scroll.walkScrollEnd;
const walkDistance = sciFiCharacterConfig.scroll.walkDistance;

type FollowCharacterCameraProps = {
  scrollProgressRef: RefObject<number>;
};

const FollowCharacterCamera = ({
  scrollProgressRef,
}: FollowCharacterCameraProps) => {
  const { camera } = useThree();
  const cameraPosition = useRef(new Vector3());
  const lookAtTarget = useRef(new Vector3());

  useFrame((_, delta) => {
    const walkProgress = normalizeRange(
      scrollProgressRef.current ?? 0,
      walkScrollStart,
      walkScrollEnd,
    );
    const characterZ = characterStartZ - walkDistance * walkProgress;

    cameraPosition.current.set(0, 1.7, characterZ + 10.2);
    lookAtTarget.current.set(0, 1.35, characterZ - 0.8);

    camera.position.lerp(cameraPosition.current, 1 - Math.exp(-delta * 5));
    camera.lookAt(lookAtTarget.current);
  });

  return null;
};

const InspectCameraControls = () => {
  const controls = useRef<CameraControls>(null);

  useEffect(() => {
    controls.current?.setLookAt(0, 2.2, 21.5, 0, 1.55, 13.8, false);
  }, []);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minDistance={1.5}
      maxDistance={18}
      truckSpeed={0.8}
    />
  );
};

const Experience = ({ cameraMode, scrollProgressRef }: ExperienceProps) => {
  const isPaused = usePauseStore((s) => s.isPaused);
  const { isDebugPhysics } = useControls({
    isDebugPhysics: { value: false },
  });

  const characterMode = isPaused ? "scroll" : "controller";
  return (
    <>
      {characterMode === "scroll" && cameraMode === "Scroll" ? (
        <FollowCharacterCamera scrollProgressRef={scrollProgressRef} />
      ) : cameraMode === "CameraControls" ? (
        <InspectCameraControls />
      ) : null}
      <ambientLight intensity={1.7} />
      <directionalLight castShadow position={[1, 3, 1]} intensity={3} />
      {/* <Environment preset="sunset" /> */}
      <Physics
        debug={isDebugPhysics}
        gravity={[0, -9.81, 0]}
        interpolate={false}
      >
        <ShipContainer />
        {/* <TableAndComputer /> */}
        {/* <Character scrollProgress={scrollProgress} /> */}
        <SciFiToggleCharacter
          mode={characterMode}
          scrollProgressRef={scrollProgressRef}
          scrollModelRotationY={Math.PI}
          animationType={
            {
              idle: SciFiCharacterAnimations.idle,
              run: SciFiCharacterAnimations.run,
              walk: SciFiCharacterAnimations.walk,
              jumpFalling: SciFiCharacterAnimations.jumpFalling,
              attack: SciFiCharacterAnimations.attack,
            } satisfies CharacterAnimations
          }
        />
      </Physics>
      <Stars
        radius={1}
        depth={500}
        count={15000}
        factor={20}
        saturation={0}
        speed={1.2}
        fade
      />
      <Earth />
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.9}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.2}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
};

export default Experience;
