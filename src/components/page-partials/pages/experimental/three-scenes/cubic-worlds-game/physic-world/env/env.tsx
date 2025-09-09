// import GrassWrapper from "../../grass/grass-wrapper";
import useEnvSound from "../../hooks/useEnvSound";
// import Boxes from "./boxes/boxes";
import HouseModel from "./house";

const Environment = () => {
  useEnvSound({ shuffle: true });
  return (
    <>
      <HouseModel position={[-20, 0, 40]} />
      {/* <GrassWrapper /> */}
      {/* <Boxes count={5000} /> */}
    </>
  );
};

export default Environment;
