// components/KeyboardController.tsx
import { useEffect, useRef } from "react";
import { useControlStore } from "./stores/control-game-store";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "run", keys: ["ShiftLeft", "ShiftRight"] },
];

// Мапа дій → виклик відповідного сеттера зі стора
const keyToActionMap: Record<string, (value: boolean) => void> = {
  forward: (v: boolean) => useControlStore.getState().setForward(v),
  backward: (v: boolean) => useControlStore.getState().setBackward(v),
  leftward: (v: boolean) => useControlStore.getState().setLeftward(v),
  rightward: (v: boolean) => useControlStore.getState().setRightward(v),
  jump: (v: boolean) => useControlStore.getState().setJump(v),
  run: (v: boolean) => useControlStore.getState().setRun(v),
};

const KeyboardController = () => {
  // зберігаємо коди натиснутих клавіш
  const pressedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // побудувати keyCode → назва дії
    const keyMap: Record<string, string> = {};
    keyboardMap.forEach(({ name, keys }) => {
      keys.forEach((key) => (keyMap[key] = name));
    });

    const updateActions = () => {
      const activeActions = new Set<string>();
      pressedKeysRef.current.forEach((code) => {
        const actionName = keyMap[code];
        if (actionName) activeActions.add(actionName);
      });

      // Оновити всі дії в сторі
      Object.keys(keyToActionMap).forEach((action) => {
        keyToActionMap[action](activeActions.has(action));
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pressedKeysRef.current.has(e.code)) {
        pressedKeysRef.current.add(e.code);
        updateActions();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (pressedKeysRef.current.has(e.code)) {
        pressedKeysRef.current.delete(e.code);
        updateActions();
      }
    };

    // На втрату фокусу/видимості — скинути всі активні стани
    const resetAll = () => {
      if (pressedKeysRef.current.size) {
        pressedKeysRef.current.clear();
        updateActions();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", resetAll);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) resetAll();
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", resetAll);
      document.removeEventListener("visibilitychange", () => {
        if (document.hidden) resetAll();
      });
    };
  }, []);

  return null;
};

export default KeyboardController;
