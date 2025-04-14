import { motion, Transition } from "framer-motion";
import { forwardRef } from "react";

interface Props {
  isOpen: boolean;
  props?: React.HTMLProps<HTMLDivElement>;
}

const BurgerMenu = forwardRef<HTMLDivElement, Props>(
  ({ isOpen, ...props }, ref) => {
    const duration: Transition = {
      duration: 0.1,
      ease: "easeInOut",
      type: "spring",
      bounce: 1.4,
      damping: 10,
      stiffness: 100,
      mass: 0.5,
    };

    return (
      <div ref={ref} {...props} className="relative w-6 flex flex-col">
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 4 : 0 }}
          className="block w-full h-px bg-white mb-2"
          transition={duration}
        />
        <motion.span
          animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -4 : 0 }}
          className="block w-full h-px bg-white"
          transition={duration}
        />
      </div>
    );
  }
);

BurgerMenu.displayName = "BurgerMenu";

export default BurgerMenu;
