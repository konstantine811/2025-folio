import { AnimatePresence, motion } from "motion/react";
import { useNavMenuScope } from "@/storage/scoped-nav-menu-store";
import { MOTION_FRAME_TRANSITION } from "@config/animations";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";

const MapMenu = () => {
  const { isOpen } = useNavMenuScope("map");
  const hs = useHeaderSizeStore((s) => s.size);

  const menuVariants = {
    closed: {
      width: 0,
      opacity: 0,
      transition: MOTION_FRAME_TRANSITION.spring4,
    },
    open: {
      width: "100%",
      opacity: 1,
      transition: MOTION_FRAME_TRANSITION.spring4,
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={MOTION_FRAME_TRANSITION.spring3}
            className="fixed inset-0 bg-black/20 z-30 pointer-events-auto"
            style={{ top: hs }}
            onClick={() => setOpen(false)}
          /> */}
          {/* Menu */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="relative bg-background/95 max-w-3xl backdrop-blur-sm border-r border-border shadow-2xl z-40 overflow-hidden pointer-events-auto"
            style={{
              top: hs,
              maxHeight: `calc(100vh - ${hs}px)`,
            }}
          >
            <div className="h-full pl-24 overflow-y-auto p-6 space-y-6 w-full">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">SPHERA OF DEUTSCHLAND</h1>
                  <span className="text-2xl">🇩🇪</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-mono">2025</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="text-muted-foreground"
                  >
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris.
                </p>

                {/* Data Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Card 1 */}
                  <div className="p-4 border border-border rounded-lg bg-card/50">
                    <div className="text-xs text-muted-foreground mb-1">
                      GDP, total current
                    </div>
                    <div className="text-lg font-bold">$4.7T</div>
                  </div>

                  {/* Card 2 */}
                  <div className="p-4 border border-border rounded-lg bg-card/50">
                    <div className="text-xs text-muted-foreground mb-1">
                      Volume of import, 2025
                    </div>
                    <div className="text-lg font-bold">$2.4T</div>
                  </div>

                  {/* Card 3 - Highlighted */}
                  <div className="p-4 border border-border rounded-lg bg-foreground text-background relative group cursor-pointer hover:scale-105 transition-transform">
                    <div className="text-xs opacity-80 mb-1">
                      Total amount contracted, 2024
                    </div>
                    <div className="text-lg font-bold">$2.4T</div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="absolute top-4 right-4 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <path
                        d="M6 12L10 8L6 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Card 4 */}
                  <div className="p-4 border border-border rounded-lg bg-card/50">
                    <div className="text-xs text-muted-foreground mb-1">
                      Public contracts volume, 2025
                    </div>
                    <div className="text-lg font-bold">$2.4T</div>
                  </div>

                  {/* Card 5 */}
                  <div className="p-4 border border-border rounded-lg bg-card/50">
                    <div className="text-xs text-muted-foreground mb-1">
                      International investment, 2025
                    </div>
                    <div className="text-lg font-bold">$0.4T</div>
                  </div>

                  {/* Card 6 */}
                  <div className="p-4 border border-border rounded-lg bg-card/50">
                    <div className="text-xs text-muted-foreground mb-1">
                      Total active opportunities
                    </div>
                    <div className="text-lg font-bold">$2.4K</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MapMenu;
