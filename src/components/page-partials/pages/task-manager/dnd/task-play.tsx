import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { Button } from "@/components/ui/button";
import { useTaskManagerStore } from "@/storage/task-manager/task-manager";
import { ItemTask } from "@/types/drag-and-drop.model";
import { SoundTypeElement } from "@/types/sound";
import { Pause, Play } from "lucide-react";
import TaskLocalTime from "./task-local-time";
import { useTranslation } from "react-i18next";
import TaskLocalTimeStatic from "./task-local-time-static";

const TaskPlay = ({ task }: { task: ItemTask }) => {
  const playingTask = useTaskManagerStore((s) => s.playingTask);
  const setPlayingTask = useTaskManagerStore((s) => s.setPlayingTask);
  const stopPlayingTask = useTaskManagerStore((s) => s.stopPlayingTask);
  const [t] = useTranslation();

  const isPlaying = playingTask?.id === task.id;

  const handleClick = () => {
    if (isPlaying) {
      stopPlayingTask();
    } else {
      setPlayingTask(task);
    }
  };
  return (
    <div className="flex items-center gap-1">
      <SoundHoverElement hoverTypeElement={SoundTypeElement.LINK}>
        <Button
          size="icon"
          variant="ghost"
          className="hover:bg-card/10 hover:text-foreground"
          onClick={handleClick}
        >
          {isPlaying ? <Pause /> : <Play />}
        </Button>
      </SoundHoverElement>
      <div className="flex flex-col gap-1">
        {isPlaying ? (
          <>
            <TaskLocalTime
              outerTime={task.timeDone}
              isPlay={isPlaying}
              tooltipText={t(
                "task_manager.dialog_create_task.task.time.wasted_time"
              )}
            />
            <TaskLocalTime
              outerTime={task.time - task.timeDone}
              isPlay={isPlaying}
              revert
              tooltipText={t(
                "task_manager.dialog_create_task.task.time.remaining_time"
              )}
            />
          </>
        ) : (
          <>
            <TaskLocalTimeStatic
              timeInSeconds={task.timeDone}
              tooltipText={t(
                "task_manager.dialog_create_task.task.time.wasted_time"
              )}
            />
            <TaskLocalTimeStatic
              timeInSeconds={task.time - task.timeDone}
              revert
              tooltipText={t(
                "task_manager.dialog_create_task.task.time.remaining_time"
              )}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TaskPlay;
