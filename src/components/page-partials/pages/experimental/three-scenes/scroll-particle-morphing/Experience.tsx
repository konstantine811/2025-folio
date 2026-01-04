import ParticleMorphing from "./particle-morphing";
import ParticleMorphingSphere from "./particle-morphing-sphere";
import { RefObject, Suspense, useState, useEffect } from "react";
import { PlaneGeometry } from "three";
import RaycastGeometry from "@/components/common/three/raycast-geometry/raycast-geometry";
import { useThemeStore } from "@/storage/themeStore";
import { ThemePalette } from "@/config/theme-colors.config";
import { animate, useMotionValue } from "framer-motion";

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
        duration: 0.5,
        ease: "easeOut",
        onComplete: () => {
          setTimeout(() => {
            setShowSphere(false);
          }, 3000);
        },
      });
    }
  }, [isModelLoaded, showSphere, opacityMV]);

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
      {/* Сфера рендериться одразу, поза Suspense, з анімованим зникненням коли модель завантажиться */}
      {showSphere && <ParticleMorphingSphere opacityMV={opacityMV} />}

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
