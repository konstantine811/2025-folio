import { useEffect, useState } from "react";
import JoystickController from "./joystick-controller";
import KeyboardController from "./keyboard-controller";
import { usePauseStore } from "./store/usePauseMode";

const InitKeyboardController = ({
  isIgnorePause = false,
}: {
  isIgnorePause?: boolean;
}) => {
  const [isTouch, setIsTouch] = useState(false);
  const isPaused = usePauseStore((s) => s.isPaused);
  const isGameStarted = usePauseStore((s) => s.isGameStarted);
  const setIsTouchG = usePauseStore((s) => s.setIsTouch);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    setIsTouchG(isTouch);
  }, [isTouch, setIsTouchG]);
  return (
    <>
      {isIgnorePause || (!isPaused && isGameStarted) ? (
        isTouch ? (
          <JoystickController />
        ) : (
          <KeyboardController />
        )
      ) : null}
    </>
  );
};

export default InitKeyboardController;
