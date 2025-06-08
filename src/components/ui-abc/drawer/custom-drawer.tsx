import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import SoundHoverElement from "../sound-hover-element";
import { ArrowBigLeft } from "lucide-react";
import { useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/utils/classname";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerDirection,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import useScrollBehavior from "@/hooks/use-scroll-behavior";

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
  useScrollBehavior(open);
  const [t] = useTranslation();
  const hs = useHeaderSizeStore((s) => s.size);
  const bodyScrollTopRef = useRef<number>(0);
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
    <Drawer
      open={open}
      onOpenChange={(status) => {
        setOpen(status);
        if (!status) {
          setTimeout(() => {
            document.body.scrollBy({
              top: bodyScrollTopRef.current,
              left: 0,
              behavior: "smooth",
            });
          }, 600);
        } else {
          bodyScrollTopRef.current = document.body.scrollTop;
        }
      }}
      direction={direction}
    >
      <DrawerTrigger>
        <Button
          asChild
          className={cn(
            `bg-card hover:bg-card/50 rounded-r-none fixed z-50 text-foreground h-12 ${buttonTriggerDirectionClass(
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
      <DrawerContent className="border-foreground/10 max-h-screen z-[1000] outline-none">
        <ScrollArea className="w-full touch-auto overscroll-contain px-2 overflow-auto">
          <div className="mx-auto w-full">
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
