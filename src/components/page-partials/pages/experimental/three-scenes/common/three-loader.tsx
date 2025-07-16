import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

const ThreeLoader = () => {
  const { progress, active } = useProgress();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (active) {
      setShowLoader(true);
    } else if (progress === 100) {
      const timeout = setTimeout(() => {
        setShowLoader(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, active]);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center z-50 bg-background/80 backdrop-blur">
      <div className="w-48 h-1 bg-muted overflow-hidden mb-2 rounded">
        <div
          className="h-full bg-foreground transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-foreground text-sm font-medium">
        Loading {Math.floor(progress)}%
      </div>
    </div>
  );
};

export default ThreeLoader;
