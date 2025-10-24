import { transitionSound } from "@/config/sounds";
import { useSoundEnabledStore } from "@/storage/soundEnabled";
import { useTransitionStore } from "@/storage/transitionRoutePath";
import { useNavigate } from "react-router";

const TRANSITION_DELAY = 700;

const useTransitionRouteTo = () => {
  const onTransition = useTransitionStore((state) => state.onIsTransition);
  const navigate = useNavigate();
  const isSoundEnabled = useSoundEnabledStore((state) => state.isSoundEnabled);
  return (routePath: string) => {
    if (location.pathname === routePath) return; // ❌ вже на цій сторінці

    onTransition(true);
    if (isSoundEnabled) {
      transitionSound.play();
    }
    setTimeout(() => {
      navigate(routePath);
    }, TRANSITION_DELAY);
  };
};

export default useTransitionRouteTo;
