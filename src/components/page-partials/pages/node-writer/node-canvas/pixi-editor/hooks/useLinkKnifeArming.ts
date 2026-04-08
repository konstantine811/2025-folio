import { useEffect, useRef } from "react";
import {
  isKeyboardTypingTarget,
  isLinkKnifeArmKeyDown,
  isLinkKnifeArmKeyUp,
} from "../../utils/canvas-keyboard";

type Params = {
  readOnly: boolean;
};

export function useLinkKnifeArming({ readOnly }: Params) {
  const linkKnifeArmedRef = useRef(false);

  useEffect(() => {
    const setArmed = (armed: boolean) => {
      linkKnifeArmedRef.current = armed;
      if (typeof document !== "undefined") {
        document.body.style.cursor = armed ? "crosshair" : "";
      }
    };

    if (readOnly) {
      setArmed(false);
      return;
    }

    const allowShortcutTarget = (target: EventTarget | null) =>
      !isKeyboardTypingTarget(target);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!allowShortcutTarget(event.target)) return;
      if (!isLinkKnifeArmKeyDown(event)) return;
      setArmed(true);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (!isLinkKnifeArmKeyUp(event)) return;
      setArmed(false);
    };
    const handleBlur = () => {
      setArmed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
      if (typeof document !== "undefined") {
        document.body.style.cursor = "";
      }
    };
  }, [readOnly]);

  return linkKnifeArmedRef;
}
