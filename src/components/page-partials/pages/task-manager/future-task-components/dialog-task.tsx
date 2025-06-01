import { useHoverStore } from "@/storage/hoverStore";
import {
  ItemTask,
  ItemTaskCategory,
  Priority,
} from "@/types/drag-and-drop.model";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import WrapperHoverElement from "@/components/ui-abc/wrapper-hover-element";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPriorityClassByPrefix } from "@/components/dnd/utils/dnd.utils";
import TimePicker from "@/components/ui-abc/select/select-time";
import InputCombobox from "@/components/ui-abc/inputs/input-combobox";
import { CATEGORY_OPTIONS } from "@/components/dnd/config/category-options";
import { createTask } from "@/components/dnd/utils/createTask";
import { TimePickerInputs } from "@/components/dnd/time-picker-inputs";

const DialogFeatureTask = ({
  onChangeTask,
  isOpen,
  setOpen,
  task,
}: {
  isOpen: boolean;
  onChangeTask: (task: ItemTask, categoryName: string) => void;
  setOpen: (open: boolean) => void;
  task?: ItemTaskCategory | null;
}) => {
  const [t] = useTranslation();
  const setHover = useHoverStore((s) => s.setHover);
  const [title, setTitle] = useState<string>("");
  const [priority, setPriority] = useState<Priority>(Priority.LOW);
  const [categoryName, setCategoryName] = useState<string>("");
  const [time, setTime] = useState<number>(0);
  const [timeDone, setTimeDone] = useState<number>(0);
  const handleCreateTask = () => {
    if (title.trim() === "" || categoryName.trim() === "") return;
    if (task) {
      // If task is being edited, we update it
      const updatedTask = {
        ...task,
        title,
        priority,
        time,
        timeDone,
        categoryName,
      };
      onChangeTask(updatedTask, categoryName);
      reset();
      return;
    }
    const newTask = createTask(title, priority, time, true, timeDone);
    onChangeTask(newTask, categoryName);
    reset();
    setHover(false, null, HoverStyleElement.circle);
  };

  function reset() {
    setTitle("");
    setPriority(Priority.LOW);
    setTime(0);
  }

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setPriority(task.priority);
      setTime(task.time);
      setTimeDone(task.timeDone);
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
    setTimeout(() => {
      setHover(false, null, HoverStyleElement.circle);
    }, 100);
  }, [setHover, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="dialog"
          initial={{ opacity: 0, scale: 0.9, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -30 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex justify-center items-center overflow-y-auto bg-background/80 backdrop-blur-xs w-full"
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
                    {t(`task_manager.dialog_create_task.2.title`)}
                  </h3>
                  <p className="text-muted-foreground font-mono">
                    {t(`task_manager.dialog_create_task.2.description`)}
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
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-4 sm:gap-4">
                  <Label htmlFor="name" className="text-right">
                    {t("task_manager.dialog_create_task.task.title.label")}
                  </Label>
                  <InputCombobox
                    className="col-span-3"
                    outerValue={task ? task.categoryName : ""}
                    options={CATEGORY_OPTIONS}
                    onValueChange={(value) => {
                      setCategoryName(value);
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-4 sm:gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-4 sm:gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-4 sm:gap-4">
                  <Label htmlFor="time" className="text-right">
                    {t("task_manager.dialog_create_task.task.time.label")}
                  </Label>
                  <TimePicker
                    className="col-span-3"
                    onChange={(time) => {
                      setTime(time);
                    }}
                    time={task ? task.time : 0}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-4 sm:gap-4">
                  <TimePickerInputs
                    title={t(
                      "task_manager.dialog_create_task.task.time.wasted_planned_time"
                    )}
                    time={timeDone}
                    onChange={(value) => {
                      setTimeDone(value);
                    }}
                  />
                </div>
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
                      disabled={title === "" || categoryName === ""}
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

export default DialogFeatureTask;
