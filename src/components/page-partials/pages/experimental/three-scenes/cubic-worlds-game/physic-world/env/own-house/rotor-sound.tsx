import { useEffect, useRef } from "react";
import { PositionalAudio } from "@react-three/drei";
import * as THREE from "three";
import { sfxs } from "../../../config/audio.config";
import { usePauseStore } from "../../../store/usePauseMode";

function RotorSound() {
  const audioRef = useRef<THREE.PositionalAudio>(null);
  const isPaused = usePauseStore((s) => s.isPaused);

  useEffect(() => {
    const a = audioRef.current;
    if (a) {
      if (isPaused) {
        if (a.isPlaying) a.pause();
      } else {
        // Резюмимо контекст і явно запускаємо
        a?.context?.resume?.();
        if (!a.isPlaying) a.play();
      }
    }
  }, [isPaused]);

  useEffect(() => {
    const enable = () => {
      const a = audioRef.current;
      // Резюмимо контекст і явно запускаємо
      a?.context?.resume?.();
      if (a && !a.isPlaying) a.play();
    };
    // перший дотик/клік по канвасу
    window.addEventListener("pointerdown", enable, { once: true });
    window.addEventListener("touchstart", enable, { once: true });
    return () => {
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("touchstart", enable);
    };
  }, []);

  return (
    <PositionalAudio
      ref={audioRef}
      url={sfxs.ventilation} // переконайся, що файл у /public
      loop
      distance={3}
    />
  );
}

export default RotorSound;
