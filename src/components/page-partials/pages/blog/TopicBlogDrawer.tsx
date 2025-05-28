import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { MOTION_FRAME_TRANSITION } from "@/config/animations";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import WrapperHoverElement from "@/components/ui-abc/wrapper-hover-element";
import { useClickStore } from "@/storage/clickStore";
import TopicBlogDrawerContent from "./TopicBlogDrawerContent";
import { useSoundEnabledStore } from "@/storage/soundEnabled";

const offset = 10;
const btnWidth = 50;

const TopicBlogDrawer = () => {
  const hSize = useHeaderSizeStore((state) => state.size);
  const setClick = useClickStore((s) => s.setClick);
  const isSoundEnabled = useSoundEnabledStore((state) => state.isSoundEnabled);
  const [isOpen, setIsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const drawerWidth = Math.min(448, windowWidth - btnWidth - 5); // максимум 448, мінімум адаптивно

  return (
    <div>
      <motion.div
        animate={{ x: isOpen ? 0 : -drawerWidth }}
        initial={{ x: -drawerWidth }}
        transition={MOTION_FRAME_TRANSITION.spring3}
        className="fixed top-0 left-0 flex w-full"
        style={{
          top: offset + hSize,
          zIndex: 21,
          maxWidth: drawerWidth + btnWidth,
          height: `calc(100vh - ${hSize + offset * 2}px)`,
        }}
      >
        {/* Drawer */}
        <div
          className="shadow-xl bg-card/70 backdrop-blur-2xl overflow-auto pb-24"
          style={{
            width: drawerWidth,
            height: "100%",
          }}
        >
          <TopicBlogDrawerContent onClose={() => setIsOpen(false)} />
        </div>

        {/* Toggle button */}
        <WrapperHoverElement>
          <SoundHoverElement
            as="button"
            hoverStyleElement={HoverStyleElement.quad}
            animValue={0.95}
            onClick={() => setIsOpen(!isOpen)}
            className="bg-card text-foreground mt-4 outline-0 flex items-center justify-center"
            style={{
              width: btnWidth,
              height: btnWidth,
            }}
          >
            {isOpen ? <ArrowBigLeft /> : <ArrowBigRight />}
          </SoundHoverElement>
        </WrapperHoverElement>
      </motion.div>

      {/* Click outside */}
      {isOpen && (
        <div
          className="fixed w-full h-full top-0 z-20"
          onClick={() => {
            setIsOpen(false);
            if (isSoundEnabled) {
              setClick(SoundTypeElement.BUTTON);
            }
          }}
        ></div>
      )}
    </div>
  );
};

export default TopicBlogDrawer;
