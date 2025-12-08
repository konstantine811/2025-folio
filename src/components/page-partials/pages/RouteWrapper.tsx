import { useHoverStore } from "@/storage/hoverStore";
import { useSoundEnabledStore } from "@/storage/soundEnabled";
import { HoverStyleElement } from "@/types/sound";
import { riserSound } from "@config/sounds";
import { useTransitionStore } from "@storage/transitionRoutePath";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

const RouteWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const onTransition = useTransitionStore((state) => state.onIsTransition);
  const isSoundEnabled = useSoundEnabledStore((state) => state.isSoundEnabled);
  const setHover = useHoverStore((s) => s.setHover);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHover(false, null, HoverStyleElement.circle);
  }, [location.pathname, setHover]);

  useEffect(() => {
    // Очищаємо попередній таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Затримка перед вимкненням transition, щоб анімація встигла завершитись
    // duration (300ms) + delayPerPixel (0.9) * maxDistance (~500-600ms) = ~800-900ms
    timeoutRef.current = setTimeout(() => {
      if (isSoundEnabled) {
        riserSound.play("first");
      }
      onTransition(false);
    }, 900); // Затримка для завершення анімації CellReveal

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname, onTransition, isSoundEnabled]);

  return <>{children}</>;
};

export default RouteWrapper;
