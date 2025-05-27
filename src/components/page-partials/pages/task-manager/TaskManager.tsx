import { MultipleContainers } from "./dnd/multiple-container";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import TaskTimer from "./dnd/task-timer";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";

const TaskManager = () => {
  const sH = useHeaderSizeStore((s) => s.size);
  return (
    <div className="min-h-screen">
      <h1 className="text-foreground text-9xl">Task Manager page</h1>
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
        />
      </div>
    </div>
  );
};

export default TaskManager;
