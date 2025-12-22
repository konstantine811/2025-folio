import { CameraControls, Environment } from "@react-three/drei";

const Experience = () => {
  return (
    <>
      <CameraControls />
      <Environment preset="sunset" />
      <directionalLight position={[1, 1, 1]} intensity={1} />
      <group>
        <mesh>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color="white" />
        </mesh>
        <mesh>
          <boxGeometry args={[10, 10, 10]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </group>
    </>
  );
};

export default Experience;
