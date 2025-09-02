import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../common/three-loader";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { UI } from "./ui";
import Experience from "./experience";
import Preloader from "./preoloader";

const Init = () => {
  return (
    <MainWrapperOffset>
      <Leva collapsed />
      <UI />
      <ThreeLoader />
      <Canvas shadows camera={{ position: [12, 8, 26], fov: 30 }}>
        <color attach="background" args={["#110511"]} />
        <Suspense fallback={null}>
          <Preloader />
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;
