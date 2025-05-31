import { ItemTaskCategory } from "@/types/drag-and-drop.model";
import { TaskItemFuture } from "./task-item-future";
import { Dispatch, SetStateAction } from "react";
import { paresSecondToTime } from "@/utils/time.util";
import {
  getPriorityClassBg,
  getPriorityClassForegroundText,
} from "@/components/dnd/utils/dnd.utils";

const TaskFutureTimeline = ({
  tasks,
  setCategoryTasks,
  onEditTask,
}: {
  tasks: ItemTaskCategory[];
  setCategoryTasks: Dispatch<SetStateAction<ItemTaskCategory[]>>;
  onEditTask: (task: ItemTaskCategory) => void;
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
                  onEditTask={() => onEditTask(task)}
                  onDelete={() =>
                    setCategoryTasks((prev) =>
                      prev.filter((t) => t.id !== task.id)
                    )
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
