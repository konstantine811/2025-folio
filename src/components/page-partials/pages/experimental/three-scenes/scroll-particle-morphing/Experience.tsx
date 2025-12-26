import { Environment } from "@react-three/drei";
import ParticleMorphing from "./particle-morphing";
import { useState, useRef, useEffect } from "react";
import { PlaneGeometry } from "three";
import RaycastGeometry from "@/components/common/three/raycast-geometry/raycast-geometry";
import { useThemeStore } from "@/storage/themeStore";
import { ThemePalette } from "@/config/theme-colors.config";
import { MotionValue } from "framer-motion";

const Experience = ({
  pathModel = "/3d-models/models.glb",
  totalPages = 3,
  scrollYProgress,
}: {
  pathModel?: string;
  totalPages?: number;
  scrollYProgress: MotionValue<number>;
}) => {
  const theme = useThemeStore((state) => state.selectedTheme);
  const pageIndexRef = useRef(0);
  const [showIndexModel, setShowIndexModel] = useState(0);

  // <-- ОЦЕ і є прогрес секції (0..1) без setState
  const sectionProgressRef = useRef(0);

  useEffect(() => {
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

    const pages = Math.max(1, totalPages - 1); // safety
    const unsubscribe = scrollYProgress.on("change", (value) => {
      // 1) інверт 1..0 -> 0..1
      const global = 1 - clamp01(value);

      // 2) активна сторінка
      const raw = global * pages; // 0..pages
      const pageIndex = Math.min(pages - 1, Math.floor(raw));

      // 3) локальний прогрес всередині сторінки (0..1)
      const sectionT = raw - pageIndex;

      // без ререндерів — для шейдера/юніформа
      sectionProgressRef.current = sectionT;

      // setState тільки коли сторінка змінилась
      if (pageIndexRef.current !== pageIndex) {
        pageIndexRef.current = pageIndex;
        setShowIndexModel(pageIndex);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, totalPages]);

  return (
    <>
      <Environment preset="sunset" />
      <color attach="background" args={[ThemePalette[theme].card]} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
      <RaycastGeometry
        raycasterGeometry={new PlaneGeometry(250, 130)}
        isGeometryVisible={false}
        isDebug={false}
        cursorSize={0.06}
      />
      <group>
        <ParticleMorphing
          showIndexModel={showIndexModel}
          pathModel={pathModel}
          // глобальний прогрес (0..1) якщо теж треба

          // локальний прогрес секції (0..1) без ререндерів
          uSectionProgressRef={sectionProgressRef}
        />
      </group>
    </>
  );
};

export default Experience;
