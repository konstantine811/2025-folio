import { useEffect } from "react";
import { usePauseStore } from "../store/usePauseMode";
import { useTranslation } from "react-i18next";
import { Key } from "@/config/key";
import PauseView from "../pause/pause-view";

const Pause = () => {
  const setIsPaused = usePauseStore((s) => s.setIsPaused);
  const isPaused = usePauseStore((s) => s.isPaused);
  const isGameStarted = usePauseStore((s) => s.isGameStarted);
  const [t] = useTranslation();
  useEffect(() => {
    if (!isGameStarted) return;
    const handleVisibility = () => {
      setIsPaused(true);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === Key.ESC) {
        setIsPaused(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    window.addEventListener("pagehide", handleVisibility);
    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
      window.removeEventListener("pagehide", handleVisibility);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [setIsPaused, isGameStarted]);
  return (
    <>
      {isPaused && isGameStarted && (
        <div className="fixed z-10 h-full w-full bg-background/10 backdrop-blur-md text-muted-foreground flex justify-center items-center">
          <div className="bg-background/70 p-1 rounded-lg border-2 border-background inset-ring-2 inset-ring-foreground/10 flex flex-wrap">
            <div className="flex flex-col justify-around items gap-3 p-4">
              <h2 className="uppercase text-center text-3xl font-bold">
                {t("cubic_worlds_game.pause.title")}
              </h2>
              <button
                className="bg-background/90 cursor-pointer hover:bg-background/30 hover:scale-99 transition-all duration-300 text-foreground/80 py-2 px-4 rounded-md font-bold"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused
                  ? t("cubic_worlds_game.pause.resume")
                  : t("cubic_worlds_game.pause.title")}
              </button>
            </div>
            <div className="bg-background/90 rounded-lg p-8">
              <div className="w-72 h-96 bg-foreground/10 rounded-lg">
                <PauseView />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Pause;
