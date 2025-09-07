import { Instance } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Color, Mesh } from "three";

const Box = ({
  color,
  scale,
  position,
  speed,
}: {
  color: Color;
  scale: number;
  position: [number, number, number];
  speed: number;
}) => {
  const ref = useRef<Mesh>(null!);

  //   useFrame(() => {
  //     ref.current.position.z -= speed;
  //     if (ref.current.position.z < -50) {
  //       ref.current.position.z = 10;
  //     }
  //   });
  return <Instance ref={ref} color={color} scale={scale} position={position} />;
};

export default Box;
