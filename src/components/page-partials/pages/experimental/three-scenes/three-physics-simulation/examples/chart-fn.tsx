import Axes3d from "./chart-components/Axes3d";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { CameraControls } from "@react-three/drei";
import Surface from "./chart-components/surface";

const ChartFunction = () => {
  const controls = useThree((state) => state.controls as CameraControls);

  useEffect(() => {
    if (controls) {
      controls.setLookAt(0, 10, 10, 0, 0, 0, true);
    }
  }, [controls]);

  return (
    <>
      <Axes3d size={8} />
      <Surface />
    </>
  );
};

export default ChartFunction;
