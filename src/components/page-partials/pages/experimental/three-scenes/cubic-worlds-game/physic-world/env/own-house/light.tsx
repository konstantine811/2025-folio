import { JSX, useRef } from "react";
import { PointLight } from "three";

type Props = JSX.IntrinsicElements["group"] & {};

const Light = ({ ...props }: Props) => {
  const pointRef = useRef<PointLight>(null!);
  //   useHelper(pointRef, PointLight, ["red", 0.5]);
  return (
    <group {...props}>
      <directionalLight ref={pointRef} castShadow intensity={0.5} />
      {/* <Helper type={PointLightHelper} args={[1, 0xff0000]} /> */}
    </group>
  );
};

export default Light;
