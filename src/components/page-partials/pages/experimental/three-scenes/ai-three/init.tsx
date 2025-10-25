import { Canvas } from "@react-three/fiber";
import ThreeLoader from "../common/three-loader";
import { Suspense } from "react";

const Init = () => {
  return (
    <div className="h-screen">
      <ThreeLoader />

      <Canvas
        gl={{ preserveDrawingBuffer: true }}
        camera={{ position: [1, 1, 0], fov: 65, near: 0.001 }}
      >
        <Suspense fallback={null}>
          <mesh>
            <boxGeometry />
            <meshBasicMaterial color="red" />
          </mesh>
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Init;
