import { Environment } from "@react-three/drei";
import ParticleMorphing from "./particle-morphing";
import { useFrame } from "@react-three/fiber";
import { useState, useRef, useEffect } from "react";
import { MathUtils, PlaneGeometry } from "three";
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

  const [showIndexModel, setShowIndexModel] = useState(0);

  // <-- ОЦЕ і є прогрес секції (0..1) без setState
  const sectionProgressRef = useRef(0);

  useEffect(() => {
    scrollYProgress.on("change", (value) => {
      console.log("scrollYProgress", value);
    });
  }, [scrollYProgress]);

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
