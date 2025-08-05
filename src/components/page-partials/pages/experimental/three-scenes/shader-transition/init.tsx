import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import { Canvas } from "@react-three/fiber";
import { Leva, useControls } from "leva";
import { UI } from "./ui";
import Experience from "./experience";
import { Suspense, useEffect } from "react";
import ScreenTransition from "./screen-transition";
import { transitionAtom } from "./config/ui.config";
import { useAtom } from "jotai";
import { useProgress } from "@react-three/drei";

const Init = () => {
  const { backgroundColor } = useControls({
    backgroundColor: { value: "#241b52" },
  });
  const [transition, setTransition] = useAtom(transitionAtom);
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100) {
      setTransition(false);
    }
  }, [progress, setTransition]);
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <UI />
      <Leva hidden />
      <Canvas camera={{ position: [0, 1.8, 5], fov: 42 }}>
        <color attach="background" args={[backgroundColor]} />
        <fog attach="fog" args={[backgroundColor, 5, 12]} />
        <ScreenTransition color={"#a5b4fc"} transition={transition} />
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;
