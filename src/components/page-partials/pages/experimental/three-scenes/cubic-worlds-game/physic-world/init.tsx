import { Physics, RigidBody } from "@react-three/rapier";
import Ground from "./ground";
import PrimitiveModel from "../primitive-modle";
import { randFloatSpread } from "three/src/math/MathUtils.js";
import CompolexController from "./controllers/character-controller";
import CharacterControllerAnimation from "./controllers/character-controller-animation";
import { animationSet } from "./controllers/config/character.config";
import CharacterControllerModel from "./controllers/character-controller-model";
import PickUpController from "./controllers/pick-up-controller";
import { useEffect, useRef } from "react";
import { Mesh } from "three";
import { useGameDataStore } from "./controllers/stores/game-data-store";

const InitPhysicWorld = () => {
  const setCubeMesh = useGameDataStore((state) => state.setCubeMesh);
  const cubeRef = useRef<Mesh>(null);
  useEffect(() => {
    if (cubeRef.current) {
      setCubeMesh(cubeRef.current);
    }
  }, [cubeRef, setCubeMesh]);
  return (
    <>
      {/* <CameraControls makeDefault /> */}
      <Physics timeStep="vary" debug>
        <Ground />
        {Array.from({ length: 250 }, (_, i) => {
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
        {Array.from({ length: 10 }, (_, i) => {
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
        <CompolexController
          animated
          capsuleHalfHeight={0.6}
          followLight
          maxVelLimit={4}
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

        <mesh ref={cubeRef} position={[0.6, 0.95, 0.2]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color="orange" />
        </mesh>

        {/* Контролер пікапу */}
        <PickUpController />
      </Physics>
    </>
  );
};

export default InitPhysicWorld;
