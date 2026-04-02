import CameraLessonSetup1 from "../../character-controller/controller/camera-lesson/camera-lesson-setup-1";

const Experience = () => {
  return (
    <>
      <CameraLessonSetup1 />
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial />
      </mesh>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial />
      </mesh>

      <axesHelper args={[5]} />
      <gridHelper args={[20, 20]} />

      <ambientLight intensity={0.7} />
      <directionalLight castShadow position={[5, 10, 5]} intensity={1} />
    </>
  );
};

export default Experience;
