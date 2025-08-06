import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { DirectionalLight, Mesh } from "three";
import { lerp } from "three/src/math/MathUtils.js";

const Lights = ({ sun }: { sun: Mesh }) => {
  const dirLight = useRef<DirectionalLight>(null);
  const data = useScroll();

  useFrame(() => {
    if (dirLight.current) {
      dirLight.current.position.set(
        lerp(0, 20, data.range(1 / 4, 1 / 4)),
        lerp(5, 20, data.range(0, 1 / 4)),
        lerp(-20, 20, data.range(2 / 4, 1 / 4))
      );
    }
    if (sun) {
      sun.position.set(
        lerp(0, 5, data.range(1 / 4, 1 / 4)),
        lerp(-80, -72, data.range(0, 1 / 4)),
        lerp(-100, -100, data.range(2 / 4, 1 / 4))
      );
    }
  });
  return (
    <>
      <pointLight
        position={[-1, 1, 1]}
        intensity={4}
        color="red"
        distance={10}
      />
      <pointLight
        position={[1, 1, -5]}
        intensity={10}
        distance={12}
        color="blue"
      />
      <directionalLight
        ref={dirLight}
        position={[-20, 20, -20]}
        intensity={4}
        color={"#e4c64e"}
      />
    </>
  );
};

export default Lights;
