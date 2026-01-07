import SoundHoverElement from "@/components/ui-abc/sound-hover-element";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ArrowBigRight } from "lucide-react";
import TopicBlogDrawerContent from "./TopicBlogDrawerContent";
import { HoverStyleElement } from "@/types/sound";
import { useState, useRef } from "react";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";

const TopicBlogDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const hs = useHeaderSizeStore((state) => state.size);
  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Використовуємо загальний хук для блокування скролу з нативним скролом
  useModalScrollLock({
    isOpen,
    modalRef: drawerRef,
    scrollContainerRef,
    useNativeScroll: true, // Використовуємо нативний скрол замість Lenis
  });
  return (
    <Drawer
      direction="left"
      open={isOpen}
      onOpenChange={setIsOpen}
      preventScrollRestoration={false}
      disablePreventScroll
      noBodyStyles
    >
      <DrawerTrigger
        className="fixed left-0 z-50 mt-3"
        style={{ top: `${hs}px` }}
      >
        <Button
          asChild
          className="bg-card hover:bg-background rounded-l-none text-foreground"
        >
          <SoundHoverElement
            animValue={3.3}
            hoverAnimType="translate-x"
            hoverStyleElement={HoverStyleElement.quad}
          >
            <ArrowBigRight />
          </SoundHoverElement>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="border-foreground/10">
        <div ref={drawerRef} className="h-full flex flex-col overflow-hidden">
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar"
            style={{
              position: "relative",
              touchAction: "pan-y",
              height: "100%",
              WebkitOverflowScrolling: "touch",
            }}
            onWheel={(e) => {
              // Дозволяємо скролл всередині контейнера
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              // Дозволяємо скролл всередині контейнера
              e.stopPropagation();
            }}
          >
            <TopicBlogDrawerContent onClose={() => setIsOpen(false)} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default TopicBlogDrawer;
