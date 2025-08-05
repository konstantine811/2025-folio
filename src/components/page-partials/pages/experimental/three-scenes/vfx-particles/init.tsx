import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import { Canvas } from "@react-three/fiber";
import { useThemeStore } from "@/storage/themeStore";
import { ThemePalette } from "@/config/theme-colors.config";
import { Suspense } from "react";
import Experience from "./experience";

const Init = () => {
  const theme = useThemeStore((state) => state.selectedTheme);
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <Canvas shadows camera={{ position: [5, 3, 5], fov: 50 }}>
        <color attach="background" args={[ThemePalette[theme].background]} />
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;
