import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh } from "three";

const earthTextureUrl = "images/textures/earth/earthlights1k.jpg"; // ← заміни на свій шлях

function Earth() {
  // Текстура Землі (ч/б). Якщо немає — матеріал просто сірий
  const texture = useTexture(earthTextureUrl);
  const meshRef = useRef<Mesh>(null!);

  // Початковий "плавний" вхід обертання
  const timeRef = useRef(0);
  useFrame((_, dt) => {
    timeRef.current += dt;
    // const p = scrollProgressRef.current; // 0..1 (framer-motion)
    // Базове авто-обертання + невеличке прискорення від скролу
    const base = 0.002; // швидкість (рад/сек)
    const add = 0.06;
    if (meshRef.current) meshRef.current.rotation.y += (base + add) * dt;
  });

  return (
    <mesh position={[-60, -70, -200]}>
      <icosahedronGeometry args={[100, 32, 32]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default Earth;
