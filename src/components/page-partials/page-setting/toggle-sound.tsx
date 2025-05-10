import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react"; // Або будь-які SVG/іконки
import { MOTION_FRAME_TRANSITION } from "@/config/animations";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { SoundTypeElement } from "@/types/sound";
import { useHoverStore } from "@/storage/hoverStore";
import { LocalStorageKey } from "@/config/local-storage.config";

const ToggleSound = () => {
  const [enabled, setEnabled] = useState(false);
  const setSoundEnabled = useHoverStore((state) => state.setSoundEnabled);
  const toggle = () => {
    localStorage.setItem(LocalStorageKey.sound, JSON.stringify(!enabled));
    setEnabled(!enabled);
  };

  useEffect(() => {
    const storedValue = localStorage.getItem(LocalStorageKey.sound);
    console.log("storedValue", storedValue);
    if (storedValue) {
      setEnabled(JSON.parse(storedValue));
    }
  }, []);

  useEffect(() => {
    setSoundEnabled(enabled);
  }, [enabled, setSoundEnabled]);

  return (
    <SoundHoverElement
      as="button"
      hoverTypeElement={SoundTypeElement.LINK}
      onClick={toggle}
      className="w-12 h-12 flex items-center justify-center relative overflow-hidden"
    >
      <AnimatePresence>
        {enabled ? (
          <motion.span
            key="sun"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={MOTION_FRAME_TRANSITION.spring}
            className="absolute"
          >
            <Volume2 className="w-6 h-6 text-accent" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={MOTION_FRAME_TRANSITION.spring}
            className="absolute"
          >
            <VolumeX className="w-6 h-6 text-fg" />
          </motion.span>
        )}
      </AnimatePresence>
    </SoundHoverElement>
  );
};

export default ToggleSound;
