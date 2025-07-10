import { useFrame } from "@react-three/fiber";
import { JSX, useRef } from "react";
import { Group, Vector3 } from "three";

interface Props {
  props?: JSX.IntrinsicElements["group"];
  children: JSX.Element;
  growSpeed?: number;
  minSize?: number;
  maxSize?: number;
}

const GrowingFlower = ({
  props,
  children,
  growSpeed = 0.2,
  minSize = 0.3,
  maxSize = 1,
}: Props) => {
  const groupRef = useRef<Group>(null);
  const targetSize = new Vector3(maxSize, maxSize, maxSize);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.scale.lerp(targetSize, delta * growSpeed);
    }
  });
  return (
    <group {...props} ref={groupRef} scale={minSize}>
      {children}
    </group>
  );
};

export default GrowingFlower;
