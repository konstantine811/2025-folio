import { useProgress } from "@react-three/drei";
import { useEffect, useState } from "react";

const ThreeLoader = () => {
  const { progress, active, loaded, total } = useProgress();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
    } else {
      // коли менеджер простоює — ховаємо. Можна додати короткий фейд-аут
      const t = setTimeout(() => setVisible(false), total > 0 ? 400 : 0);
      return () => clearTimeout(t);
    }
  }, [active, total]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-background/80 backdrop-blur">
      <div className="w-56 h-1.5 bg-muted overflow-hidden mb-2 rounded">
        <div
          className="h-full bg-foreground transition-all duration-200"
          style={{ width: `${Math.min(Math.max(progress, 5), 100)}%` }} // маленький мін. “зсув”, щоб бар не стояв на 0%
        />
      </div>
      <div className="text-foreground text-sm font-medium">
        Loading {Math.floor(progress)}% {total ? `• ${loaded}/${total}` : null}
      </div>
      {/* <div className="text-muted-foreground text-xs mt-1 truncate max-w-[80vw]">{item}</div> */}
    </div>
  );
};

export default ThreeLoader;
