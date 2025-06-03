import { Checkbox } from "@/components/ui/checkbox";
import { ItemTask } from "@/types/drag-and-drop.model";
import {
  getPriorityBorderClass,
  getPriorityClassByPrefix,
} from "./utils/dnd.utils";
import { UniqueIdentifier } from "@dnd-kit/core";
import { checkInSound, checkOutSound } from "@/config/sounds";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import TaskPlay from "./task-play";
import WrapperHoverElement from "../ui-abc/wrapper-hover-element";
import { Button } from "../ui/button";
import { Settings2 } from "lucide-react";
import { useState } from "react";

import TaskLocalTimeStatic from "./task-local-time-static";
import { useTranslation } from "react-i18next";
import TaskDeterminedTime from "./task-components/task-determined-time";
import { StyleWordBreak } from "@/config/styles.config";
export function TaskItem({
  index = "",
  task,
  onToggle,
  children,
  dragging = false,
  onEditTask,
  templated,
  style, // ✅ додали
}: {
  index?: number | string;
  task: ItemTask;
  onToggle?: (id: UniqueIdentifier, value: boolean) => void;
  onEditTask?: (task: ItemTask) => void;
  onDelete?: () => void;
  children?: React.ReactNode;
  dragging?: boolean;
  templated: boolean;
  style?: React.CSSProperties; // ✅ додали
}) {
  const [isPlay, setIsPlay] = useState(false);
  const [t] = useTranslation();
  const hasLongWord = task.title.split(" ").some((word) => word.length > 40); // можна змінити 20 на поріг
  return (
    <div
      style={style} // ✅ передаємо стилі для анімації
      className={`relative group rounded-xl border ${
        isPlay ? getPriorityBorderClass(task.priority) : "border-transparent"
      }`}
    >
      {templated && (
        <div className="mt-5">
          <div className="absolute top-1 flex items-center w-full justify-center">
            {task.whenDo.map((day) => (
              <div
                key={day}
                className="w-5 h-5 p-1 flex items-center justify-center rounded-full border bg-background text-foreground border-foreground/30 text-[10px]"
              >
                {t(`task_manager.day_names.${day}`)}
              </div>
            ))}
          </div>
        </div>
      )}
      <div
        className="flex items-center justify-between gap-2 bg-card 
             border border-foreground/10 rounded-xl px-4 py-3 text-foreground 
             group transition-all hover:border-foreground/10 hover:bg-card/10 duration-300"
      >
        {!templated && (
          <SoundHoverElement
            className="h-5 w-5"
            animValue={1.4}
            hoverTypeElement={SoundTypeElement.SELECT}
          >
            <Checkbox
              className={`w-5 h-5`}
              id={`isDone-${task.id}`}
              checked={task.isDone}
              onCheckedChange={() => {
                if (onToggle) {
                  if (!task.isDone) {
                    checkOutSound.stop();
                    checkInSound.play();
                  } else {
                    checkInSound.stop();
                    checkOutSound.play();
                  }
                  onToggle(task.id, !task.isDone);
                }
              }}
            />
          </SoundHoverElement>
        )}

        <span
          className={`w-6 text-xs ${
            task.isDone
              ? getPriorityClassByPrefix(task.priority)
              : "text-muted-foreground"
          }`}
        >
          {(index || index === 0) && Number(index) + 1}
        </span>

        <p
          className={`flex-1 text-left text-sm ${hasLongWord && "truncate"} ${
            task.isDone
              ? "text-accent font-medium"
              : `${getPriorityClassByPrefix(task.priority)}`
          }`}
          style={StyleWordBreak}
          title={hasLongWord ? task.title : ""}
        >
          {task.title}
        </p>

        <div className="flex items-center gap-2">
          {!dragging && (
            <>
              {task.isPlanned ? (
                <div className="flex justify-center flex-col gap-1">
                  <TaskLocalTimeStatic
                    timeInSeconds={task.time}
                    isPlanned={!task.isDone}
                    tooltipText={t(
                      "task_manager.dialog_create_task.task.time.label"
                    )}
                    className="text-md"
                  />
                  {task.isDone && (
                    <TaskLocalTimeStatic
                      timeInSeconds={task.timeDone}
                      isPlanned={!task.isDone}
                      tooltipText={t(
                        "task_manager.dialog_create_task.task.time.wasted_time"
                      )}
                    />
                  )}
                </div>
              ) : (
                <>
                  {task.isDetermined ? (
                    <TaskDeterminedTime
                      task={task}
                      titleDeterminedTime={t(
                        "task_manager.dialog_create_task.task.time.on_time"
                      )}
                      titleSpendingTime={t(
                        "task_manager.dialog_create_task.task.time.wasted_time"
                      )}
                    />
                  ) : (
                    <TaskPlay
                      templated={templated}
                      onPlay={setIsPlay}
                      task={task}
                    />
                  )}
                </>
              )}
              {onEditTask && (
                <WrapperHoverElement>
                  <SoundHoverElement
                    animValue={0.99}
                    hoverTypeElement={
                      task.isDone
                        ? SoundTypeElement.NONE
                        : SoundTypeElement.SELECT
                    }
                    hoverStyleElement={
                      task.isDone
                        ? HoverStyleElement.none
                        : HoverStyleElement.quad
                    }
                  >
                    <Button
                      variant="ghost"
                      disabled={task.isDone}
                      size="icon"
                      onClick={() => {
                        onEditTask(task);
                      }}
                      className={`hover:bg-card/50 hover:text-foreground ${
                        task.isDone && "text-muted-foreground/30"
                      }`}
                    >
                      <Settings2 className="w-4 h-4" />
                    </Button>
                  </SoundHoverElement>
                </WrapperHoverElement>
              )}
            </>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
