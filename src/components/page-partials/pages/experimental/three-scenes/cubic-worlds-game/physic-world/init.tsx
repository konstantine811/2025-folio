import { Physics, RigidBody } from "@react-three/rapier";
import Ground from "./ground";
import PrimitiveModel from "../primitive-modle";
import { randFloatSpread } from "three/src/math/MathUtils.js";
import CompolexController from "./controllers/complex-controller";
import CharacterControllerAnimation from "./controllers/character-controller-animation";
import { animationSet } from "./controllers/config/character.config";
import CharacterControllerModel from "./controllers/character-controller-model";

const InitPhysicWorld = () => {
  return (
    <>
      {/* <CameraControls makeDefault /> */}
      <Physics debug timeStep="vary">
        <Ground />
        {Array.from({ length: 50 }, (_, i) => {
          return (
            <RigidBody
              key={i}
              type="dynamic"
              position={[randFloatSpread(40) + 10, 5, randFloatSpread(40) + 10]}
              rotation={[Math.PI / 4, 0, 0]}
              userData={{ isGround: true }}
              // linearDamping={1.1}
              mass={10}
              // mass={100}
            >
              <PrimitiveModel modelName="box.glb" />
            </RigidBody>
          );
        })}
        {Array.from({ length: 50 }, (_, i) => {
          return (
            <RigidBody
              key={i}
              type="dynamic"
              position={[randFloatSpread(40) + 10, 5, randFloatSpread(40) + 10]}
              rotation={[Math.PI / 4, 0, 0]}
              userData={{ isGround: true }}
              scale={[2, 2, 2]}
              // linearDamping={1.1}
              mass={10}
              // mass={100}
            >
              <PrimitiveModel modelName="box.glb" />
            </RigidBody>
          );
        })}
        {Array.from({ length: 50 }, (_, i) => {
          return (
            <RigidBody
              key={i}
              type="dynamic"
              position={[randFloatSpread(40) + 10, 5, randFloatSpread(40) + 10]}
              rotation={[Math.PI / 4, 0, 0]}
              userData={{ isGround: true }}
              scale={[4, 4, 4]}
              // linearDamping={1.1}
              mass={10}
              // mass={100}
            >
              <PrimitiveModel modelName="box.glb" />
            </RigidBody>
          );
        })}
        {Array.from({ length: 50 }, (_, i) => {
          return (
            <RigidBody
              key={i}
              type="dynamic"
              position={[randFloatSpread(40) + 30, 5, randFloatSpread(40) + 30]}
              rotation={[Math.PI / 4, 0, 0]}
              userData={{ isGround: true }}
              scale={[10, 10, 10]}
              // linearDamping={1.1}
              mass={100}
              // mass={100}
            >
              <PrimitiveModel modelName="box.glb" />
            </RigidBody>
          );
        })}
        {/* <KeyboardControls map={keyboardMap}>
          <Ecctrl debug animated floatHeight={0} capsuleHalfHeight={0.6}>
            <EcctrlAnimation
              characterURL={characterURL} // Must have property
              animationSet={animationSet} // Must have property
            >
              <CharacterModel
                path="/3d-models/characters/constantine_character.glb"
                position={[0, -0.9, 0]}
              />
            </EcctrlAnimation>
          </Ecctrl>
        </KeyboardControls> */}
        {/* <CharacterController /> */}
        {/* <AiController /> */}
        <CompolexController
          animated
          capsuleHalfHeight={0.6}
          springK={0}
          followLight
        >
          <CharacterControllerAnimation
            characterURL="/3d-models/characters/constantine_character.glb"
            animationSet={animationSet}
          >
            <CharacterControllerModel
              position={[0, -0.9, 0]}
              path="/3d-models/characters/constantine_character.glb"
            />
          </CharacterControllerAnimation>
        </CompolexController>
        d
      </Physics>
    </>
  );
};

export default InitPhysicWorld;
