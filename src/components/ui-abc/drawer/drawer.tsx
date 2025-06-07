import { AnimatePresence, motion } from "framer-motion";
import { createContext, useContext, useState } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { MOTION_FRAME_TRANSITION } from "@/config/animations";

export type DrawerDirection = "right" | "top" | "bottom" | "left";
const DrawerContext = createContext<{
  direction: "right" | "top" | "bottom" | "left";
  open: boolean;
  setOpen: (v: boolean) => void;
}>({
  direction: "right",
  open: false,
  setOpen: () => {},
});

export const Drawer = ({
  direction = "right",
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  direction?: DrawerDirection;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  return (
    <DrawerContext.Provider value={{ direction, open, setOpen }}>
      {children}
    </DrawerContext.Provider>
  );
};

export const DrawerTrigger = ({ children }: { children: React.ReactNode }) => {
  const { setOpen } = useContext(DrawerContext);
  return <div onClick={() => setOpen(true)}>{children}</div>;
};

export const DrawerClose = ({ children }: { children: React.ReactNode }) => {
  const { setOpen } = useContext(DrawerContext);
  return <div onClick={() => setOpen(false)}>{children}</div>;
};

const drawerContentVariants = cva(
  "fixed z-[10000] flex h-auto flex-col bg-background/60 backdrop-blur-xs  w-full",
  {
    variants: {
      direction: {
        right: "top-0 bottom-0 right-0",
        left: "top-0 bottom-0 left-0",
        top: "top-0 left-0 right-0 h-64",
        bottom: "bottom-0 left-0 right-0 h-64",
      },
    },
    defaultVariants: {
      direction: "right",
    },
  }
);

export const DrawerContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { open, setOpen, direction } = useContext(DrawerContext);
  const getInitial = () => {
    switch (direction) {
      case "right":
        return { x: "100%" };
      case "left":
        return { x: "-100%" };
      case "top":
        return { y: "-100%" };
      case "bottom":
        return { y: "100%" };
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-background/50"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className={cn(drawerContentVariants({ direction }), className)}
            onClick={(e) => e.stopPropagation()}
            initial={getInitial()}
            animate={{ x: 0, y: 0 }}
            exit={getInitial()}
            transition={MOTION_FRAME_TRANSITION.spring3}
          >
            <div className="px-4 w-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const DrawerHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { setOpen } = useContext(DrawerContext);
  return (
    <div className={cn("py-4 flex gap-2 justify-between", className)}>
      <div>{children}</div>
      <div className="fixed right-3 z-50">
        <Button
          variant="outline"
          onClick={() => {
            setOpen(false);
          }}
          className="rounded-full h-10 w-10 border-foreground/10 bg-background/50 backdrop-blur-md"
        >
          <X />
        </Button>
      </div>
    </div>
  );
};

export const DrawerFooter = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("p-4 border-t mt-auto", className)}>{children}</div>;

export const DrawerTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <h2 className={cn("text-lg font-bold", className)}>{children}</h2>;

export const DrawerDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
);
