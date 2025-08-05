import { Instance, PositionMesh } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Color } from "three";
import { lerp } from "three/src/math/MathUtils.js";

const colorStart = new Color("pink").multiplyScalar(30);
const colorEnd = new Color("white").multiplyScalar(30);

const PaticleInstance = ({
  position,
  size = 0.01, // default size if not provided
  rotation = [0, 0, 0], // default rotation if not provided
  lifetime = 10,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  size: number;
  lifetime?: number;
}) => {
  const ref = useRef<PositionMesh>(null);
  const age = useRef(0);

  useFrame(({ camera }, delta) => {
    age.current += delta;
    if (!ref.current) {
      return;
    }
    if (age.current > lifetime) {
      age.current = 0;
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
  return (
    <group rotation={rotation}>
      <Instance position={position} ref={ref} scale={size} />
    </group>
  );
};

export default PaticleInstance;
