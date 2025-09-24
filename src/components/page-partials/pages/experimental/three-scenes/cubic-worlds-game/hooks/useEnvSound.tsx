import { useCallback, useEffect, useRef, useState } from "react";
import { Howl, Howler } from "howler";
import { usePauseStore } from "../store/usePauseMode";

const getTrackPath = (name: string) => `/sound/game-sfx/music/${name}.mp3`;

const tracks = [
  { src: [getTrackPath("snowlight")], title: "Track 2" },
  { src: [getTrackPath("breathing_woods")], title: "Track 3" },
  // { src: [getTrackPath("mean_streats_phoenix_tail")], title: "Track 1" },
  { src: [getTrackPath("listen_forest")], title: "Track 4" },
];

type Props = {
  loop?: boolean;
  shuffle?: boolean;
  crossfadeMs?: number;
  volume?: number;
};

export default function useEnvSound({
  loop = true,
  shuffle = false,
  crossfadeMs = 1000,
  volume = 0.5,
}: Props) {
  const [unlocked, setUnlocked] = useState(false); // стартуємо після жесту
  const [index, setIndex] = useState(Math.floor(Math.random() * tracks.length));
  const howlRef = useRef<Howl | null>(null);
  const playingIdRef = useRef<number | null>(null);

  const isPaused = usePauseStore((s) => s.isPaused);

  // ---- unlock on first user gesture
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
    if (isPaused) {
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
  }, [unlocked, index, createHowl, crossfadeMs, volume, isPaused]);

  // Реакція на зміну isPaused: fade до 0 + pause(), або play() + fade до volume
  useEffect(() => {
    if (!unlocked) return;
    const h = howlRef.current;
    if (!h) return;

    const id = playingIdRef.current ?? undefined;
    if (!id) return;
    if (isPaused) {
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
  }, [isPaused, unlocked, volume]);

  // Опціонально управління назовні
  const next = useCallback(() => setIndex((i) => (i + 1) % tracks.length), []);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + tracks.length) % tracks.length),
    []
  );
  const stop = useCallback(() => {
    howlRef.current?.stop();
  }, []);

  return { unlocked, index, next, prev, stop };
}
