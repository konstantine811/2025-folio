import { useEffect } from "react";
import { usePauseStore } from "../store/usePauseMode";
import { Button } from "@/components/ui/button";

const Pause = () => {
  const setIsPaused = usePauseStore((s) => s.setIsPaused);
  const isPaused = usePauseStore((s) => s.isPaused);
  useEffect(() => {
    const handleVisibility = () => {
      setIsPaused(true);
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
  }, [setIsPaused]);
  return (
    <>
      {isPaused && (
        <div className="fixed z-50 h-full w-full bg-background/10 backdrop-blur-md text-white flex justify-center items-center">
          <Button onClick={() => setIsPaused(!isPaused)}>
            {isPaused ? "Resume" : "Pause"}
          </Button>
        </div>
      )}
    </>
  );
};

export default Pause;
