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
      <div
        ref={ref}
        {...props}
        className="relative flex-col flex justify-center items-end h-full"
      >
        <motion.span
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 4 : 0,
            width: isOpen ? 15 : 15,
          }}
          className="block h-px bg-muted-foreground"
          transition={duration}
        />
        <motion.span
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? 3 : 5,
            width: isOpen ? 15 : 8,
          }}
          className="block h-px bg-muted-foreground"
          transition={duration}
        />
        <motion.span
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? 2 : 10,
            width: isOpen ? 15 : 11,
          }}
          className="block h-px bg-muted-foreground"
          transition={duration}
        />
      </div>
    );
  }
);

BurgerMenu.displayName = "BurgerMenu";

export default BurgerMenu;
