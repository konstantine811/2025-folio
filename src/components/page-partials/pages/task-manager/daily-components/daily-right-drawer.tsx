import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ArrowBigLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import DailySidePanelContent from "./daily-side-panel-content";

const DailyRightDrawer = () => {
  const [t] = useTranslation();
  return (
    <Drawer direction="right">
      <DrawerTrigger>
        <Button
          asChild
          className="bg-card hover:bg-card/10 rounded-r-none fixed right-0 z-50"
        >
          <SoundHoverElement animValue={-3.3} hoverAnimType="translate-x">
            <ArrowBigLeft />
          </SoundHoverElement>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="border-foreground/10">
        <div className="mx-auto w-full max-w-sm right-0 px-1">
          <DrawerHeader>
            <DrawerTitle>{t("task_manager.calendar.header.title")}</DrawerTitle>
            <DrawerDescription>
              {t("task_manager.calendar.header.description")}
            </DrawerDescription>
          </DrawerHeader>
          <DailySidePanelContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DailyRightDrawer;
