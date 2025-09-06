import { useEffect, useState } from "react";
import JoystickController from "./joystick-controller";
import KeyboardController from "./keyboard-controller";

const InitKeyboardController = () => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);
  return <>{isTouch ? <JoystickController /> : <KeyboardController />}</>;
};

export default InitKeyboardController;
