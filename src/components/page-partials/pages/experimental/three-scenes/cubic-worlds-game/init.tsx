import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
// import ThreeLoader from "../common/three-loader";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "./experience";
import InitKeyboardController from "./physic-world/character-controller/init-keyboard";
import { Stats } from "@react-three/drei";
import { Perf } from "r3f-perf";
import "./shaders/gradient-shader";
import { useEditModeStore } from "./store/useEditModeStore";
import UI from "./ui/ui";
import EditMode from "./physic-world/edit-mode/edit-mode";

const Init = () => {
  const isEditMode = useEditModeStore((s) => s.isEditMode);
  return (
    <MainWrapperOffset>
      <InitKeyboardController />
      <Stats />
      <UI />
      {/* <ThreeLoader /> */}
      <Canvas
        shadows
        camera={{ position: [5, 3, 5], fov: 70 }}
        onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
          if (isEditMode) return;
          const canvas = e.currentTarget as HTMLDivElement;
          const domCanvas = canvas.querySelector(
            "canvas"
          ) as HTMLCanvasElement | null;

          if (domCanvas && "requestPointerLock" in domCanvas) {
            domCanvas.requestPointerLock();
          }
        }}
      >
        <color attach="background" args={["#698FF3"]} />

        {/* <Perf position="bottom-left" /> */}
        <Suspense fallback={null}>
          <Experience />
          {isEditMode && <EditMode />}
          <Perf position="bottom-left" showGraph deepAnalyze antialias />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;
