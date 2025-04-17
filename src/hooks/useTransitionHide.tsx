import { useTransitionStore } from "@storage/transitionRoutePath";
import { useEffect } from "react";

const useTransitionHide = () => {
  const onTransition = useTransitionStore((state) => state.onIsTransition);
  useEffect(() => {
    onTransition(false);
  }, [onTransition]);
  return null;
};

export default useTransitionHide;
