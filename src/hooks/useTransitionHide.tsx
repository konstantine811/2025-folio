import { riserSound } from "@config/sounds";
import { useTransitionStore } from "@storage/transitionRoutePath";
import { useEffect } from "react";

const useTransitionHide = () => {
  const onTransition = useTransitionStore((state) => state.onIsTransition);
  useEffect(() => {
    riserSound.play("second");
    onTransition(false);
  }, [onTransition]);
  return null;
};

export default useTransitionHide;
