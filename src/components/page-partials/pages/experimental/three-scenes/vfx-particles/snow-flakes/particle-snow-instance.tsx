import { Instance, PositionMesh } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Color } from "three";
import { lerp } from "three/src/math/MathUtils.js";

const colorStart = new Color("skyblue").multiplyScalar(30);
const colorEnd = new Color("white").multiplyScalar(30);

const ParticleSnowInstance = ({
  position,
  size = 0.01, // default size if not provided
  lifetime = 10,
  speed = 1, // default speed if not provided
}: {
  position: [number, number, number];
  size: number;
  lifetime?: number;
  speed?: number;
}) => {
  const ref = useRef<PositionMesh>(null);
  const age = useRef(0);

  useFrame(({ camera }, delta) => {
    age.current += delta;
    if (!ref.current) {
      return;
    }
    ref.current.position.y -= speed * delta;
    ref.current.position.x += Math.sin(age.current * speed) * delta;
    ref.current.position.z += Math.cos(age.current * speed) * delta;
    if (age.current > lifetime) {
      age.current = 0;
      ref.current.position.set(position[0], position[1], position[2]);
    }
    const lifeTimeProgression = age.current / lifetime;
    ref.current.scale.x =
      ref.current.scale.y =
      ref.current.scale.z =
        lifeTimeProgression < 0.5
          ? lerp(0, size, lifeTimeProgression)
          : lerp(size, 0, lifeTimeProgression);

    ref.current.color.r = lerp(colorStart.r, colorEnd.r, lifeTimeProgression);
    ref.current.color.g = lerp(colorStart.g, colorEnd.g, lifeTimeProgression);
    ref.current.color.b = lerp(colorStart.b, colorEnd.b, lifeTimeProgression);
    ref.current.lookAt(camera.position);
  });
  return <Instance position={position} ref={ref} scale={size} />;
};

export default ParticleSnowInstance;
