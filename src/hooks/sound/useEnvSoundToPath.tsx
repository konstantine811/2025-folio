import { RoutPath } from "@/config/router-config";
import { envSound } from "@/config/sounds";
import { useSoundEnabledStore } from "@/storage/soundEnabled";
import { useEffect } from "react";

const useEnvSoundToPath = () => {
  const path = location.pathname;
  const isSoundEnabled = useSoundEnabledStore((state) => state.isSoundEnabled);
  useEffect(() => {
    if (!envSound.playing()) {
      envSound.play();
    }
    if (
      path.includes(RoutPath.EXPERIMENTAL_CUBIC_WORLDS_GAME) ||
      !isSoundEnabled
    ) {
      envSound.fade(0.3, 0, 1000);
    } else {
      envSound.fade(0, 0.3, 1000);
    }
  }, [path, isSoundEnabled]);
};

export default useEnvSoundToPath;
