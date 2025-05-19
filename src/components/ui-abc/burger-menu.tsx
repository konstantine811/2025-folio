import { MOTION_FRAME_TRANSITION } from "@config/animations";
import { motion, Transition } from "framer-motion";
import { forwardRef } from "react";

interface Props {
  isOpen: boolean;
  props?: React.HTMLProps<HTMLDivElement>;
}

const BurgerMenu = forwardRef<HTMLDivElement, Props>(
  ({ isOpen, ...props }, ref) => {
    const duration: Transition = MOTION_FRAME_TRANSITION.spring;

    return (
      <div ref={ref} {...props} className="relative w-6 flex flex-col">
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 4 : 0 }}
          className="block w-full h-px bg-foreground mb-2"
          transition={duration}
        />
        <motion.span
          animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -4 : 0 }}
          className="block w-full h-px bg-foreground"
          transition={duration}
        />
      </div>
    );
  }
);

BurgerMenu.displayName = "BurgerMenu";

export default BurgerMenu;
