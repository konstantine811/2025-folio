import { Stars } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils, Vector3 } from "three";
import { ShipContainer } from "./ship/ship-container";
import Earth from "./ship/earth";
import { Character } from "./character/character";

type ExperienceProps = {
  scrollProgress: number;
};

const characterStartZ = 13.821;
const walkScrollStart = 0.26;
const walkScrollEnd = 1;
const walkDistance = 4.5;

const normalizeRange = (value: number, start: number, end: number) =>
  MathUtils.clamp((value - start) / (end - start), 0, 1);

const FollowCharacterCamera = ({ scrollProgress }: ExperienceProps) => {
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

const Experience = ({ scrollProgress }: ExperienceProps) => {
  return (
    <>
      <FollowCharacterCamera scrollProgress={scrollProgress} />
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
