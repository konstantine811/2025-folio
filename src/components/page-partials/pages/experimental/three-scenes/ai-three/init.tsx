import { Canvas } from "@react-three/fiber";
import ThreeLoader from "../common/three-loader";
import { Suspense } from "react";
import Experience from "./3d-experience/experience";
import UI from "./ui/ui";

const Init = () => {
  return (
    <div className="h-screen">
      <ThreeLoader />
      <UI />
      <Canvas
        gl={{ preserveDrawingBuffer: true }}
        camera={{ position: [10, 1, 0], fov: 65, near: 0.1 }}
        shadows={true}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Init;
