import { MOTION_FRAME_TRANSITION } from "@config/animations";
import { motion, Transition } from "framer-motion";
import { forwardRef } from "react";

interface Props {
  isOpen: boolean;
  props?: React.HTMLProps<HTMLDivElement>;
  isEqualWidth?: boolean;
  width?: number;
}

const BurgerMenu = forwardRef<HTMLDivElement, Props>(
  ({ isOpen, ...props }, ref) => {
    const duration: Transition = MOTION_FRAME_TRANSITION.spring;
    const isEqualWidth = props?.isEqualWidth ?? false;
    const width = props?.width ?? 15;
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
            width,
          }}
          className="block h-px bg-muted-foreground"
          transition={duration}
        />
        <motion.span
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? 3 : width / 3,
            width: isOpen ? width : !isEqualWidth ? width - 7 : width,
          }}
          className="block h-px bg-muted-foreground"
          transition={duration}
        />
        <motion.span
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? 2 : width / 1.5,
            width: isOpen ? width : !isEqualWidth ? width - 4 : width,
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
