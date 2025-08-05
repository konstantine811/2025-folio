import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import { Canvas } from "@react-three/fiber";
import { useThemeStore } from "@/storage/themeStore";
import { ThemePalette } from "@/config/theme-colors.config";
import { Environment } from "@react-three/drei";
import { Suspense, useState } from "react";
import Experience from "./experience";
import Effects from "./effects";
import { PerformanceMonitor } from "@react-three/drei";

const Init = () => {
  const [effect, setEffect] = useState(true);
  const theme = useThemeStore((s) => s.selectedTheme);
  const [nBoxes, setNBoxes] = useState(2000);
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <Canvas camera={{ position: [0, 2, 10], fov: 70 }}>
        <PerformanceMonitor
          onChange={(api) => {
            console.log("Perfomance Monitor (FPS)", api.fps);
            console.log("Perfomance Mointor (Factor)", api.factor);
          }}
          onIncline={() => {
            console.log("Performance Monitor (Inclined)");
          }}
          onDecline={() => {
            setNBoxes(nBoxes / 2);
            setEffect(false);
            console.log("Performance Monitor (Declined)");
          }}
        />
        <Suspense fallback={null}>
          <color attach="background" args={[ThemePalette[theme].muted]} />
          <fog attach="fog" args={[ThemePalette[theme].foreground, 10, 50]} />
          <group position-y={-2}>
            <Experience nBoxes={nBoxes} />
          </group>
          <Environment preset="sunset" />
          {effect && <Effects />}
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;
