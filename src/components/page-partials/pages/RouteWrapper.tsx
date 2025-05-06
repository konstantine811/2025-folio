import { riserSound } from "@config/sounds";
import { useTransitionStore } from "@storage/transitionRoutePath";
import { useEffect } from "react";
import { useLocation } from "react-router";

const RouteWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const onTransition = useTransitionStore((state) => state.onIsTransition);
  useEffect(() => {
    riserSound.play("second");
    onTransition(false);
    // тут твій хук або виклик функції
  }, [location.pathname, onTransition]);

  return <>{children}</>;
};

export default RouteWrapper;
