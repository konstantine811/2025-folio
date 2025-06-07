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
  DrawerDirection,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { cn } from "@/utils/classname";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";

const CustomDrawer = ({
  title,
  description,
  children,
  direction = "right",
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  direction?: DrawerDirection;
}) => {
  const [open, setOpen] = useState(false);
  const [t] = useTranslation();
  const hs = useHeaderSizeStore((s) => s.size);
  const buttonTriggerDirectionClass = (direction: DrawerDirection) => {
    switch (direction) {
      case "right":
        return "right-0 rounded-r-none";
      case "top":
        return "top-[100px] rounded-t-none";
      case "bottom":
        return "bottom-[150px] rounded-b-none";
      case "left":
        return "left-0 rounded-l-none";
    }
  };

  const buttonDirectioinIcon = (direction: DrawerDirection) => {
    switch (direction) {
      case "right":
        return <ArrowBigLeft className="rotate-0" />;
      case "top":
        return <ArrowBigLeft className="rotate-90" />;
      case "bottom":
        return <ArrowBigLeft className="rotate-270" />;
      case "left":
        return <ArrowBigLeft className="rotate-180" />;
      default:
        return <ArrowBigLeft />;
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen} direction={direction}>
      <DrawerTrigger>
        <Button
          asChild
          className={cn(
            `bg-card/80 hover:bg-card/10 rounded-r-none fixed z-50 text-foreground h-12 ${buttonTriggerDirectionClass(
              direction
            )}`
          )}
          style={{ top: `${hs + 10}px` }}
        >
          <SoundHoverElement animValue={-3.3} hoverAnimType="translate-x">
            {buttonDirectioinIcon(direction)}
          </SoundHoverElement>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="border-foreground/10 overflow-y-scroll max-h-screen">
        <ScrollArea className="w-full touch-auto overscroll-contain">
          <div className="mx-auto w-full max-w-sm box-border">
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
