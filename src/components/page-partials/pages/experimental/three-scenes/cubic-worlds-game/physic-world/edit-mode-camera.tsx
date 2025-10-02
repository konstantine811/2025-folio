import FlyCameraControl from "../cameraControls/fly-camera-control";
import CompolexController from "./character-controller/character-controller";
import CharacterControllerAnimation from "./character-controller/character-controller-animation";
import { animationSet } from "./character-controller/config/character.config";
import CharacterControllerModel from "./character-controller/character-controller-model";
import { useEditModeStore } from "../store/useEditModeStore";
import AttachCharacterStaff from "./character/attach-character-staff";
import AttachHandCollider from "./character/attach-hand-collider";
import { Euler, Vector3 } from "three";
import { Models } from "../config/3d-model.config";
import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "./character-controller/stores/game-store";
import { usePauseStore } from "../store/usePauseMode";

const EditModeCamera = () => {
  const isEditMode = useEditModeStore((s) => s.isEditMode);
  const sleeping = useGameStore((s) => s.sleeping);
  const isDisableTriggerAnim = useGameStore((s) => s.isDisableTriggerAnim);
  const setIsDisableTriggerAnim = useGameStore(
    (s) => s.setIsDisableTriggerAnim
  );
  const isGameStarted = usePauseStore((s) => s.isGameStarted);
  const setIsPaused = usePauseStore((s) => s.setIsPaused);
  const setIsGameStarted = usePauseStore((s) => s.setIsGameStarted);
  const characterPositionVec = useMemo(() => new Vector3(43.5, 0.16, 11), []);
  const characterRotationEuler = useMemo(
    () => new Euler(-0.1, Math.PI, -0.1),
    []
  );
  // Логіка для перемикання між контролерами
  const [scrolledControl, setScrolledControl] = useState(false);
  useEffect(() => {
    if (isGameStarted) {
      setIsDisableTriggerAnim(false);
      setScrolledControl(false);
    } else {
      setIsDisableTriggerAnim(true);
      setScrolledControl(true);
      sleeping();
    }
  }, [
    sleeping,
    setIsDisableTriggerAnim,
    setIsGameStarted,
    setIsPaused,
    isGameStarted,
  ]);
  return (
    <>
      <FlyCameraControl active={isEditMode} scrolledControl={scrolledControl} />
      <CompolexController
        capsuleHalfHeight={0.6}
        followLight
        disableControl={isEditMode || isDisableTriggerAnim}
        camMinDis={-0.2}
        camTargetPos={new Vector3(0, 0, 0)}
        camMaxDis={-7}
        maxVelLimit={3}
        sprintMult={3}
        animated
        characterPosition={characterPositionVec}
        characterRotation={characterRotationEuler}
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
