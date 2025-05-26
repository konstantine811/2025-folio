import { Checkbox } from "@/components/ui/checkbox";
import { ItemTask } from "@/types/drag-and-drop.model";
import { Settings2 } from "lucide-react";
import {
  getPriorityBorderClass,
  getPriorityClassByPrefix,
  PriorityPrefixClass,
} from "./utils/dnd.utils";
import { UniqueIdentifier } from "@dnd-kit/core";
import { checkInSound, checkOutSound } from "@/config/sounds";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { SoundTypeElement } from "@/types/sound";

export function TaskItem({
  index = "",
  task,
  onDelete,
  onToggle,
  children,
}: {
  index?: number | string;
  task: ItemTask;
  onToggle?: (id: UniqueIdentifier, value: boolean) => void;
  onDelete?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative group overflow-hidden rounded-full border border-foreground/10">
      {/* <div
        className={`${getPriorityClassByPrefix(
          task.priority,
          PriorityPrefixClass.from
        )} absolute aspect-square w-[100px] pointer-events-none bg-linear-210 to-card h-[3.8px] rounded-2xl`}
        style={{
          offsetPath: "rect(0px auto auto 0px round 999px)",
          offsetDistance: "0%",
          WebkitMaskImage:
            "linear-gradient(white, white) padding-box, linear-gradient(white, white)",
          WebkitMaskComposite: "destination-in",
          maskComposite: "intersect",
          animation: `spark-move ${Number(index) + 1 * 100}s linear infinite`,
        }}
      /> */}
      <div
        className="flex items-center justify-between gap-2 bg-card 
             border border-foreground/10 rounded-full px-4 py-3 text-foreground 
             group transition-all hover:border-foreground/10 hover:bg-card/10 duration-500 ease-in-out"
      >
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

        <span
          className={`w-6 text-sm ${
            task.isDone
              ? getPriorityClassByPrefix(task.priority)
              : "text-muted-foreground"
          }`}
        >
          {index || (index === 0 && Number(index) + 1)}
        </span>

        <span
          className={`flex-1 text-left text-sm ${
            task.isDone
              ? "text-accent font-medium"
              : `${getPriorityClassByPrefix(task.priority)} opacity-70`
          }`}
        >
          {task.title}
        </span>

        <button className="p-1 hover:text-foreground transition flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-muted-foreground" />
          {children}
        </button>

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
