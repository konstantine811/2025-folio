// import GrassWrapper from "../../grass/grass-wrapper";
// import useEnvSound from "../../hooks/useEnvSound";
// import Boxes from "./boxes/boxes";

import HouseModel from "./house";
import Scatters from "./scatters";
import "../../shaders/winder-shader";
import { useGameDataStore } from "../character-controller/stores/game-data-store";
import { useGameStore } from "../character-controller/stores/game-store";
import useCharacterCreateTexture from "../character-controller/hooks/useCharacterCreateTexture";
const Environment = () => {
  const characterRigidBody = useGameDataStore(
    (state) => state.characterRigidBody
  );
  const onGround = useGameStore((s) => s.onGround);
  useCharacterCreateTexture({ characterRigidBody, onGround: !!onGround });

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
