import { useEffect, useState } from "react";
import JoystickController from "./joystick-controller";
import KeyboardController from "./keyboard-controller";
import { usePauseStore } from "../../store/usePauseMode";

const InitKeyboardController = () => {
  const [isTouch, setIsTouch] = useState(false);
  const isPaused = usePauseStore((s) => s.isPaused);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);
  return (
    <>
      {isPaused ? null : isTouch ? (
        <JoystickController />
      ) : (
        <KeyboardController />
      )}
    </>
  );
};

export default InitKeyboardController;
