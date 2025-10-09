// R3F Земля з орбітою 3D-літер, скрол-ефектами (framer-motion useScroll),
// тінню перед Землею та Сонцем, що виглядає з-за планети.
// --------------------------------------------------------------
// Пакети:
// npm i three @react-three/fiber @react-three/drei @react-three/postprocessing framer-motion
// (опційно) якщо Next.js: компонент має бути "use client".

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useScroll, useMotionValueEvent } from "framer-motion";
import LettersOrbit from "./3d-letter";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
// === Налаштування ===
// ВСТАВ свій ч/б текстурний файл для Землі (jpg/png) у earthTextureUrl
const earthTextureUrl = "images/textures/earth/earthlights1k.jpg"; // ← заміни на свій шлях

function Earth() {
  // Текстура Землі (ч/б). Якщо немає — матеріал просто сірий
  const texture = useTexture(earthTextureUrl);
  const meshRef = useRef<THREE.Mesh>(null!);

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
    <group>
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        rotation={[0, -Math.PI / 1.3, 0]}
      >
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </group>
  );
}

// function FrontShadowVignette() {
//   // Проста напівпрозора "тінь" перед Землею: темний диск-біллборд
//   return (
//     <group position={[0, 0, 0.7]}>
//       <mesh>
//         <circleGeometry args={[2.2, 64]} />
//         <meshBasicMaterial color="#000" transparent opacity={0.25} />
//       </mesh>
//     </group>
//   );
// }

function SunBehind() {
  // Сонце "ззаду" планети + Bloom для сяйва
  return (
    <group>
      <mesh>
        <sphereGeometry args={[1.4, 32, 32]} />
        <meshStandardMaterial
          emissive="#ffbb55"
          emissiveIntensity={20.2}
          color="#ffd27a"
        />
      </mesh>
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      {/* Тепле світло з-за Землі (від Сонця) */}
      <directionalLight
        position={[2.5, 1.0, -2.2]}
        intensity={2.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Заповнююче холодніше */}
      <directionalLight position={[-1.5, 0.8, 2.0]} intensity={2.7} />
    </>
  );
}

export default function EarthIntroScene() {
  // Використовуємо framer-motion useScroll для контролю прогресу сторінки
  const { scrollYProgress } = useScroll();
  const scrollProgressRef = useRef(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    scrollProgressRef.current = latest;
  });

  return (
    <>
      <Lights />

      {/* Сонце позаду планети */}
      <SunBehind />

      {/* Земля (ч/б текстура) */}
      <Earth />

      {/* Тінь (віньєтка) перед Землею */}
      {/* <FrontShadowVignette /> */}

      {/* Орбіта 3D-літер */}
      <LettersOrbit
        text={"ABRAMKIN KONSTANTINE"}
        fontUrl={"fonts/Rubik Mono One_Regular.json"} // твій шрифт
      />

      {/* Bloom для Сонця */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.02}
          luminanceSmoothing={0.05}
          intensity={0.2}
        />
      </EffectComposer>
    </>
  );
}

// === Підказки з адаптації під тебе ===
// 1) Замінити earthTextureUrl на свій ч/б файл. Якщо текстура занадто яскрава — підкоригуй roughness/metalness.
// 2) Замінити USER_NAME на своє імʼя (працює з UA літерами). Можна збільшити fontSize у <Text>.
// 3) Якщо хочеш точніший fade/зникнення — змінюй коефіцієнт у fade = 1 - clamp01(p * 1.2).
// 4) Хочеш, щоб літери не просто зменшувались, а "розсипались"? Додай випадкове віддалення від центру при великому p.
// 5) Сонце майже за планетою. Пограйся з позицією <SunBehind /> і інтенсивністю Bloom.
// 6) Тінь попереду дуже спрощена (віньєтка). Можемо замінити на шейдер з радіальним градієнтом, якщо треба.
// 7) Якщо в тебе Next.js (App Router), додай на початку файлу 'use client'.
