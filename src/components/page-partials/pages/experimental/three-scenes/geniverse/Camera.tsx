import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

const Camera = () => {
  const { camera } = useThree();

  useEffect(() => {
    // Set camera to look at the center of the geometry
    camera.lookAt(0, 1.5, 0);
  }, [camera]);

  return null;
};

export default Camera;
