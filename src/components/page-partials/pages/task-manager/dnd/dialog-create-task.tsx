import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import WrapperHoverElement from "@/components/ui-abc/wrapper-hover-element";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHoverStore } from "@/storage/hoverStore";
import { Priority } from "@/types/drag-and-drop.model";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { getRandomFromTo } from "@/utils/random";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const DialogCreateTask = () => {
  const [t] = useTranslation();
  const setHover = useHoverStore((s) => s.setHover);
  const [title, setTitle] = useState<string>("");
  const [priority, setPriority] = useState<Priority>(Priority.LOW);
  const [translateRandom, setTranslateRandom] = useState(1);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center">
          <WrapperHoverElement>
            <SoundHoverElement
              animValue={0.99}
              hoverTypeElement={SoundTypeElement.LINK}
              hoverStyleElement={HoverStyleElement.quad}
            >
              <Button
                onClick={() => {
                  setTimeout(() => {
                    setHover(false, null, HoverStyleElement.circle);
                  }, 300);
                  setTranslateRandom(getRandomFromTo(1, 4));
                }}
                variant="link"
                className="cursor-pointer"
              >
                {t("task_manager.add")}
              </Button>
            </SoundHoverElement>
          </WrapperHoverElement>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t(`task_manager.dialog_create_task.${translateRandom}.title`)}
          </DialogTitle>
          <DialogDescription>
            {t(
              `task_manager.dialog_create_task.${translateRandom}.description`
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("task_manager.dialog_create_task.task.title.label")}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t(
                "task_manager.dialog_create_task.task.title.description"
              )}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t("task_manager.dialog_create_task.task.priority.label")}
            </Label>
            <Select
              value={priority}
              onValueChange={(value) => {
                setPriority(value as Priority);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={t(
                    "task_manager.dialog_create_task.task.priority.description"
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>
                    {t(
                      "task_manager.dialog_create_task.task.priority.description"
                    )}
                  </SelectLabel>
                  {Object.values(Priority).map((p) => (
                    <SoundHoverElement
                      key={p}
                      animValue={0.99}
                      hoverStyleElement={HoverStyleElement.none}
                    >
                      <SelectItem value={p}>
                        {t(
                          `task_manager.dialog_create_task.task.priority.options.${p.toLowerCase()}`
                        )}
                      </SelectItem>
                    </SoundHoverElement>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose
            onClick={() => setHover(false, null, HoverStyleElement.circle)}
            asChild
          >
            <SoundHoverElement
              animValue={0.98}
              hoverTypeElement={SoundTypeElement.LINK}
              hoverStyleElement={HoverStyleElement.none}
            >
              <Button
                onClick={() => {
                  // setHover(false, null, HoverStyleElement.circle);
                }}
                variant="outline"
                className="cursor-pointer"
              >
                {t("task_manager.add")}
              </Button>
            </SoundHoverElement>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCreateTask;
