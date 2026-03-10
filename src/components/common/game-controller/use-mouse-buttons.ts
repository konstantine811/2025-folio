import { useEffect } from "react";
import { useControlStore } from "./store/control-game-store";

export const useMouseButtonsToStore = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    const setPrimary = useControlStore.getState().setPrimaryClick;
    const setSecondary = useControlStore.getState().setSecondaryClick;
    const incAttackTrigger = useControlStore.getState().incAttackTrigger;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        setPrimary(true);
        incAttackTrigger();
      }
      if (e.button === 2) {
        setSecondary(true);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) setPrimary(false);
      if (e.button === 2) setSecondary(false);
    };

    const preventContext = (e: MouseEvent) => e.preventDefault();

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("contextmenu", preventContext);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("contextmenu", preventContext);
      setPrimary(false);
      setSecondary(false);
    };
  }, [enabled]);
};
