import { Instances, useTexture } from "@react-three/drei";
import { useMemo } from "react";
import { randFloat, randFloatSpread } from "three/src/math/MathUtils.js";
import ParticleStarInstance from "./particle-star-instance";
import { AdditiveBlending } from "three";
const StarrySky = ({ nbParticles = 1000 }: { nbParticles?: number }) => {
  const texture = useTexture(
    "/images/textures/kenney_particle-pack/png_transparent/star_06.png"
  );
  const particles = useMemo(() => {
    return Array.from({ length: nbParticles }, () => ({
      position: [randFloat(5, 15), randFloatSpread(20), 0] as [
        number,
        number,
        number
      ],
      rotation: [0, randFloat(0, Math.PI * 2), 0] as [number, number, number],
      size: randFloat(0.01, 0.15),
      lifetime: randFloat(1, 30),
    }));
  }, [nbParticles]);
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
