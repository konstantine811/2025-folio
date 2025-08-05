import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Canvas } from "@react-three/fiber";
import ThreeLoader from "../common/three-loader";
import Experience from "./experience";
import { Suspense } from "react";
// import { WaterMaterial } from "./water-2/waterMaterial";

// extend({ WaterMaterial });

const Init = () => {
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <Canvas camera={{ position: [8, 4.5, 24], fov: 60 }}>
        <Suspense fallback={null}>
          <fog attach="fog" args={["#53ac58", 50, 100]} />
          <color attach="background" args={["#53ac58"]} />
          <Experience />
        </Suspense>
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;
