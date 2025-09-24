// import GrassWrapper from "../../grass/grass-wrapper";
import useEnvSound from "../../hooks/useEnvSound";
import Scatters from "./scatters";
import "../../shaders/touch-winder-shader";

import { Robot } from "./robot/robot";
import Lights from "./lights/ortho-lights";
import { DuneModel } from "./dune/dune";
import { Campfire } from "./campfire/campfire";
import { Tent } from "./tent/tent";
import { BedRoll } from "./tent/bedroll";
// import GrassWrapper from "../../grass/grass-wrapper";

const Environment = () => {
  useEnvSound({ volume: 0.1 });
  return (
    <>
      {/* <HouseModel position={[-20, 0, 40]} /> */}
      <Lights />
      <Scatters />
      <Tent scale={2} position={[3, -0.1, -7]} />
      <BedRoll
        scale={1.3}
        position={[7, -0.01, -22]}
        rotation={[0, Math.PI, 0]}
      />
      <Robot scale={3} position={[0, -0.2, 0]} />
      <DuneModel scale={3} position={[0, -0.7, 0]} />
      <Campfire position={[0, -0.1, 0]} />
      {/* <GrassWrapper /> */}
      {/* <Boxes count={5000} /> */}
    </>
  );
};

export default Environment;
