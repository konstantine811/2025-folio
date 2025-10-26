import { CameraControls, Environment } from "@react-three/drei";
import { SceneObjects } from "./ai-scene-objects/ai-scene-objects";

const Experience = () => {
  return (
    <>
      <SceneObjects />
      <mesh
        castShadow
        receiveShadow
        position-y={-0.5}
        rotation-x={-Math.PI / 2}
      >
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <color attach="background" args={["#131017"]} />
      <ambientLight intensity={0.1} />
      <directionalLight castShadow position={[1, 3, 1]} intensity={3} />
      <Environment preset="night" />
      <CameraControls />
    </>
  );
};

export default Experience;
