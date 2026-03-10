import { useEffect, useState } from "react";
import JoystickController from "./joystick-controller";
import { usePauseStore } from "./store/usePauseMode";
import DesktopInput from "./desktop-input";

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
          <DesktopInput />
        )
      ) : null}
    </>
  );
};

export default InitKeyboardController;
