import { transitionSound } from "@/config/sounds";
import { useSoundEnabledStore } from "@/storage/soundEnabled";
import { useTransitionStore } from "@/storage/transitionRoutePath";
import { useLocation, useNavigate } from "react-router";

const TRANSITION_DELAY = 700;

const useTransitionRouteTo = () => {
  const location = useLocation();
  const onTransition = useTransitionStore((state) => state.onIsTransition);
  const navigate = useNavigate();
  const isSoundEnabled = useSoundEnabledStore((state) => state.isSoundEnabled);
  
  return (routePath: string) => {
    // Перевіряємо, чи вже на цій сторінці
    if (location.pathname === routePath) {
      return;
    }

    // Встановлюємо transition в true для показу анімації
    onTransition(true);
    
    if (isSoundEnabled) {
      transitionSound.play();
    }
    
    // Викликаємо navigate після затримки, щоб анімація встигла показатись
    setTimeout(() => {
      navigate(routePath);
    }, TRANSITION_DELAY);
  };
};

export default useTransitionRouteTo;
