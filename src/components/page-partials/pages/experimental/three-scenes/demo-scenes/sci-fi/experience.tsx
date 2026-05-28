import { CameraControls, Stars } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { ShipContainer } from "./ship/ship-container";
import Earth from "./ship/earth";
import { SciFiPlayerTeleportSync } from "./sci-fi-player-teleport-sync";
import { SciFiStylizedWorldZone } from "./sci-fi-stylized-world-zone";
import { useSciFiWorldPhaseStore } from "./sci-fi-world-phase-store";
import type { CameraMode } from "./init";
import { SciFiToggleCharacter } from "./character/sci-fi-character-controller";
import { SciFiCameraController } from "./sci-fi-camera-controller";
import { CharacterAnimations } from "../../character-controller/models/character-controller.model";
import { usePauseStore } from "@/components/common/game-controller/store/usePauseMode";
import { SciFiCharacterAnimations } from "./character/sci-fi.config";
import { useControls } from "leva";

type ExperienceProps = {
  cameraMode: CameraMode;
  scrollProgressRef: RefObject<number>;
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
  const [playCameraHandoffDone, setPlayCameraHandoffDone] = useState(false);
  const { isDebugPhysics } = useControls({
    isDebugPhysics: { value: false },
  });

  useEffect(() => {
    if (isPaused) setPlayCameraHandoffDone(false);
  }, [isPaused]);

  const handleCameraHandoffComplete = useCallback(() => {
    setPlayCameraHandoffDone(true);
  }, []);

  const worldPhase = useSciFiWorldPhaseStore((s) => s.phase);
  const characterMode = isPaused ? "scroll" : "controller";
  const useSciFiScrollCamera =
    cameraMode === "Scroll" && (isPaused || !playCameraHandoffDone);

  return (
    <>
      {useSciFiScrollCamera ? (
        <SciFiCameraController
          isPaused={isPaused}
          scrollProgressRef={scrollProgressRef}
          pivotRotationY={Math.PI}
          onHandoffComplete={handleCameraHandoffComplete}
        />
      ) : cameraMode === "CameraControls" ? (
        <InspectCameraControls />
      ) : null}
      {worldPhase === "stylized" ? (
        <color attach="background" args={["#87c8e8"]} />
      ) : null}
      {worldPhase === "ship" ? (
        <>
          <ambientLight intensity={1.7} />
          <directionalLight castShadow position={[1, 3, 1]} intensity={3} />
        </>
      ) : null}
      <Physics
        debug={isDebugPhysics}
        gravity={[0, -9.81, 0]}
        interpolate={false}
      >
        <SciFiPlayerTeleportSync />
        {worldPhase === "ship" ? <ShipContainer /> : <SciFiStylizedWorldZone />}
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
      {worldPhase === "ship" ? (
        <>
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
        </>
      ) : null}
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
