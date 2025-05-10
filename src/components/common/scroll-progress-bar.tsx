import { motion, useSpring, useScroll } from "motion/react";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { MOTION_FRAME_TRANSITION } from "@/config/animations";

const ScrollProgressBar = ({
  target,
}: {
  target: React.RefObject<HTMLDivElement>;
}) => {
  const hSize = useHeaderSizeStore((state) => state.size);
  const { scrollYProgress } = useScroll({
    target: target,
  });
  const scaleX = useSpring(scrollYProgress, MOTION_FRAME_TRANSITION.spring3);

  return (
    <motion.div
      style={{ scaleX, top: hSize }}
      className="fixed left-0 right-0 h-1 bg-accent/90 origin-left z-50"
    />
  );
};

export default ScrollProgressBar;
