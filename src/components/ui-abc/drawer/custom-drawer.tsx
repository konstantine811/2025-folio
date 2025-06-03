import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useTranslation } from "react-i18next";
import SoundHoverElement from "../sound-hover-element";
import { ArrowBigLeft } from "lucide-react";
import { useState } from "react";

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
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction="right"
      noBodyStyles={true}
    >
      <DrawerTrigger>
        <Button
          asChild
          className="bg-card hover:bg-card/10 rounded-r-none fixed right-0 z-30"
        >
          <SoundHoverElement animValue={-3.3} hoverAnimType="translate-x">
            <ArrowBigLeft />
          </SoundHoverElement>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="border-foreground/10 overflow-y-auto overflow-x-hidden touch-auto overscroll-contain">
        <div className="mx-auto w-full max-w-sm right-0 px-4 ios-scroll-fix">
          <DrawerHeader>
            <DrawerTitle>{t(title)}</DrawerTitle>
            <DrawerDescription>{t(description)}</DrawerDescription>
          </DrawerHeader>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CustomDrawer;
