import { useCallback, useEffect, useRef, useState } from "react";
import { Howl, Howler } from "howler";
import { usePauseStore } from "../store/usePauseMode";

const getTrackPath = (name: string) => `/sound/game-sfx/music/${name}.mp3`;

const tracks = [
  { src: [getTrackPath("snowlight")], title: "Track 2" },
  { src: [getTrackPath("breathing_woods")], title: "Track 3" },
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
  const [unlocked, setUnlocked] = useState(false);
  const [index, setIndex] = useState(
    shuffle ? Math.floor(Math.random() * tracks.length) : 0
  );
  const howlRef = useRef<Howl | null>(null);
  const playingIdRef = useRef<number | null>(null);

  const isPaused = usePauseStore((s) => s.isPaused);
  const isGameStarted = usePauseStore((s) => s.isGameStarted);

  const shouldPlay = unlocked && isGameStarted && !isPaused;

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
        // важливо: не автоплеїмо, ми самі керуємо play/pause
        autoplay: false,
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
          h.once("unlock", () => {
            const id = h.play();
            playingIdRef.current = typeof id === "number" ? id : null;
          });
        },
      });
      return h;
    },
    [shuffle, loop]
  );

  // Створення/заміна Howl при зміні треку (та після unlock)
  // ВАЖЛИВО: тут не вирішуємо play/pause, лише готуємо інстанси і — за потреби — кросфейд між треками
  useEffect(() => {
    if (!unlocked) return;
    if (!isGameStarted) return;
    const prev = howlRef.current;

    if (crossfadeMs > 0 && prev) {
      const prevId = playingIdRef.current ?? undefined;

      const next = createHowl(index, 0);
      howlRef.current = next;

      // Стартуємо новий (безумовно), але якщо shouldPlay=false, просто залишиться на 0 гучності і ми його відпаузаємо нижче
      const nextId = next.play();
      playingIdRef.current = typeof nextId === "number" ? nextId : null;

      // Якщо насправді гра має звучати — піднімаємо до target volume, інакше залишаємо 0
      if (shouldPlay) {
        next.fade(0, volume, crossfadeMs, nextId as number);
      }

      // затухання старого
      if (prev) {
        if (prevId !== undefined) {
          prev.fade(prev.volume(prevId) as number, 0, crossfadeMs, prevId);
        } else {
          // запасний варіант
          prev.fade(prev.volume() as number, 0, crossfadeMs);
        }
        const t = setTimeout(() => prev.unload(), crossfadeMs + 80);
        return () => clearTimeout(t);
      }
      return;
    }

    // Без кросфейду: створюємо новий і одразу play()
    prev?.unload();
    const h = createHowl(index, 0);
    howlRef.current = h;

    const id = h.play();
    playingIdRef.current = typeof id === "number" ? id : null;

    if (shouldPlay) {
      h.fade(0, volume, 250, id as number);
    }

    return () => {
      h.unload();
    };
  }, [
    unlocked,
    index,
    createHowl,
    crossfadeMs,
    volume,
    shouldPlay,
    isGameStarted,
  ]);

  // Реакція на перемикання shouldPlay (isPaused / isGameStarted)
  useEffect(() => {
    if (!unlocked) return;
    const h = howlRef.current;
    if (!h) return;
    if (!isGameStarted) return;

    let id = playingIdRef.current ?? undefined;

    if (shouldPlay) {
      // Якщо ще немає id або sound не грає — запускаємо
      if (!id) {
        const newId = h.play();
        id = typeof newId === "number" ? newId : undefined;
        if (id) playingIdRef.current = id;
      }
      if (id && !h.playing(id)) {
        const newId = h.play(id);
        id = typeof newId === "number" ? newId : id;
        if (id) playingIdRef.current = id;
      }
      if (id) {
        const from = h.volume(id) as number;
        h.fade(from, volume, 300, id);
      }
    } else {
      // Мають бути тиша + пауза
      if (id) {
        const from = h.volume(id) as number;
        h.fade(from, 0, 300, id);
        const t = setTimeout(() => {
          if (howlRef.current === h) {
            h.pause(id as number);
          }
        }, 320);
        return () => clearTimeout(t);
      } else {
        // навіть якщо немає id, гарантуємо тишу інстансу
        h.volume(0);
      }
    }
  }, [shouldPlay, unlocked, volume, isGameStarted]);

  // Коли гру вимкнено — зупиняємо повністю і чистимо стан
  useEffect(() => {
    if (!isGameStarted) {
      const h = howlRef.current;
      if (h) {
        try {
          h.stop();
        } finally {
          playingIdRef.current = null;
          // опційно: повністю вивантажити, якщо не плануємо швидкого повернення
          // h.unload();
        }
      }
    }
  }, [isGameStarted]);

  const next = useCallback(() => setIndex((i) => (i + 1) % tracks.length), []);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + tracks.length) % tracks.length),
    []
  );
  const stop = useCallback(() => {
    const h = howlRef.current;
    if (!h) return;
    try {
      h.stop();
    } finally {
      playingIdRef.current = null;
    }
  }, []);

  return { unlocked, index, next, prev, stop };
}
