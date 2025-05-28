import { rectSortingStrategy } from "@dnd-kit/sortable";
import { MultipleContainers } from "@/components/dnd/multiple-container";

const TaskManager = () => {
  return (
    <div className="px-2">
      {/* <TasksWithCategories />
      <TaskTree /> */}
      <div className="max-w-2xl m-auto">
        <MultipleContainers
          strategy={rectSortingStrategy}
          vertical
          trashable
          templated={false}
          testedCount={5}
        />
      </div>
    </div>
  );
};

export default TaskManager;
