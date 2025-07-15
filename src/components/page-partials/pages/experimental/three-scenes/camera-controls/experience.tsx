import { CameraControls, Environment, Gltf } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import CameraController from "./camera-controller";

const Experience = ({ section }: { section: number }) => {
  const controls = useThree((state) => state.controls as CameraControls);

  return (
    <>
      <CameraControls
        makeDefault
        mouseButtons={{ left: 0, right: 0, middle: 0, wheel: 0 }}
        touches={{ one: 0, two: 0, three: 0 }}
      />
      {controls && <CameraController section={section} />}
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
