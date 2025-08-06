import { Instances, useTexture } from "@react-three/drei";
import { useMemo } from "react";
import { randFloat, randFloatSpread } from "three/src/math/MathUtils.js";
import ParticleStarInstance from "./particle-star-instance";
import { AdditiveBlending } from "three";
const StarrySky = ({
  nbParticles = 1000,
  randomPositionXFirst = 5,
  randomPositionXSecond = 15,
  randomPositionY = 20,
}: {
  nbParticles?: number;
  randomPositionXFirst?: number;
  randomPositionXSecond?: number;
  randomPositionY?: number;
}) => {
  const texture = useTexture(
    "/images/textures/kenney_particle-pack/png_transparent/star_02.png"
  );
  const particles = useMemo(() => {
    return Array.from({ length: nbParticles }, () => ({
      position: [
        randFloat(randomPositionXFirst, randomPositionXSecond),
        randFloatSpread(randomPositionY),
        0,
      ] as [number, number, number],
      rotation: [0, randFloat(0, Math.PI * 2), 0] as [number, number, number],
      size: randFloat(0.01, 0.15),
      lifetime: randFloat(1, 30),
    }));
  }, [
    nbParticles,
    randomPositionXFirst,
    randomPositionXSecond,
    randomPositionY,
  ]);
  return (
    <Instances range={nbParticles} limit={nbParticles} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        alphaMap={texture}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
      {particles.map((props, index) => (
        <ParticleStarInstance
          key={index}
          position={props.position}
          size={props.size}
          rotation={props.rotation}
          lifetime={props.lifetime}
        />
      ))}
    </Instances>
  );
};

export default StarrySky;
