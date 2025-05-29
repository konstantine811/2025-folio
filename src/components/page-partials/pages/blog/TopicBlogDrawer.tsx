import SoundHoverElement from "@/components/ui-abc/sound-hover-element";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { ArrowBigRight } from "lucide-react";
import TopicBlogDrawerContent from "./TopicBlogDrawerContent";
import { HoverStyleElement } from "@/types/sound";
import { useState } from "react";

const TopicBlogDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Drawer direction="left" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger>
        <div className="fixed left-0 z-20">
          <Button
            asChild
            className="bg-card hover:bg-background rounded-l-none"
          >
            <SoundHoverElement
              animValue={3.3}
              hoverAnimType="translate-x"
              hoverStyleElement={HoverStyleElement.quad}
            >
              <ArrowBigRight />
            </SoundHoverElement>
          </Button>
        </div>
      </DrawerTrigger>
      <DrawerContent className="border-foreground/10">
        <TopicBlogDrawerContent />
      </DrawerContent>
    </Drawer>
  );
};

export default TopicBlogDrawer;
