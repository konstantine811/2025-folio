import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import WrapperHoverElement from "@/components/ui-abc/wrapper-hover-element";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NormalizedTask } from "@/types/drag-and-drop.model";
import { HoverStyleElement } from "@/types/sound";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

const DailyAddAnotherTask = ({
  tasks,
  onAddTask,
}: {
  tasks: NormalizedTask[];
  onAddTask: (task: NormalizedTask) => void;
}) => {
  const [t] = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <WrapperHoverElement>
            <SoundHoverElement
              animValue={1}
              hoverStyleElement={HoverStyleElement.quad}
            >
              <Button
                variant="outline"
                className="w-full hover:bg-background border-muted-foreground/50 border-1 hover:text-accent"
                size="sm"
              >
                <Plus /> {t("task_manager.add_all_tasks.header.title")}
              </Button>
            </SoundHoverElement>
          </WrapperHoverElement>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 border-foreground/30 relative pt-0">
        <div className="sticky top-0 bg-background z-10 pt-2">
          <DropdownMenuLabel className="text-muted-foreground">
            {t("task_manager.add_all_tasks.header.description")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-foreground/30" />
        </div>
        {tasks.map((task, index) => {
          return (
            <DropdownMenuCheckboxItem
              key={task.id}
              className="px-2"
              onCheckedChange={() => {
                onAddTask(task);
              }}
            >
              <span>{index + 1}.</span>
              {task.title}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DailyAddAnotherTask;
