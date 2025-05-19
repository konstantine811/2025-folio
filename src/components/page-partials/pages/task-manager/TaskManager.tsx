import { TasksWithCategories } from "./Board";

const TaskManager = () => {
  return (
    <div className="min-h-screen">
      <h1 className="text-foreground text-9xl">Task Manager page</h1>
      <TasksWithCategories />
    </div>
  );
};

export default TaskManager;
