import { Physics } from "@react-three/rapier";
import { useRef } from "react";
import { Mesh } from "three";

const Experience = () => {
  const meshRef = useRef<Mesh>(null);
  return (
    <Physics>
      <mesh ref={meshRef}>
        <boxGeometry />
        <meshStandardMaterial color="red" roughness={0} metalness={1} />
      </mesh>
    </Physics>
  );
};

export default Experience;
