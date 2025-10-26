// components/SceneObjects.tsx

import { useMemo } from "react";
import { useSceneStore } from "../../store/useSceneStore";
import { SceneObject } from "../../types/object.model";

export function SceneObjects() {
  // забираємо список зі стора
  const objects = useSceneStore((state) => state.objects);

  // R3F: кожен об'єкт → mesh
  // важливо: key={obj.id} щоб не пересоздавало всі меші при додаванні
  return (
    <>
      {objects.map((obj) => (
        <SingleObject key={obj.id} obj={obj} />
      ))}
    </>
  );
}

// окремий компонент для одного обʼєкта
function SingleObject({ obj }: { obj: SceneObject }) {
  const { type, color, radius, size, position } = obj;

  // geometry args мають бути стабільні масиви
  const sphereArgs = useMemo<[number, number, number]>(
    () => [radius ?? 1, 32, 32],
    [radius]
  );

  const boxArgs = useMemo<[number, number, number]>(
    () => [size?.[0] ?? 1, size?.[1] ?? 1, size?.[2] ?? 1],
    [size]
  );

  return (
    <mesh position={position}>
      {type === "sphere" ? (
        <sphereGeometry args={sphereArgs} />
      ) : (
        <boxGeometry args={boxArgs} />
      )}
      <meshStandardMaterial color={color ?? "#ffffff"} />
    </mesh>
  );
}
