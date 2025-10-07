// R3F Земля з орбітою 3D-літер, скрол-ефектами (framer-motion useScroll),
// тінню перед Землею та Сонцем, що виглядає з-за планети.
// --------------------------------------------------------------
// Пакети:
// npm i three @react-three/fiber @react-three/drei @react-three/postprocessing framer-motion
// (опційно) якщо Next.js: компонент має бути "use client".

import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useScroll, useMotionValueEvent } from "framer-motion";

// === Налаштування ===
// ВСТАВ свій ч/б текстурний файл для Землі (jpg/png) у earthTextureUrl
const earthTextureUrl = "images/textures/earth/earthlights1k.jpg"; // ← заміни на свій шлях
const USER_NAME = "IVAN DEVELOPER"; // ← заміни на свої літери (можна UA)

// Допоміжна функція для лінійної інтерполяції
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function Earth({
  scrollProgressRef,
}: {
  scrollProgressRef: React.MutableRefObject<number>;
}) {
  // Текстура Землі (ч/б). Якщо немає — матеріал просто сірий
  const texture = useTexture(earthTextureUrl);
  const meshRef = useRef<THREE.Mesh>(null!);

  // Початковий "плавний" вхід обертання
  const timeRef = useRef(0);
  useFrame((_, dt) => {
    timeRef.current += dt;
    const p = scrollProgressRef.current; // 0..1 (framer-motion)
    // Базове авто-обертання + невеличке прискорення від скролу
    const base = 0.002; // швидкість (рад/сек)
    const add = p * 0.006;
    if (meshRef.current) meshRef.current.rotation.y += (base + add) * dt;
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </group>
  );
}

function LettersOrbit({
  scrollProgressRef,
}: {
  scrollProgressRef: React.MutableRefObject<number>;
}) {
  // Розкладаємо символи по колу навколо Землі
  const chars = useMemo(() => USER_NAME.split(""), []);
  const groupRef = useRef<THREE.Group>(null!);
  const tRef = useRef(0);

  // Параметри орбіти
  const baseRadius = 2.4;
  const introDuration = 2.0; // секунд — "виїзд" літер до орбіти

  useFrame((_, dt) => {
    tRef.current += dt;
    const introT = clamp01(tRef.current / introDuration);
    const p = scrollProgressRef.current; // 0..1

    // Радіус зростає на старті (ефект виїзду)
    const r = lerp(0.4, baseRadius, introT);

    // Плавне затухання літер і масштаб від скролу
    const fade = 1 - clamp01(p * 1.2);
    const scale = Math.max(0.001, fade);

    if (groupRef.current) {
      // Повільний оберт групи навколо Землі, плюс дрібні відхилення
      groupRef.current.rotation.y += 0.3 * dt;
      groupRef.current.children.forEach((child, i) => {
        const angle =
          (i / Math.max(1, chars.length)) * Math.PI * 2 + tRef.current * 0.4;
        const y = Math.sin(angle * 0.7) * 0.25; // трохи хвилі по висоті
        child.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
        child.lookAt(0, 0, 0);
        child.scale.setScalar(scale);
        // if (child.material) child.material.opacity = fade;
      });
    }
  });

  // Шрифт: drei/Text (troika) не потребує окремого json-шрифту
  return (
    <group ref={groupRef}>
      {chars.map((ch, i) => (
        <Text
          key={i}
          fontSize={0.28}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          renderOrder={2}
          // Прозорість для fade (через material props)
          fillOpacity={1}
          outlineWidth={0.008}
          outlineColor="#000"
          outlineOpacity={0.75}
        >
          {ch}
        </Text>
      ))}
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

// function SunBehind() {
//   // Сонце "ззаду" планети + Bloom для сяйва
//   return (
//     <group position={[2.2, 0.6, -2.6]}>
//       <mesh>
//         <sphereGeometry args={[1.4, 32, 32]} />
//         <meshStandardMaterial
//           emissive="#ffbb55"
//           emissiveIntensity={2.2}
//           color="#ffd27a"
//         />
//       </mesh>
//     </group>
//   );
// }

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
      <directionalLight position={[-1.5, 0.8, 2.0]} intensity={0.7} />
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
      {/* <SunBehind /> */}

      {/* Земля (ч/б текстура) */}
      <Earth scrollProgressRef={scrollProgressRef} />

      {/* Тінь (віньєтка) перед Землею */}
      {/* <FrontShadowVignette /> */}

      {/* Орбіта 3D-літер */}
      <LettersOrbit scrollProgressRef={scrollProgressRef} />

      {/* Bloom для Сонця */}
      {/* <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.5}
          intensity={1.2}
        />
      </EffectComposer> */}
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
