import { ItemTaskCategory } from "@/types/drag-and-drop.model";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { Settings2, Trash2 } from "lucide-react";
import { getPriorityClassByPrefix } from "@/components/dnd/utils/dnd.utils";
import WrapperHoverElement from "@/components/ui-abc/wrapper-hover-element";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function TaskItemFuture({
  task,
  onEditTask,
  onDelete,
}: {
  index?: number | string;
  task: ItemTaskCategory;
  onEditTask?: () => void;
  onDelete?: () => void;
}) {
  const hasLongWord = task.title.split(" ").some((word) => word.length > 40); // можна змінити 20 на поріг
  const [t] = useTranslation();
  return (
    <div className={`relative group rounded-xl border mt-6`}>
      <h6 className="absolute -top-5 left-5 bg-accent/30 backdrop-blur-sm px-3 rounded-full border border-foreground/10">
        {t(task.categoryName)}
      </h6>
      <div
        className="flex items-center justify-between gap-0 md:gap-2 py-2 bg-card 
             border border-foreground/10 rounded-xl px-4 text-foreground 
             group transition-all hover:border-foreground/10 hover:bg-background duration-500 ease-in-out"
      >
        <p
          className={`flex-1 text-left text-sm ${hasLongWord && "truncate"} ${
            task.isDone
              ? "text-accent font-medium"
              : `${getPriorityClassByPrefix(task.priority)}`
          }`}
          style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
          title={hasLongWord ? task.title : ""}
        >
          {task.title}
        </p>

        <div className="flex items-center ">
          <WrapperHoverElement className="flex items-center">
            {onEditTask && (
              <SoundHoverElement
                animValue={0.99}
                hoverTypeElement={SoundTypeElement.SELECT}
                hoverStyleElement={HoverStyleElement.quad}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onEditTask();
                  }}
                  className={`hover:bg-accent/50 hover:text-foreground text-muted-foreground/30`}
                >
                  <Settings2 className="w-4 h-4" />
                </Button>
              </SoundHoverElement>
            )}
            {onDelete && (
              <SoundHoverElement
                animValue={0.99}
                hoverTypeElement={SoundTypeElement.SELECT}
                hoverStyleElement={HoverStyleElement.quad}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onDelete();
                  }}
                  className={`hover:bg-accent/50 hover:text-foreground text-muted-foreground/30`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </SoundHoverElement>
            )}
          </WrapperHoverElement>
        </div>
      </div>
    </div>
  );
}
