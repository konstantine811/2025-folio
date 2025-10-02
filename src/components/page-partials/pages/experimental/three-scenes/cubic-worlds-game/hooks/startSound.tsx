import { useCallback, useEffect, useRef, useState } from "react";
import { usePauseStore } from "../store/usePauseMode";
import { useSoundEnabledStore } from "@/storage/soundEnabled";

const getTrackPath = (name: string) => `/sound/game-sfx/music/${name}.mp3`;

const tracks = [
  {
    src: [getTrackPath("ES_Against the Tide - Daniella Ljungsberg")],
    title: "Track 1",
  },
  {
    src: [getTrackPath("ES_Luminance - Pawan Krishna")],
    title: "Track 2",
  },

  {
    src: [getTrackPath("ES_Perpetuity - Johan Lind")],
    title: "Track 3",
  },
  {
    src: [getTrackPath("ES_Bewitched (Instrumental Version) - Onoe Caponoe")],
    title: "Track 4",
  },
];

type Props = {
  loop?: boolean;
  shuffle?: boolean;
  crossfadeMs?: number;
  volume?: number;
};

const useStartSound = ({
  loop = true,
  shuffle = false,
  crossfadeMs = 1000,
  volume = 0.5,
}: Props) => {
  const [index, setIndex] = useState(
    shuffle ? Math.floor(Math.random() * tracks.length) : 0
  );
  const howlRef = useRef<Howl | null>(null);
  const playingIdRef = useRef<number | null>(null);
  const isSoundEnabled = useSoundEnabledStore((s) => s.isSoundEnabled);

  const isGameStarted = usePauseStore((s) => s.isGameStarted);
  const [unlocked, setUnlocked] = useState(false); // стартуємо після жесту
  useEffect(() => {
    const unlock = async () => {
      try {
        if (Howler.ctx && Howler.ctx.state !== "running") {
          await Howler.ctx.resume();
        }
      } catch {
        console.warn("Audio context resume failed");
      }
      setUnlocked(true);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    if (Howler.ctx?.state === "running") setUnlocked(true);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const createHowl = useCallback(
    (i: number, vol: number) => {
      const h = new Howl({
        src: tracks[i].src,
        html5: true,
        preload: true,
        volume: vol,
        onend: () => {
          const next = shuffle
            ? Math.floor(Math.random() * tracks.length)
            : i + 1 < tracks.length
            ? i + 1
            : loop
            ? 0
            : -1;
          if (next !== -1) setIndex(next);
        },
        onloaderror: (_, err) => console.warn("music loaderror", err),
        onplayerror: (_, err) => {
          console.warn("music playerror", err);
          // слухаємо unlock саме на екземплярі треку
          h.once("unlock", () => {
            playingIdRef.current = h.play();
          });
        },
      });
      return h;
    },
    [shuffle, loop]
  );
  // Створюємо/міняємо поточний трек (після unlock)
  // ПОВНІСТЮ без логіки видимості/фокусу — лише isPaused
  useEffect(() => {
    if (!unlocked) return;

    const prev = howlRef.current;

    // Якщо пауза — готуємо трек «тихо» і не запускаємо його
    if (isGameStarted) {
      prev?.unload();
      const h = createHowl(index, 0);
      howlRef.current = h;
      // НЕ запускаємо h.play() поки на паузі
      return () => h.unload();
    }

    // ---- звичайний сценарій (без паузи) ----
    if (crossfadeMs > 0 && prev) {
      const prevId = playingIdRef.current ?? undefined;

      const next = createHowl(index, 0);
      howlRef.current = next;

      // play нового з 0 → volume
      const nextId = next.play();
      playingIdRef.current = nextId;
      next.fade(0, volume, crossfadeMs, nextId);

      // затухання старого за його prevId і розвантаження
      prev.fade(prev.volume(), 0, crossfadeMs, prevId);
      const t = setTimeout(() => prev.unload(), crossfadeMs + 60);
      return () => clearTimeout(t);
    }

    prev?.unload();
    const h = createHowl(index, volume);
    howlRef.current = h;
    playingIdRef.current = h.play();

    return () => {
      h.unload();
    };
  }, [unlocked, index, createHowl, crossfadeMs, volume, isGameStarted]);

  useEffect(() => {
    if (!isSoundEnabled) {
      howlRef.current?.stop();
    } else {
      howlRef.current?.play();
    }
    return () => {
      howlRef.current?.unload();
    };
  }, [isSoundEnabled]);

  // Реакція на зміну isPaused: fade до 0 + pause(), або play() + fade до volume
  useEffect(() => {
    if (!unlocked) return;
    const h = howlRef.current;
    if (!h) return;

    const id = playingIdRef.current ?? undefined;
    if (!id) return;
    if (isGameStarted) {
      const from = h.volume(id) as number;
      h.fade(from, 0, 300, id);
      const t = setTimeout(() => {
        if (howlRef.current === h) h.pause(id);
      }, 320);
      return () => clearTimeout(t);
    } else {
      // якщо було на паузі — відновлюємо
      if (!h.playing(id)) {
        const newId = h.play(id);
        playingIdRef.current =
          typeof newId === "number" ? newId : playingIdRef.current;
      }
      const from = h.volume(id) as number;
      h.fade(from, volume, 300, id);
    }
  }, [unlocked, volume, isGameStarted]);
};

export default useStartSound;
