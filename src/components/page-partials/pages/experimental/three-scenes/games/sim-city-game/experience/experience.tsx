import CameraController from "./controllers/camera-controller";

const Experience = () => {
  return (
    <>
      <mesh>
        <boxGeometry />
        <meshBasicMaterial color="red" />
      </mesh>
      <CameraController />
    </>
  );
};

export default Experience;
