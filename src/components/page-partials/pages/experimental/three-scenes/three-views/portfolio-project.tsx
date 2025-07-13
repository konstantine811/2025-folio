import { useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { JSX, useRef, useState } from "react";
import { MathUtils, Mesh } from "three";

interface Props {
  props?: JSX.IntrinsicElements["group"];
  image: string;
}

const PortfolioProject = ({ props, image }: Props) => {
  const map = useTexture(image);
  const imageRef = useRef<Mesh>(null!);
  const [projectHovered, setProjectHovered] = useState(false);
  useCursor(projectHovered);
  useFrame(() => {
    imageRef.current.scale.x = MathUtils.lerp(
      imageRef.current.scale.x,
      projectHovered ? 1.1 : 1,
      0.05
    );
    imageRef.current.scale.y = MathUtils.lerp(
      imageRef.current.scale.y,
      projectHovered ? 0.5625 + 0.1 : 0.5625,
      0.05
    );
  });
  return (
    <group
      {...props}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setProjectHovered(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setProjectHovered(false);
      }}
    >
      <mesh scale-x={1 + 0.2} scale-y={0.5625 + 0.2}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={"black"} />
      </mesh>
      <mesh scale-x={1 + 0.1} scale-y={0.5625 + 0.1} position-z={0.001}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color="white" toneMapped={false} />
      </mesh>
      <mesh scale-y={0.5625} position-z={0.002} scale-x={1} ref={imageRef}>
        <planeGeometry />
        <meshBasicMaterial map={map} toneMapped={false} />
      </mesh>
    </group>
  );
};

export default PortfolioProject;
