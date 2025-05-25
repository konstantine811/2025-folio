import { MultipleContainers } from "./dnd/multiple-container";
import { rectSortingStrategy } from "@dnd-kit/sortable";

const TaskManager = () => {
  return (
    <div className="min-h-screen">
      <h1 className="text-foreground text-9xl">Task Manager page</h1>
      {/* <TasksWithCategories />
      <TaskTree /> */}
      <div className="max-w-2xl m-auto">
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
