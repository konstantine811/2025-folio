import { CameraControls, Stars } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { MathUtils, Vector3 } from "three";
import { ShipContainer } from "./ship/ship-container";
import Earth from "./ship/earth";
import { Character } from "./character/character";
import type { CameraMode } from "./init";

type ExperienceProps = {
  cameraMode: CameraMode;
  scrollProgress: number;
};

const characterStartZ = 13.821;
const walkScrollStart = 0.26;
const walkScrollEnd = 1;
const walkDistance = 4.5;

const normalizeRange = (value: number, start: number, end: number) =>
  MathUtils.clamp((value - start) / (end - start), 0, 1);

type FollowCharacterCameraProps = {
  scrollProgress: number;
};

const FollowCharacterCamera = ({ scrollProgress }: FollowCharacterCameraProps) => {
  const { camera } = useThree();
  const cameraPosition = useRef(new Vector3());
  const lookAtTarget = useRef(new Vector3());

  useFrame((_, delta) => {
    const walkProgress = normalizeRange(
      scrollProgress,
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

const Experience = ({ cameraMode, scrollProgress }: ExperienceProps) => {
  return (
    <>
      {cameraMode === "Scroll" ? (
        <FollowCharacterCamera scrollProgress={scrollProgress} />
      ) : (
        <InspectCameraControls />
      )}
      <ambientLight intensity={1.7} />
      <directionalLight castShadow position={[1, 3, 1]} intensity={3} />
      {/* <Environment preset="sunset" /> */}
      <group>
        <ShipContainer />
        <Character scrollProgress={scrollProgress} />
      </group>
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
