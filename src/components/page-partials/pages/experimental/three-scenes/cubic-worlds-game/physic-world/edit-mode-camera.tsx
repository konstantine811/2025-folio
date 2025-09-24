import FlyCameraControl from "../cameraControls/fly-camera-control";
import CompolexController from "./character-controller/character-controller";
import CharacterControllerAnimation from "./character-controller/character-controller-animation";
import { animationSet } from "./character-controller/config/character.config";
import CharacterControllerModel from "./character-controller/character-controller-model";
import { useEditModeStore } from "../store/useEditModeStore";
import AttachCharacterStaff from "./character/attach-character-staff";

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
    </>
  );
};

export default EditModeCamera;
