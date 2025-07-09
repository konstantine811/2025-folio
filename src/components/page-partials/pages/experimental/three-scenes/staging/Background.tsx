import { useTexture } from "@react-three/drei";
import { BackSide } from "three";

const Background = () => {
  const map = useTexture("/images/hdri/environment-skybox.jpg");
  return (
    <mesh>
      <sphereGeometry args={[5, 64, 64]} />
      <meshBasicMaterial map={map} side={BackSide} toneMapped={false} />
    </mesh>
  );
};

export default Background;
