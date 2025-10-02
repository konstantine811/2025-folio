import { Button } from "@/components/ui/button";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { Pause, Play } from "lucide-react";
import { StatusServer, useEditModeStore } from "../store/useEditModeStore";
import RightSidePanel from "./righ-panel/right-side-panel";
import { AnimatePresence, motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Loader from "./loader";

const UI = () => {
  const hs = useHeaderSizeStore((s) => s.size);

  const isEditMode = useEditModeStore((s) => s.isEditMode);
  const setIsEditMode = useEditModeStore((s) => s.setIsEditMode);
  const isPhysicsDebug = useEditModeStore((s) => s.isPhysicsDebug);
  const setIsPhysicsDebug = useEditModeStore((s) => s.setIsPhysicsDebug);
  const setIdEditInstance = useEditModeStore((s) => s.setIdEditInstance);
  const statusServer = useEditModeStore((s) => s.statusServer);
  const setIsDebug = useEditModeStore((s) => s.setIsDebug);
  const isDebug = useEditModeStore((s) => s.isDebug);

  return (
    <>
      {statusServer !== StatusServer.loaded && <Loader />}
      <div
        className="fixed w-full pointer-events-none grid grid-cols-3 z-20 items-start"
        style={{ height: `calc(100vh - ${hs}px)`, top: `${hs}px` }}
      >
        <div className="pointer-events-auto col-span-1 flex h-auto align-baseline justify-center mt-1">
          <div className="flex gap-2 bg-background/5 p-2 rounded-md backdrop-blur-2xl">
            <Button
              variant="outline"
              size="icon"
              className="size-10"
              onClick={() => {
                setIsEditMode(!isEditMode);
                if (isEditMode) {
                  setIdEditInstance(null);
                }
              }}
            >
              {isEditMode ? <Play /> : <Pause />}
            </Button>
            <div className="h-auto flex gap-1 flex-col">
              <Label htmlFor="isPhysics" className="text-background">
                isPhysics
              </Label>
              <Checkbox
                id="isPhysics"
                checked={isPhysicsDebug}
                onCheckedChange={setIsPhysicsDebug}
              />
            </div>
            <div className="h-auto flex gap-1 flex-col">
              <Label htmlFor="isPhysics" className="text-background">
                isDebug
              </Label>
              <Checkbox
                id="isDebug"
                checked={isDebug}
                onCheckedChange={setIsDebug}
              />
            </div>
          </div>
        </div>
        <div className="col-span-1"></div>
        {/* Права панель з анімацією */}
        <AnimatePresence mode="wait" initial={false}>
          {isEditMode && (
            <motion.div
              key="right-panel"
              className="col-span-1 flex h-auto justify-end mt-15 mb-1 origin-right"
              initial={{ x: 200, opacity: 0, scale: 0.99 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 200, opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.3, ease: "circInOut" }}
            >
              {/* Опціонально легкий pop-in самому блоку */}
              <RightSidePanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default UI;
