import { PerspectiveCamera } from "@theatre/r3f";

const Camera = () => {
  return (
    <>
      <PerspectiveCamera
        position={[5, 5, 10]}
        fov={30}
        near={1}
        makeDefault
        theatreKey="Camera"
      />
    </>
  );
};

export default Camera;
