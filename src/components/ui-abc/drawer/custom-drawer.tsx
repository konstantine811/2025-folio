import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import SoundHoverElement from "../sound-hover-element";
import { ArrowBigLeft } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

const CustomDrawer = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [t] = useTranslation();

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger>
        <Button
          asChild
          className="bg-card hover:bg-card/10 rounded-r-none fixed right-0 z-30 text-foreground"
        >
          <SoundHoverElement animValue={-3.3} hoverAnimType="translate-x">
            <ArrowBigLeft />
          </SoundHoverElement>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="border-foreground/10 overflow-y-scroll max-h-screen">
        <ScrollArea className="w-full touch-auto overscroll-contain">
          <div className="mx-auto w-full max-w-sm px-4 box-border">
            <DrawerHeader>
              <DrawerTitle>{t(title)}</DrawerTitle>
              <DrawerDescription>{t(description)}</DrawerDescription>
            </DrawerHeader>
            {children}
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default CustomDrawer;
