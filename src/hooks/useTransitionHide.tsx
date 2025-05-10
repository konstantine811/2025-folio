import { useHoverStore } from "@/storage/hoverStore";
import { riserSound } from "@config/sounds";
import { useTransitionStore } from "@storage/transitionRoutePath";
import { useEffect } from "react";

const useTransitionHide = () => {
  const onTransition = useTransitionStore((state) => state.onIsTransition);
  const isSoundEnabled = useHoverStore((state) => state.isSoundEnabled);
  useEffect(() => {
    if (isSoundEnabled) {
      riserSound.play("second");
    }
    onTransition(false);
  }, [onTransition, isSoundEnabled]);
  return null;
};

export default useTransitionHide;
