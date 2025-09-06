import { useCallback, useEffect, useRef, useState } from "react";

const getTrackPath = (name: string) => {
  return `/sound/game-sfx/music/${name}.mp3`;
};

const tracks = [
  {
    src: [getTrackPath("mean_streats_phoenix_tail")],
    title: "Track 1",
  },
  { src: [getTrackPath("snowlight")], title: "Track 2" },
  { src: [getTrackPath("breathing_woods")], title: "Track 3" },
  { src: [getTrackPath("listen_forest")], title: "Track 4" },
];

interface Props {
  loop?: boolean;
  shuffle?: boolean;
  crossfadeMs?: number;
}
const useEnvSound = ({
  loop = true,
  shuffle = false,
  crossfadeMs = 1000,
}: Props) => {
  const wasPlayingRef = useRef<number>(null!);
  const [index, setIndex] = useState(0);
  const howlRef = useRef<Howl | null>(null);

  const createHowl = useCallback(
    (i: number, vol = 1) => {
      return new Howl({
        src: tracks[i].src,
        preload: true,
        html5: true,
        volume: vol,
        onend: () => {
          const next = shuffle
            ? Math.floor(Math.random() * tracks.length)
            : index + 1 < tracks.length
            ? index + 1
            : loop
            ? 0
            : -1;
          if (next === -1) {
            return;
          }
          setIndex(next);
        },
      });
    },
    [shuffle, loop, index]
  );

  // Створюємо/перезапускаємо поточний трек
  useEffect(() => {
    const old = howlRef.current;
    if (crossfadeMs > 0 && old) {
      const next = createHowl(index, 0);
      howlRef.current = next;
      wasPlayingRef.current = next.play();
      next.fade(0, 1, crossfadeMs);
      old.fade(old.volume(), 0, crossfadeMs);
      setTimeout(() => old.unload(), crossfadeMs + 50);
      return;
    }

    old?.unload();
    const h = createHowl(index);
    howlRef.current = h;
    wasPlayingRef.current = h.play();

    return () => {
      h.unload();
    };
  }, [index, createHowl, crossfadeMs]);

  useEffect(() => {
    // стартуємо атмосферу при монті (як у тебе)

    const handleVisibility = () => {
      const hidden =
        document.hidden ||
        document.visibilityState !== "visible" ||
        !document.hasFocus();
      if (howlRef.current) {
        if (hidden) {
          // запам'ятати, чи гралося, і поставити на паузу
          howlRef.current.fade(
            howlRef.current.volume(),
            0,
            1000,
            wasPlayingRef.current
          );
        } else {
          // відновлюємо тільки якщо гралося до паузи
          howlRef.current.fade(
            howlRef.current.volume(),
            1,
            1000,
            wasPlayingRef.current
          );
        }
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

  return null;
};

export default useEnvSound;
