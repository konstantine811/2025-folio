import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
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
import { X } from "lucide-react";
import WrapperHoverElement from "../ui-abc/wrapper-hover-element";

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
    if (task) {
      setTitle(task.title);
      setPriority(task.priority);
      setTime(task.time);
      setWastedTime(task.timeDone);
    } else {
      reset();
    }
  }, [task]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    setTranslateRandom(getRandomFromTo(1, 4));
    setTimeout(() => {
      setHover(false, null, HoverStyleElement.circle);
    }, 300);
  }, [setHover]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="dialog"
          initial={{ opacity: 0, scale: 0.9, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -30 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex justify-center items-center overflow-y-auto bg-background/10 backdrop-blur-xs w-full"
          onClick={() => setOpen(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="bg-background/80 rounded-xl p-6 sm:p-6 px-4 shadow-lg w-full max-w-lg border border-foreground/20 backdrop-blur-xs max-h-screen overflow-y-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div>
              <div className="relative">
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-semibold break-words">
                    {t(
                      `task_manager.dialog_create_task.${translateRandom}.title`
                    )}
                  </h3>
                  <p className="text-muted-foreground font-mono">
                    {t(
                      `task_manager.dialog_create_task.${translateRandom}.description`
                    )}
                  </p>
                </div>
                <WrapperHoverElement>
                  <SoundHoverElement
                    className="absolute -top-4 -right-2 rounded-full"
                    hoverTypeElement={SoundTypeElement.SELECT_2}
                    hoverStyleElement={HoverStyleElement.quad}
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-card/80 hover:text-foreground rounded-full transition duration-300"
                      onClick={() => setOpen(false)}
                    >
                      <X />
                    </Button>
                  </SoundHoverElement>
                </WrapperHoverElement>
              </div>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                  <Label htmlFor="priority" className="text-right">
                    {t("task_manager.dialog_create_task.task.priority.label")}
                  </Label>
                  <Select
                    name="priority"
                    value={priority}
                    onValueChange={(value) => {
                      setPriority(value as Priority);
                    }}
                  >
                    <SelectTrigger name="prioriy" className="w-full col-span-3">
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
                    title={t(
                      "task_manager.dialog_create_task.task.time.wasted_time"
                    )}
                    time={wastedTime}
                    onChange={(value) => {
                      setWastedTime(value);
                    }}
                  />
                )}
              </div>
              <div>
                <div className="flex gap-1 justify-end">
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
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DialogTask;
