import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { CameraControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

const CanvasWrap = ({ children }: { children: React.ReactNode }) => {
  return (
    <MainWrapperOffset>
      <Canvas
        camera={{ position: [70, 10, 80], fov: 45, near: 0.1, far: 1000 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[1, 1, 1]} intensity={1} castShadow />
        <CameraControls />
        {children}
      </Canvas>
    </MainWrapperOffset>
  );
};

export default CanvasWrap;
