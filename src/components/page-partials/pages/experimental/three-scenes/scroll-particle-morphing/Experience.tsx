import ParticleMorphing from "./particle-morphing";
import ParticleMorphingSphere from "./particle-morphing-sphere";
import { RefObject, Suspense, useState, useEffect } from "react";
import { PlaneGeometry } from "three";
import RaycastGeometry from "@/components/common/three/raycast-geometry/raycast-geometry";
import { useThemeStore } from "@/storage/themeStore";
import { ThemePalette, ThemeType } from "@/config/theme-colors.config";
import { animate, useMotionValue } from "framer-motion";
import { ModelLoadingContext } from "./model-loading-context";
import DarkSimple from "./dark-simple";

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
  const [showSphere, setShowSphere] = useState(true);
  const opacityMV = useMotionValue(1);

  useEffect(() => {
    if (isModelLoaded && showSphere) {
      // Анімуємо opacity до 0
      animate(opacityMV, 0, {
        duration: 2.5,
        ease: "easeOut",
        onComplete: () => {
          setShowSphere(false);
        },
      });
    }
  }, [isModelLoaded, showSphere, opacityMV]);

  return (
    <ModelLoadingContext.Provider value={{ isModelLoaded, setIsModelLoaded }}>
      <color attach="background" args={[ThemePalette[theme].card]} />
      <directionalLight position={[1, 1, 1]} intensity={1} />
      <RaycastGeometry
        raycasterGeometry={new PlaneGeometry(220, 130)}
        isGeometryVisible={false}
        isDebug={false}
        cursorSize={0.06}
        useScreenPosition={true}
      />
      {/* Сфера рендериться одразу, поза Suspense, з анімованим зникненням коли модель завантажиться */}

      {theme === ThemeType.LIGHT ? (
        <DarkSimple />
      ) : (
        <>
          {showSphere && <ParticleMorphingSphere opacityMV={opacityMV} />}
          <Suspense fallback={null}>
            <ParticleMorphing
              pathModel={pathModel}
              uSectionProgressRef={uSectionProgressRef}
              uPageIndexRef={uPageIndexRef}
              // глобальний прогрес (0..1) якщо теж треба

              // локальний прогрес секції (0..1) без ререндерів
            />
          </Suspense>
        </>
      )}
    </ModelLoadingContext.Provider>
  );
};

export default Experience;
