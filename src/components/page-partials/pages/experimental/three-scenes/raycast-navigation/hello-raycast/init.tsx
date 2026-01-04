import { CameraControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import NavMeshDemo from "./navmesh/navmesh-demo";
import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import ThreeLoader from "../../common/three-loader";

const Init = () => {
  return (
    <MainWrapperOffset>
      <ThreeLoader />
      <Canvas camera={{ position: [8, 18, 8], fov: 60 }}>
        <color attach="background" args={["#151515"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        <NavMeshDemo />

        <CameraControls makeDefault />
      </Canvas>
    </MainWrapperOffset>
  );
};

export default Init;
