import { CameraControls, Stars } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { RefObject, useEffect, useRef } from "react";
import { Vector3 } from "three";
import { ShipContainer } from "./ship/ship-container";
import Earth from "./ship/earth";
import type { CameraMode } from "./init";
import { normalizeRange } from "@/utils/math/normalize";
import { SciFiCharacterAnimations } from "./character/sci-fi.config";
import { SciFiToggleCharacter } from "./character/sci-fi-character-controller";
import { CharacterAnimations } from "../../character-controller/models/character-controller.model";
import { usePauseStore } from "@/components/common/game-controller/store/usePauseMode";

type ExperienceProps = {
  cameraMode: CameraMode;
  scrollProgressRef: RefObject<number>;
};

const characterStartZ = 13.821;
const walkScrollStart = 0.26;
const walkScrollEnd = 1;
const walkDistance = 4.5;

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
  const characterMode = isPaused ? "scroll" : "controller";
  return (
    <>
      {cameraMode === "Scroll" ? (
        <FollowCharacterCamera scrollProgressRef={scrollProgressRef} />
      ) : (
        <InspectCameraControls />
      )}
      <ambientLight intensity={1.7} />
      <directionalLight castShadow position={[1, 3, 1]} intensity={3} />
      {/* <Environment preset="sunset" /> */}
      <Physics debug gravity={[0, -9.81, 0]}>
        <ShipContainer />
        {/* <Character scrollProgress={scrollProgress} /> */}
        <SciFiToggleCharacter
          mode={characterMode}
          scrollProgressRef={scrollProgressRef}
          animationType={
            SciFiCharacterAnimations.idle as unknown as CharacterAnimations
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
    </>
  );
};

export default Experience;
