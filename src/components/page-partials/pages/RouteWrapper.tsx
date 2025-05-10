import { useHoverStore } from "@/storage/hoverStore";
import { HoverStyleElement } from "@/types/sound";
import { riserSound } from "@config/sounds";
import { useTransitionStore } from "@storage/transitionRoutePath";
import { useEffect } from "react";
import { useLocation } from "react-router";

const RouteWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const onTransition = useTransitionStore((state) => state.onIsTransition);
  const isSoundEnabled = useHoverStore((state) => state.isSoundEnabled);
  const setHover = useHoverStore((s) => s.setHover);
  useEffect(() => {
    setHover(false, null, HoverStyleElement.circle);
  }, [location.pathname, setHover]);
  useEffect(() => {
    if (isSoundEnabled) {
      riserSound.play("second");
    }
    onTransition(false);
    // тут твій хук або виклик функції
  }, [location.pathname, onTransition, isSoundEnabled]);

  return <>{children}</>;
};

export default RouteWrapper;
