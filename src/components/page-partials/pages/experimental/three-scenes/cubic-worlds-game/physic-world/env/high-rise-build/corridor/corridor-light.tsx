import { Helper } from "@react-three/drei";
import { useRef } from "react";
import { PointLight, PointLightHelper } from "three";

const CorridorLight = () => {
  const pointRef = useRef<PointLight>(null!);
  //   useHelper(pointRef, PointLight, ["red", 0.5]);
  return (
    <group position={[9.857, -23, 24.799]}>
      <pointLight ref={pointRef} castShadow intensity={10} />
      <Helper type={PointLightHelper} args={[1, 0xff0000]} />
    </group>
  );
};

export default CorridorLight;
