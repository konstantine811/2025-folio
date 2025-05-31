import { ItemTaskCategory } from "@/types/drag-and-drop.model";
import { TaskItemFuture } from "./task-item-future";
import { paresSecondToTime } from "@/utils/time.util";
import {
  getPriorityClassBg,
  getPriorityClassForegroundText,
} from "@/components/dnd/utils/dnd.utils";

const TaskFutureTimeline = ({
  tasks,
  onEditTask,
  onDeleteTask,
}: {
  tasks: ItemTaskCategory[];
  onEditTask?: (task: ItemTaskCategory) => void;
  onDeleteTask?: (id: string) => void;
}) => {
  const sortedTasks = [...tasks].sort((a, b) => a.time - b.time);
  return (
    <>
      <ul className="flex flex-col items-center space-y-6 relative">
        {sortedTasks.map((task) => {
          const { hours, minutes } = paresSecondToTime(task.time);
          return (
            <li
              key={task.id}
              className="relative flex items-center w-full gap-3"
            >
              {/* Кружечок */}
              <div className="flex flex-col items-center mt-5 relative z-10">
                <div
                  className={`py-0 px-2 rounded-full border-2 border-accent ${getPriorityClassBg(
                    task.priority
                  )}`}
                >
                  <span
                    className={`text-sm ${getPriorityClassForegroundText(
                      task.priority
                    )}`}
                  >
                    {hours}:{minutes.padStart(2, "0")}
                  </span>
                </div>
                {/* Лінія вниз якщо не останній */}
              </div>
              {/* Контент задачі */}
              <div className="flex-1 relative z-10">
                <TaskItemFuture
                  task={task}
                  onEditTask={onEditTask ? () => onEditTask(task) : undefined}
                  onDelete={
                    onDeleteTask ? () => onDeleteTask(task.id) : undefined
                  }
                />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default TaskFutureTimeline;
