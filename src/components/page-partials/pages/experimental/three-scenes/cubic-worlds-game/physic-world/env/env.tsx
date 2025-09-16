// import GrassWrapper from "../../grass/grass-wrapper";
// import useEnvSound from "../../hooks/useEnvSound";
// import Boxes from "./boxes/boxes";

import HouseModel from "./house";
import Scatters from "./scatters";
import "../../shaders/winder-shader";
import { useGameDataStore } from "../character-controller/stores/game-data-store";
import { useGameStore } from "../character-controller/stores/game-store";
import useCharacterCreateTexture from "../character-controller/hooks/useCharacterCreateTexture";
import { RigidBody } from "@react-three/rapier";
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
      <RigidBody>
        <mesh position={[0, 0.5, 0]} receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <gradientMaterial
            noiseScale={30.0}
            gradientEdges={2}
            edgeWidth={30}
            bottomSoftnes={40}
            bottomHeight={-0.8}
            specularPower={300}
            baseColor={"#FFBF74"}
            colorA={"#FFBF74"}
            colorB={"#FFBF74"}
            randomK={0}
          />
        </mesh>
      </RigidBody>
      {/* <GrassWrapper /> */}
      {/* <Boxes count={5000} /> */}
    </>
  );
};

export default Environment;
