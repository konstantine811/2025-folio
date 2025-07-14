import { CameraControls, Environment, Gltf } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import CameraController from "./camera-controller";

const Experience = () => {
  const controls = useThree((state) => state.controls as CameraControls);

  return (
    <>
      <CameraControls makeDefault />
      {controls && <CameraController />}
      <Gltf
        position={[0, 0, 0]}
        src="/3d-models/apple_iphone_15_pro_max_black.glb"
      />

      <group rotation={Math.PI}>
        <Environment preset="warehouse" blur={1} />
      </group>
    </>
  );
};

export default Experience;
