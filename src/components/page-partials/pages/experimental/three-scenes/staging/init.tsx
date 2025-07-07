import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { ThemePalette } from "@/config/theme-colors.config";
import { useThemeStore } from "@/storage/themeStore";
import { Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "./Experience";

const Init = () => {
  const theme = useThemeStore((s) => s.selectedTheme);
  return (
    <MainWrapperOffset>
      <Canvas camera={{ position: [-3, 1.5, 12], fov: 30 }}>
        <color attach="background" args={[ThemePalette[theme].muted]} />
        <fog attach="fog" args={[ThemePalette[theme].muted, 20, 30]} />
        <Suspense fallback={<Preload />}>
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;
