import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Experience from "./experience";
import ThreeLoader from "../common/three-loader";
import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import PreloaderAudio from "./preloader-audio";
import UI from "./ui";

const Init = () => {
  return (
    <MainWrapperOffset>
      <Stats />
      <ThreeLoader />
      <UI />
      <Canvas shadows camera={{ position: [1, 6, 12], fov: 50 }}>
        <fog attach="fog" args={["#574f5e", 8, 22]} />
        <color attach="background" args={["#574f5e"]} />
        <Suspense fallback={null}>
          <PreloaderAudio />
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;
