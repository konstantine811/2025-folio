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
import DailyCalendar from "./daily-calendar";

const DailyRightDrawer = ({
  onChangeDate,
}: {
  onChangeDate: (date: Date) => void;
}) => {
  return (
    <Drawer direction="right">
      <DrawerTrigger>
        <Button
          asChild
          className="bg-card hover:bg-card/10 rounded-r-none fixed right-0"
        >
          <SoundHoverElement animValue={-3.3} hoverAnimType="translate-x">
            <ArrowBigLeft />
          </SoundHoverElement>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="border-foreground/10">
        <div className="mx-auto w-full max-w-sm right-0 px-1">
          <DrawerHeader>
            <DrawerTitle>Move Goal</DrawerTitle>
            <DrawerDescription>Set your daily activity goal.</DrawerDescription>
          </DrawerHeader>
          <div>
            <DailyCalendar onChangeDate={onChangeDate} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DailyRightDrawer;
