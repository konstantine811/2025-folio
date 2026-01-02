import ParticleMorphing from "./particle-morphing";
import ParticleMorphingSphere from "./particle-morphing-sphere";
import { RefObject, Suspense, useState } from "react";
import { PlaneGeometry } from "three";
import RaycastGeometry from "@/components/common/three/raycast-geometry/raycast-geometry";
import { useThemeStore } from "@/storage/themeStore";
import { ThemePalette } from "@/config/theme-colors.config";

const Experience = ({
  pathModel = "/3d-models/models.glb",
  uSectionProgressRef,
  uPageIndexRef,
}: {
  pathModel?: string;
  uSectionProgressRef: RefObject<number>;
  uPageIndexRef: RefObject<number>;
}) => {
  const theme = useThemeStore((state) => state.selectedTheme);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  return (
    <>
      <color attach="background" args={[ThemePalette[theme].card]} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
      <RaycastGeometry
        raycasterGeometry={new PlaneGeometry(220, 130)}
        isGeometryVisible={false}
        isDebug={false}
        cursorSize={0.06}
        useScreenPosition={true}
      />
      {/* Сфера рендериться одразу, поза Suspense, приховується коли модель завантажиться */}
      {!isModelLoaded && <ParticleMorphingSphere />}

      {/* Модель завантажується в Suspense */}
      <Suspense fallback={null}>
        <ParticleMorphing
          pathModel={pathModel}
          uSectionProgressRef={uSectionProgressRef}
          uPageIndexRef={uPageIndexRef}
          onModelLoaded={() => setIsModelLoaded(true)}
          // глобальний прогрес (0..1) якщо теж треба

          // локальний прогрес секції (0..1) без ререндерів
        />
      </Suspense>
    </>
  );
};

export default Experience;
