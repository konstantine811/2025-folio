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
export function TaskItem({
  index = "",
  task,
  onToggle,
  children,
  dragging = false,
  onEditTask,
  templated,
}: {
  index?: number | string;
  task: ItemTask;
  onToggle?: (id: UniqueIdentifier, value: boolean) => void;
  onEditTask?: (task: ItemTask) => void;
  onDelete?: () => void;
  children?: React.ReactNode;
  dragging?: boolean;
  templated: boolean;
}) {
  const [isPlay, setIsPlay] = useState(false);

  return (
    <div
      className={`relative group rounded-xl border ${
        isPlay ? getPriorityBorderClass(task.priority) : "border-foreground/10"
      }`}
    >
      <div
        className="flex items-center justify-between gap-2 bg-card 
             border border-foreground/10 rounded-xl px-4 py-3 text-foreground 
             group transition-all hover:border-foreground/10 hover:bg-card/10 duration-500 ease-in-out"
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

        <span
          className={`flex-1 text-left text-sm ${
            task.isDone
              ? "text-accent font-medium"
              : `${getPriorityClassByPrefix(task.priority)}`
          }`}
        >
          {task.title}
        </span>

        <div className="flex items-center gap-2">
          {!dragging && (
            <>
              <TaskPlay templated={templated} onPlay={setIsPlay} task={task} />
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

        {/* {isChecked && onDelete && (
        <button
          onClick={onDelete}
          className="bg-red-500 hover:bg-red-600 transition text-white p-2 rounded-xl ml-2"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )} */}
      </div>
    </div>
  );
}
