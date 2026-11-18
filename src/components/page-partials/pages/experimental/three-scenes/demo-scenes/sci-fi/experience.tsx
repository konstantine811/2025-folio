import { CameraControls, Stars } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import {
  Bloom,
  EffectComposer,
  Noise,
  ToneMapping,
} from "@react-three/postprocessing";
import { Group } from "three";
import { PortalDeck } from "./portal-deck/portal-deck";
import { SkillHolograms } from "./holograms/skill-holograms";
import { SciFiShipSpace } from "./sci-fi-ship-space";
import { SciFiCinematic } from "./sci-fi-cinematic";
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShipContainer } from "./ship/ship-container";
import Earth from "./ship/earth";
import type { CameraMode } from "./init";
import { SciFiToggleCharacter } from "./character/sci-fi-character-controller";
import { SciFiCameraController } from "./sci-fi-camera-controller";
import { CharacterAnimations } from "../../character-controller/models/character-controller.model";
import { usePauseStore } from "@/components/common/game-controller/store/usePauseMode";
import { SciFiCharacterAnimations } from "./character/sci-fi.config";
import { useControls } from "leva";
import { isMobileDevice } from "@/utils/device-capabilities";

import { BlendFunction, ToneMappingMode } from "postprocessing";
import { SciFiLighting } from "./sci-fi-lighting";

type ExperienceProps = {
  cameraMode: CameraMode;
  scrollProgressRef: RefObject<number>;
  introComplete: boolean;
  introRunning: boolean;
  introTimeRef: RefObject<number>;
  onIntroComplete: () => void;
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

const Experience = ({ cameraMode, scrollProgressRef, introComplete, introRunning, introTimeRef, onIntroComplete }: ExperienceProps) => {
  const room = useMemo(() => new Group(), []);
  const doorOpenRef = useRef(false);
  const cinematic = !introComplete && cameraMode === "Scroll";
  const isPaused = usePauseStore((s) => s.isPaused);
  const [playCameraHandoffDone, setPlayCameraHandoffDone] = useState(false);
  const { isDebugPhysics, filmGrain } = useControls({
    isDebugPhysics: { value: false },
    filmGrain: { value: 1, min: 0, max: 3, step: 0.01, label: "Film grain" },
  });

  useEffect(() => {
    if (isPaused) setPlayCameraHandoffDone(false);
  }, [isPaused]);

  const handleCameraHandoffComplete = useCallback(() => {
    setPlayCameraHandoffDone(true);
  }, []);

  const characterMode = isPaused ? "scroll" : "controller";
  const useSciFiScrollCamera =
    cameraMode === "Scroll" && (isPaused || !playCameraHandoffDone);

  return (
    <>
      {cinematic ? (
        <SciFiCinematic running={introRunning} timeRef={introTimeRef} room={room} doorOpenRef={doorOpenRef} onComplete={onIntroComplete} />
      ) : useSciFiScrollCamera ? (
        <SciFiCameraController
          isPaused={isPaused}
          scrollProgressRef={scrollProgressRef}
          pivotRotationY={Math.PI}
          onHandoffComplete={handleCameraHandoffComplete}
        />
      ) : cameraMode === "CameraControls" ? (
        <InspectCameraControls />
      ) : null}
      <SciFiShipSpace.Provider value={room}>
      <primitive object={room}>
      <SciFiLighting />
      <Physics
        debug={isDebugPhysics}
        gravity={[0, -9.81, 0]}
        interpolate={true}
      >
        <PortalDeck cinematicOpenRef={doorOpenRef} cinematic={cinematic} />
        <ShipContainer hideSceneHtml={cinematic || cameraMode === "CameraControls"} cinematicDoorOpenRef={doorOpenRef} />
        <SciFiToggleCharacter
          mode={characterMode}
          scrollProgressRef={scrollProgressRef}
          manageCamera={!isPaused && playCameraHandoffDone}
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
      <SkillHolograms scrollProgressRef={scrollProgressRef} enabled={!cinematic} />
      </primitive>
      </SciFiShipSpace.Provider>
      <Stars
        radius={1}
        depth={500}
        count={isMobileDevice ? 5000 : 15000}
        factor={20}
        saturation={0}
        speed={1.2}
        fade
      />
      <Earth />
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.55}
          luminanceThreshold={1.1}
          luminanceSmoothing={0.2}
          mipmapBlur
          resolutionScale={0.5}
        />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Noise blendFunction={BlendFunction.SOFT_LIGHT} opacity={filmGrain} />
      </EffectComposer>
    </>
  );
};

export default Experience;
