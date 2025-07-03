import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Physics } from "@react-three/rapier";
import { KeyboardControls, Preload } from "@react-three/drei";
import { Controls } from "../config/keyboard-controls";
import { useThemeStore } from "@/storage/themeStore";
import { ThemePalette } from "@/config/theme-colors.config";

const Init = () => {
  const theme = useThemeStore((s) => s.selectedTheme);
  const map = useMemo(
    () => [
      {
        name: Controls.forward,
        keys: ["ArrowUp", "KeyW"],
      },
      {
        name: Controls.backward,
        keys: ["ArrowDown", "KeyS"],
      },
      {
        name: Controls.left,
        keys: ["ArrowLeft", "KeyA"],
      },
      {
        name: Controls.right,
        keys: ["ArrowRight", "KeyD"],
      },
      {
        name: Controls.jump,
        keys: ["Space"],
      },
    ],
    []
  );
  return (
    <MainWrapperOffset>
      <KeyboardControls map={map}>
        <Canvas camera={{ position: [0, 6, 6], fov: 60 }} shadows>
          <color attach="background" args={[ThemePalette[theme].muted]} />
          <Suspense fallback={<Preload />}>
            <Physics debug>
              <Experience />
            </Physics>
          </Suspense>
        </Canvas>
      </KeyboardControls>
    </MainWrapperOffset>
  );
};

export default Init;
