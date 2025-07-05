import SoundHoverElement from "@/components/ui-abc/sound-hover-element";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ArrowBigRight } from "lucide-react";
import TopicBlogDrawerContent from "./TopicBlogDrawerContent";
import { HoverStyleElement } from "@/types/sound";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const TopicBlogDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Drawer
      direction="left"
      open={isOpen}
      onOpenChange={setIsOpen}
      preventScrollRestoration={false}
      disablePreventScroll
      noBodyStyles
    >
      <DrawerTrigger className="fixed left-0 z-50 mt-3">
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
        <ScrollArea className="overflow-y-auto">
          <TopicBlogDrawerContent onClose={() => setIsOpen(false)} />
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default TopicBlogDrawer;
