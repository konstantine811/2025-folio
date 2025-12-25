import { Environment, useScroll } from "@react-three/drei";
import ParticleMorphing from "./particle-morphing";
import { useFrame } from "@react-three/fiber";
import { useState, useRef } from "react";
import { Group, MathUtils } from "three";

const Experience = ({
  pathModel = "/3d-models/models.glb",
}: {
  pathModel?: string;
}) => {
  const data = useScroll();

  const totalPages = 4;

  const [showIndexModel, setShowIndexModel] = useState(0);
  const lastIndexRef = useRef(0);

  const groupRef = useRef<Group>(null);

  // <-- ОЦЕ і є прогрес секції (0..1) без setState
  const [sectionProgress, setSectionProgress] = useState(0);

  useFrame(() => {
    const offset = MathUtils.clamp(data.offset, 0, 1);

    // t: 0..totalPages
    const t = offset * totalPages;

    // index: 0..totalPages-1
    const newIndex = offset >= 1 ? totalPages - 1 : Math.floor(t);

    // progress: 0..1 (всередині секції)
    const localProgress = offset >= 1 ? 1 : t - newIndex;

    setSectionProgress(MathUtils.clamp(localProgress, 0, 1));

    // оновлюємо індекс тільки коли реально змінився
    if (newIndex !== lastIndexRef.current) {
      lastIndexRef.current = newIndex;
      setShowIndexModel(newIndex);
    }

    // Приклад твоєї вертикальної анімації (глобальний прогрес)
    if (groupRef.current) {
      const verticalRange = 10;
      const startY = -verticalRange / 2;
      const endY = verticalRange / 2;
      groupRef.current.position.y = startY + (endY - startY) * offset;
    }
  });

  return (
    <>
      <Environment preset="sunset" />
      <color attach="background" args={["#151515"]} />
      <directionalLight position={[1, 1, 1]} intensity={1} />

      <group ref={groupRef}>
        <ParticleMorphing
          showIndexModel={showIndexModel}
          pathModel={pathModel}
          // глобальний прогрес (0..1) якщо теж треба

          // локальний прогрес секції (0..1) без ререндерів
          uSectionProgressRef={sectionProgress}
        />
      </group>
    </>
  );
};

export default Experience;
