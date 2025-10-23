import { useEffect, useState } from "react";
import { LocalStorageKey } from "@/config/local-storage.config";
import { useSoundEnabledStore } from "@/storage/soundEnabled";
import SineToggleSound from "./sine-toggle-sound";

const ToggleSound = () => {
  const [enabled, setEnabled] = useState(true);
  const setSoundEnabled = useSoundEnabledStore(
    (state) => state.setSoundEnabled
  );
  const toggle = () => {
    localStorage.setItem(LocalStorageKey.sound, JSON.stringify(!enabled));
    setEnabled(!enabled);
  };

  useEffect(() => {
    const storedValue = localStorage.getItem(LocalStorageKey.sound);
    if (storedValue) {
      setEnabled(JSON.parse(storedValue));
    }
  }, []);

  useEffect(() => {
    setSoundEnabled(enabled);
  }, [enabled, setSoundEnabled]);

  return (
    <>
      <SineToggleSound onClick={toggle} isEnabled={enabled} />
    </>
  );
};

export default ToggleSound;
