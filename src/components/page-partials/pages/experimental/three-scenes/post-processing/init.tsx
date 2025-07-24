import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { ThemePalette } from "@/config/theme-colors.config";
import { useThemeStore } from "@/storage/themeStore";
import { Canvas } from "@react-three/fiber";
import Experience from "./experience";
import { Suspense } from "react";
import ThreeLoader from "../common/three-loader";
import Effects from "./effects";

const Init = () => {
  const theme = useThemeStore((s) => s.selectedTheme);
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <Canvas camera={{ position: [-1, 0.225, 5.91], fov: 42 }}>
        <color attach="background" args={[ThemePalette[theme].muted]} />
        <Suspense fallback={null}>
          <Experience />
          <Effects />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;
