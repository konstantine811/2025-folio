// import GrassWrapper from "../../grass/grass-wrapper";
import useEnvSound from "../../hooks/useEnvSound";
// import Boxes from "./boxes/boxes";

// import HouseModel from "./house";
import Scatters from "./scatters";
import "../../shaders/touch-winder-shader";
import { useGameDataStore } from "../character-controller/stores/game-data-store";
import { useGameStore } from "../character-controller/stores/game-store";
import useCharacterCreateTexture from "../character-controller/hooks/useCharacterCreateTexture";

import { Robot } from "./robot/robot";
import Lights from "./lights/ortho-lights";
import { DuneModel } from "./dune/dune";
import { Campfire } from "./campfire/campfire";
import { Tent } from "./tent/tent";
import { BedRoll } from "./tent/bedroll";
// import GrassWrapper from "../../grass/grass-wrapper";

const Environment = () => {
  const characterRigidBody = useGameDataStore(
    (state) => state.characterRigidBody
  );
  useEnvSound({ volume: 0.1 });
  const onGround = useGameStore((s) => s.onGround);
  useCharacterCreateTexture({ characterRigidBody, onGround: !!onGround });

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
