import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

const ThreeLoader = () => {
  const { progress } = useProgress();
  const [fakeProgress, setFakeProgress] = useState(0);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    setFakeProgress(progress);

    if (progress === 100) {
      const timeout = setTimeout(() => {
        setShowLoader(false);
      }, 100); // Показуємо ще 0.5 сек після 100%

      return () => clearTimeout(timeout);
    }
  }, [progress]);

  if (!showLoader) return null;

  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center z-50 bg-background/80 backdrop-blur">
      <div className="w-48 h-1 bg-muted overflow-hidden mb-2 rounded">
        <div
          className="h-full bg-foreground"
          style={{ width: `${fakeProgress}%` }}
        />
      </div>
      <div className="text-foreground text-sm font-medium">
        Loading {Math.floor(fakeProgress)}%
      </div>
    </div>
  );
};

export default ThreeLoader;
