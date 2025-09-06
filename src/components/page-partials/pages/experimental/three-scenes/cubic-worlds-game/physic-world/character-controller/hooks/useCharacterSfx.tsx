import { useEffect, useRef } from "react";
import { useGameStore } from "../stores/game-store";
import { animationSet } from "../config/character.config";
import {
  atmospericSoundFirst,
  jumpLandSound,
  jumpSound,
  walkSound,
} from "@/config/sounds";

const useCharacterSfx = () => {
  const curAnimation = useGameStore((state) => state.curAnimation);
  const onGround = useGameStore((s) => s.onGround);
  const wasPlayingRef = useRef<number>(null!);
  useEffect(() => {
    // стартуємо атмосферу при монті (як у тебе)
    if (!wasPlayingRef.current) {
      wasPlayingRef.current = atmospericSoundFirst.play();
    }

    const handleVisibility = () => {
      const hidden =
        document.hidden ||
        document.visibilityState !== "visible" ||
        !document.hasFocus();
      if (hidden) {
        // запам'ятати, чи гралося, і поставити на паузу
        atmospericSoundFirst.fade(
          atmospericSoundFirst.volume(),
          0,
          1000,
          wasPlayingRef.current
        );
      } else {
        // відновлюємо тільки якщо гралося до паузи
        atmospericSoundFirst.fade(
          atmospericSoundFirst.volume(),
          1,
          1000,
          wasPlayingRef.current
        );
      }
    };

    // одразу синхронізуємо стан
    handleVisibility();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    // iOS/Safari краще реагують на ці події при згортанні/поверненні
    window.addEventListener("pagehide", handleVisibility);
    window.addEventListener("pageshow", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
      window.removeEventListener("pagehide", handleVisibility);
      window.removeEventListener("pageshow", handleVisibility);
    };
  }, []);

  useEffect(() => {
    walkSound.stop();
    switch (curAnimation) {
      case animationSet.walk:
        walkSound.rate(0.83);
        walkSound.volume(0.3);
        walkSound.play();
        break;
      case animationSet.run:
        walkSound.rate(1.2);
        walkSound.volume(0.45);
        walkSound.play();
        break;

      default:
        walkSound.stop();
    }
  }, [curAnimation]);

  useEffect(() => {
    if (onGround) {
      jumpLandSound.play("first");
    }
  }, [onGround]);

  useEffect(() => {
    if (!onGround && curAnimation === animationSet.jump) {
      jumpSound.play("first");
    }
  }, [onGround, curAnimation]);

  return null;
};

export default useCharacterSfx;
