import { useCallback, useEffect, useRef, useState } from "react";
import { Howl, Howler } from "howler";

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
};

export default function useEnvSound({
  loop = true,
  shuffle = false,
  crossfadeMs = 1000,
}: Props) {
  const [unlocked, setUnlocked] = useState(false); // ← стартуємо тільки після жесту
  const [index, setIndex] = useState(Math.floor(Math.random() * tracks.length));
  const howlRef = useRef<Howl | null>(null);
  const playingIdRef = useRef<number | null>(null);

  // ---- unlock on first user gesture
  useEffect(() => {
    const unlock = async () => {
      try {
        // HTML5 Audio: Howler сам робить unlock, але для WebAudio – резюмимо контекст
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

    // Якщо користувач уже взаємодіяв раніше (SPA навігація), контекст може бути running
    if (Howler.ctx?.state === "running") setUnlocked(true);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const createHowl = useCallback(
    (i: number, vol = 1) => {
      const h = new Howl({
        src: tracks[i].src,
        html5: true, // для великих треків ок; WebAudio також працюватиме, коли не html5
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
          // якщо ще раз заблоковано (деякі браузери) — спробувати після unlock
          console.warn("music playerror", err);
          h.once("unlock", () => {
            playingIdRef.current = h.play();
          });
        },
      });
      return h;
    },
    [shuffle, loop]
  );

  // створюємо/міняємо поточний трек (після unlock!)
  useEffect(() => {
    if (!unlocked) return;

    const prev = howlRef.current;

    if (crossfadeMs > 0 && prev) {
      const next = createHowl(index, 0);
      howlRef.current = next;
      // старт наступного з 0 → 1
      playingIdRef.current = next.play();
      next.fade(0, 1, crossfadeMs, playingIdRef.current ?? undefined);
      // затухання старого і розвантаження
      const id = playingIdRef.current ?? undefined;
      prev.fade(prev.volume(), 0, crossfadeMs, id);
      const t = setTimeout(() => prev.unload(), crossfadeMs + 60);
      return () => clearTimeout(t);
    }

    prev?.unload();
    const h = createHowl(index, 1);
    howlRef.current = h;
    playingIdRef.current = h.play();

    return () => {
      h.unload();
    };
  }, [unlocked, index, createHowl, crossfadeMs]);

  // автопауза при втраті фокусу/видимості
  useEffect(() => {
    if (!unlocked) return;

    const handleVisibility = () => {
      const hidden =
        document.hidden ||
        document.visibilityState !== "visible" ||
        !document.hasFocus();
      const h = howlRef.current;
      if (!h) return;
      const id = playingIdRef.current ?? undefined;
      if (hidden) {
        h.fade(h.volume(), 0, 400, id);
      } else {
        // відновити гучність лише якщо вже граємо
        h.fade(h.volume(), 1, 400, id);
      }
    };
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    window.addEventListener("pageshow", handleVisibility);
    window.addEventListener("pagehide", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
      window.removeEventListener("pageshow", handleVisibility);
      window.removeEventListener("pagehide", handleVisibility);
    };
  }, [unlocked]);

  // опціонально віддай керування назовні
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
