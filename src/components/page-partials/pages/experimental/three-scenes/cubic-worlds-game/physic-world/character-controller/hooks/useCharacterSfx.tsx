import { useEffect } from "react";
import { useGameStore } from "../stores/game-store";
import { animationSet } from "../config/character.config";
import { jumpLandSound, jumpSound, walkSound } from "@/config/sounds";

const useCharacterSfx = () => {
  const curAnimation = useGameStore((state) => state.curAnimation);
  const onGround = useGameStore((s) => s.onGround);
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
