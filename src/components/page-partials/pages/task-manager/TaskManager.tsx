import { MultipleContainers } from "./dnd/MultipleContainer";
import { rectSortingStrategy } from "@dnd-kit/sortable";

const TaskManager = () => {
  return (
    <div className="min-h-screen">
      <h1 className="text-foreground text-9xl">Task Manager page</h1>
      {/* <TasksWithCategories />
      <TaskTree /> */}
      <MultipleContainers
        itemCount={5}
        strategy={rectSortingStrategy}
        vertical
      />
    </div>
  );
};

export default TaskManager;
