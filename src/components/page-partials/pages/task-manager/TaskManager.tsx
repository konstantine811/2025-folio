import { rectSortingStrategy } from "@dnd-kit/sortable";

import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import TaskTimer from "@/components/dnd/task-timer";
import { MultipleContainers } from "@/components/dnd/multiple-container";

const TaskManager = () => {
  const sH = useHeaderSizeStore((s) => s.size);
  return (
    <div className="min-h-screen px-2">
      {/* <TasksWithCategories />
      <TaskTree /> */}
      <div className="max-w-2xl m-auto">
        <div
          style={{ top: sH }}
          className="sticky flex justify-center items-center z-50  py-5 bg-background/50 backdrop-blur-xs"
        >
          <TaskTimer />
        </div>
        <MultipleContainers
          itemCount={5}
          strategy={rectSortingStrategy}
          vertical
          trashable
        />
      </div>
    </div>
  );
};

export default TaskManager;
