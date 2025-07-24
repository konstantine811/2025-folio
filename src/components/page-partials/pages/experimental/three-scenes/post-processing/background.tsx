import { useTexture } from "@react-three/drei";
import { BackSide } from "three";

const Background = () => {
  const map = useTexture(
    "/images/hdri/anime_tavern_with_candle_lights_and_magical_purple.jpg"
  );
  return (
    <mesh>
      <sphereGeometry args={[5, 64, 64]} />
      <meshBasicMaterial map={map} side={BackSide} toneMapped={false} />
    </mesh>
  );
};

export default Background;
