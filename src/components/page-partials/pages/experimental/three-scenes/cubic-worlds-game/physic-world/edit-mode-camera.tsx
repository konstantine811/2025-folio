import FlyCameraControl from "../cameraControls/fly-camera-control";
import CompolexController from "./character-controller/character-controller";
import CharacterControllerAnimation from "./character-controller/character-controller-animation";
import { animationSet } from "./character-controller/config/character.config";
import CharacterControllerModel from "./character-controller/character-controller-model";
import { useEditModeStore } from "../store/useEditModeStore";
import AttachCharacterStaff from "./character/attach-character-staff";
import AttachHandCollider from "./character/attach-hand-collider";
import { Vector3 } from "three";
import { Models } from "../config/3d-model.config";

const EditModeCamera = () => {
  const isEditMode = useEditModeStore((s) => s.isEditMode);

  return (
    <>
      <FlyCameraControl active={isEditMode} />
      <CompolexController
        animated
        capsuleHalfHeight={0.6}
        followLight
        disableControl={isEditMode}
        camMinDis={-0.2}
        camTargetPos={new Vector3(0, 0, 0)}
        camMaxDis={-7}
        maxVelLimit={3}
        sprintMult={3}
      >
        <CharacterControllerAnimation
          characterURL={Models.mainCharacter}
          animationSet={animationSet}
        >
          <CharacterControllerModel
            position={[0, -0.9, 0]}
            path={Models.mainCharacter}
          />
        </CharacterControllerAnimation>
      </CompolexController>
      <AttachCharacterStaff />
      <AttachHandCollider />
    </>
  );
};

export default EditModeCamera;
