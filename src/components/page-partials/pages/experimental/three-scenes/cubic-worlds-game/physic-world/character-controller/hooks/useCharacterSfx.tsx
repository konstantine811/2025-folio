import { useEffect, useRef } from "react";
import { useGameStore } from "../stores/game-store";
import { animationSet } from "../config/character.config";
import {
  jumpLandSound,
  jumpSound,
  walkSound,
  whooshHandSound,
} from "@/config/sounds";

const AIR_THRESHOLD_MS = 500; // скільки треба пробути в повітрі
// (можеш прибрати MIN_INTERVAL_MS, якщо не потрібен кулдаун)

const useCharacterSfx = () => {
  const curAnimation = useGameStore((s) => s.curAnimation);
  const onGround = useGameStore((s) => s.onGround);

  const airStartRef = useRef<number | null>(null);

  useEffect(() => {
    walkSound.stop();
    whooshHandSound.stop();
    switch (curAnimation) {
      case animationSet.walk:
        walkSound.rate(0.73);
        walkSound.volume(0.3);
        walkSound.play();
        break;
      case animationSet.run:
        walkSound.rate(1.2);
        walkSound.volume(0.45);
        walkSound.play();
        break;
      case animationSet.action1:
        setTimeout(() => {
          whooshHandSound.play();
        }, 200);
        break;
      default:
        walkSound.stop();
    }
  }, [curAnimation]);

  useEffect(() => {
    // коли НЕ на землі — запам’ятовуємо момент старту польоту (один раз)
    if (!onGround) {
      if (airStartRef.current === null) {
        airStartRef.current = Date.now();
      }
      return;
    }

    // коли на землі й ми ДІЙСНО були у повітрі — рахуємо тривалість
    if (onGround && airStartRef.current !== null) {
      const airTime = Date.now() - airStartRef.current;
      airStartRef.current = null; // скидаємо після приземлення

      if (airTime >= AIR_THRESHOLD_MS) {
        // якщо треба саме djumpLandSound — заміни назву нижче
        jumpLandSound.play("first");
      }
    }
  }, [onGround]);

  useEffect(() => {
    if (onGround && curAnimation === animationSet.jump) {
      jumpSound.play("first");
    }
  }, [onGround, curAnimation]);

  return null;
};

export default useCharacterSfx;
