// import GrassWrapper from "../../grass/grass-wrapper";
import Scatters from "./scatters";
import "../../shaders/touch-winder-shader";

import { Robot } from "./robot/robot";
import Lights from "./lights/ortho-lights";
import { DuneModel } from "./dune/dune";
import { Campfire } from "./campfire/campfire";
import { Tent } from "./tent/tent";
import { BedRoll } from "./tent/bedroll";
import BreakableCrate from "./box-crash/box-crash";
import OwnHouse from "./own-house/own-house";
// import HighRiseBuild from "./high-rise-build/high-rise-build";
// import GrassWrapper from "../../grass/grass-wrapper";

const Environment = () => {
  return (
    <>
      {/* <HouseModel position={[-20, 0, 40]} /> */}
      <Lights />
      <Scatters />
      <OwnHouse position={[37, 0, 16]} rotation={[0, Math.PI, 0]} />
      {/* <HighRiseBuild position={[60, 25, 10]} rotation={[0, -Math.PI / 2, 0]} /> */}
      <BreakableCrate idBox="box-first" position={[0, 1, 0]} scale={3} />
      <BreakableCrate idBox="box-second" position={[8, 5, 5]} scale={3} />
      <BreakableCrate idBox="box-third" position={[6, 5, -5]} scale={3} />
      <BreakableCrate idBox="box-fourth" position={[4, 5, -5]} scale={3} />
      <BreakableCrate idBox="box-fifth" position={[2, 5, -5]} scale={3} />
      <BreakableCrate idBox="box-sixth" position={[0, 5, -5]} scale={3} />
      <BreakableCrate idBox="box-seventh" position={[-2, 5, 5]} scale={3} />
      <BreakableCrate idBox="box-eighth" position={[-4, 5, 5]} scale={3} />
      <BreakableCrate idBox="box-ninth" position={[-6, 5, 5]} scale={3} />
      <BreakableCrate idBox="box-tenth" position={[-8, 5, 5]} scale={3} />
      <BreakableCrate idBox="box-eleventh" position={[-10, 5, 5]} scale={3} />
      <BreakableCrate idBox="box-twelfth" position={[-12, 5, -5]} scale={3} />
      {/* <HouseModel position={[-20, 0, 40]} /> */}
      {/* <PalmTree scale={2} position={[3, -0.1, -7]} /> */}
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
