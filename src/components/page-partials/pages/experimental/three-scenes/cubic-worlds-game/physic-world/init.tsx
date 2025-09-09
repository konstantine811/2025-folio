import { Physics } from "@react-three/rapier";
import Ground from "./ground";
import CompolexController from "./character-controller/character-controller";
import CharacterControllerAnimation from "./character-controller/character-controller-animation";
import { animationSet } from "./character-controller/config/character.config";
import CharacterControllerModel from "./character-controller/character-controller-model";
import AttachCharacterStaff from "./character/attach-character-staff";
import Environment from "./env/env";
import { useControls } from "leva";
import DrawMesh from "./draw-mesh/draw-mesh";
import PlanePainter from "./draw-mesh/plain-painter";
import { useDrawMeshStore } from "../store/useDrawMeshStore";
import FlyCameraControl from "../cameraControls/fly-camera-control";
// import PickUpController from "./controllers/pick-up-controller";

const InitPhysicWorld = () => {
  const { isDebug } = useControls("Physics World", {
    isDebug: true,
  });
  const isEditMode = useDrawMeshStore((s) => s.isEditMode);
  return (
    <>
      {/* <CameraControls makeDefault /> */}
      <Physics timeStep="vary" debug={isDebug}>
        <Environment />
        <Ground />
        <DrawMesh />
        <PlanePainter />
        <FlyCameraControl active={isEditMode} />
        {/* {Array.from({ length: 250 }, (_, i) => {
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
        })} */}
        <CompolexController
          animated
          capsuleHalfHeight={0.6}
          followLight
          disableControl={isEditMode}
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
        <AttachCharacterStaff />
        {/* Контролер пікапу */}
        {/* <PickUpController /> */}
      </Physics>
    </>
  );
};

export default InitPhysicWorld;
