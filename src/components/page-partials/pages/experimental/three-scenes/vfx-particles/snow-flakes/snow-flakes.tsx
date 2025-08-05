import { Instances, useTexture } from "@react-three/drei";
import { useMemo } from "react";
import { AdditiveBlending } from "three";
import { randFloat, randFloatSpread } from "three/src/math/MathUtils.js";
import ParticleSnowInstance from "./particle-snow-instance";

const SnowFlakes = ({ nbParticles = 1000 }: { nbParticles?: number }) => {
  const texture = useTexture(
    "/images/textures/kenney_particle-pack/png_transparent/magic_04.png"
  );
  const particles = useMemo(() => {
    return Array.from({ length: nbParticles }, () => ({
      position: [randFloatSpread(5), randFloat(0, 10), randFloatSpread(5)] as [
        number,
        number,
        number
      ],
      size: randFloat(0.01, 0.15),
      lifetime: randFloat(1, 6),
      speed: randFloat(0.1, 1),
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
        <ParticleSnowInstance
          key={index}
          position={props.position}
          size={props.size}
          lifetime={props.lifetime}
          speed={props.speed}
        />
      ))}
    </Instances>
  );
};

useTexture.preload(
  "/images/textures/kenney_particle-pack/png_transparent/magic_04.png"
);
export default SnowFlakes;
