import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Scroll, ScrollControls } from "@react-three/drei";
import UI from "./ui";
import Experience from "./experience";
import { Leva } from "leva";

const Init = () => {
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <Leva collapsed />
      <Canvas shadows camera={{ position: [0, 3, 20], fov: 50 }}>
        <color attach="background" args={["#131017"]} />
        <Suspense fallback={null}>
          <ScrollControls pages={4} damping={0.2}>
            <Experience />
            <Scroll html>
              <UI />
            </Scroll>
          </ScrollControls>
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;
