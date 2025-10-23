import SineWave from "@/components/graphics/sine-wave";
import { motion } from "framer-motion";

type Props = {
  onClick?: () => void;
  isEnabled: boolean;
};
const SineToggleSound = ({ onClick, isEnabled }: Props) => {
  return (
    <div
      className="cursor-pointer select-none flex items-center justify-center gap-1"
      onClick={() => {
        onClick?.();
      }}
    >
      <motion.h5
        initial={false}
        animate={{ opacity: isEnabled ? 1 : 0.3 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="font-thin text-sm"
      >
        Sound
      </motion.h5>
      <SineWave stopAnimate={!isEnabled} />
    </div>
  );
};

export default SineToggleSound;
