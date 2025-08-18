import { Physics, RigidBody } from "@react-three/rapier";
import Ground from "./ground";
import PrimitiveModel from "../primitive-modle";
import { randFloatSpread } from "three/src/math/MathUtils.js";
import { CameraControls } from "@react-three/drei";
import AiController from "./controllers/controller-ai";

const InitPhysicWorld = () => {
  return (
    <>
      <CameraControls makeDefault />
      <Physics debug>
        <Ground />
        {Array.from({ length: 500 }, (_, i) => {
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
        {Array.from({ length: 500 }, (_, i) => {
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
        <AiController />
      </Physics>
    </>
  );
};

export default InitPhysicWorld;
