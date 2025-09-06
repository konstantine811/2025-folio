import useEnvSound from "../../hooks/useEnvSound";
import HouseModel from "./house";

const Environment = () => {
  useEnvSound({ shuffle: true });
  return (
    <>
      <HouseModel position={[-20, 0, 40]} />
    </>
  );
};

export default Environment;
