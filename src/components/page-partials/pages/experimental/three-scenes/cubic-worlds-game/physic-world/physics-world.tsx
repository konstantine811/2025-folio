import { Physics } from "@react-three/rapier";
import Ground from "./ground";
import CompolexController from "./character-controller/character-controller";
import CharacterControllerAnimation from "./character-controller/character-controller-animation";
import { animationSet } from "./character-controller/config/character.config";
import CharacterControllerModel from "./character-controller/character-controller-model";
import AttachCharacterStaff from "./character/attach-character-staff";
// simple controller
// import CharacterController from "./character-controller/simple-controller/simple-character-controller";
import Environment from "./env/env";
// import DrawMesh from "./draw-mesh/draw-mesh";
import { useEditModeStore } from "../store/useEditModeStore";
import FlyCameraControl from "../cameraControls/fly-camera-control";

// import PickUpController from "./controllers/pick-up-controller";

const InitPhysicWorld = () => {
  const isDebug = useEditModeStore((s) => s.isPhysicsDebug);
  const isEditMode = useEditModeStore((s) => s.isEditMode);

  return (
    <>
      <Physics timeStep="vary" debug={isDebug}>
        <Environment />
        <Ground />

        <FlyCameraControl active={isEditMode} />
        {/* <CharacterController /> */}
        <CompolexController
          animated
          capsuleHalfHeight={0.6}
          followLight
          disableControl={isEditMode}
          maxVelLimit={3}
          sprintMult={3}
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
