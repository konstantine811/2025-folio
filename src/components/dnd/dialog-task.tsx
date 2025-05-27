import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ItemTask, Priority } from "@/types/drag-and-drop.model";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { getRandomFromTo } from "@/utils/random";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPriorityClassByPrefix } from "./utils/dnd.utils";
import { Textarea } from "@/components/ui/textarea";
import { TimePickerInputs } from "./time-picker-inputs";
import { UniqueIdentifier } from "@dnd-kit/core";

const DialogTask = ({
  onChangeTask,
  isOpen,
  setOpen,
  task,
  containerId,
}: {
  isOpen: boolean;
  onChangeTask: (
    taskId: UniqueIdentifier | null,
    title: string,
    priority: Priority,
    time: number,
    wastedTime: number,
    containerId: UniqueIdentifier | null
  ) => void;
  setOpen: (open: boolean) => void;
  task?: ItemTask | null;
  containerId: UniqueIdentifier | null;
}) => {
  const [t] = useTranslation();
  const setHover = useHoverStore((s) => s.setHover);
  const [title, setTitle] = useState<string>("");
  const [priority, setPriority] = useState<Priority>(Priority.LOW);
  const [time, setTime] = useState<number>(0);
  const [wastedTime, setWastedTime] = useState<number>(0);
  const [translateRandom, setTranslateRandom] = useState(1);
  const handleCreateTask = () => {
    if (title.trim() === "") return;
    if (task) {
      onChangeTask(task.id, title, priority, time, wastedTime, containerId);
    } else {
      onChangeTask(null, title, priority, time, wastedTime, containerId);
    }

    if (!task) {
      reset();
    }

    setHover(false, null, HoverStyleElement.circle);
  };

  function reset() {
    setTitle("");
    setPriority(Priority.LOW);
    setTime(0);
    setWastedTime(0);
  }

  useEffect(() => {
    reset();
    if (task) {
      console.log("task", task);
      setTitle(task.title);
      setPriority(task.priority);
      setTime(task.time);
      setWastedTime(task.timeDone);
    }
  }, [task]);

  useEffect(() => {
    setTranslateRandom(getRandomFromTo(1, 4));
    setTimeout(() => {
      setHover(false, null, HoverStyleElement.circle);
    }, 300);
  }, [setHover]);

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="overflow-y-auto max-h-[90vh]">
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
            <Textarea
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
                      <SelectItem
                        value={p}
                        className={`${getPriorityClassByPrefix(p)}`}
                      >
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
          <TimePickerInputs
            title={t("task_manager.dialog_create_task.task.time.label")}
            time={time}
            onChange={(value) => {
              setTime(value);
            }}
          />
          {task && (
            <TimePickerInputs
              title={t("task_manager.dialog_create_task.task.time.wasted_time")}
              time={wastedTime}
              onChange={(value) => {
                setWastedTime(value);
              }}
            />
          )}
        </div>
        <DialogFooter>
          <DialogClose
            onClick={() => setHover(false, null, HoverStyleElement.circle)}
            asChild
            disabled={title === ""}
          >
            <SoundHoverElement
              animValue={0.98}
              hoverTypeElement={SoundTypeElement.LINK}
              hoverStyleElement={HoverStyleElement.none}
            >
              <Button
                onClick={() => {
                  handleCreateTask();
                }}
                disabled={title === ""}
                variant="outline"
                className="cursor-pointer"
              >
                {task ? t("task_manager.edit") : t("task_manager.add")}
              </Button>
            </SoundHoverElement>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DialogTask;
