// import GrassWrapper from "../../grass/grass-wrapper";
// import useEnvSound from "../../hooks/useEnvSound";
// import Boxes from "./boxes/boxes";

import HouseModel from "./house";
import Scatters from "./scatters";
import "../../shaders/winder-shader";
const Environment = () => {
  return (
    <>
      <HouseModel position={[-20, 0, 40]} />
      <Scatters />

      {/* <GrassWrapper /> */}
      {/* <Boxes count={5000} /> */}
    </>
  );
};

export default Environment;
