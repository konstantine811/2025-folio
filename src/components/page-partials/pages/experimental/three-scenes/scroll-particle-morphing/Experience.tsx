import { Environment } from "@react-three/drei";
import ParticleMorphing from "./particle-morphing";
import { useRef, useEffect } from "react";
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
  const sectionProgressRef = useRef(0);

  useEffect(() => {
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    const pages = Math.max(1, totalPages - 1);

    const unsubscribe = scrollYProgress.on("change", (value) => {
      const global = 1 - clamp01(value); // 0..1
      const raw = global * pages; // 0..pages

      // маленький epsilon щоб не скакало на границі через float
      const idx = Math.min(pages - 1, Math.floor(raw + 1e-6));
      const t = raw - idx; // 0..1

      pageIndexRef.current = idx;
      sectionProgressRef.current = t;
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
          pathModel={pathModel}
          uSectionProgressRef={sectionProgressRef}
          uPageIndexRef={pageIndexRef}
          // глобальний прогрес (0..1) якщо теж треба

          // локальний прогрес секції (0..1) без ререндерів
        />
      </group>
    </>
  );
};

export default Experience;
