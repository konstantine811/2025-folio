import { rectSortingStrategy } from "@dnd-kit/sortable";
import { MultipleContainers } from "@/components/dnd/multiple-container";
import {
  loadDailyTasks,
  saveDailyTasks,
} from "@/services/firebase/taskManagerData";
import { useEffect, useState } from "react";
import { Items } from "@/types/drag-and-drop.model";
import Preloader from "../../preloader/preloader";

const TaskManager = () => {
  const [dailyTasks, setDailyTasks] = useState<Items>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    loadDailyTasks()
      .then((tasks) => {
        if (tasks) {
          setDailyTasks(tasks);
        } else {
          setDailyTasks([]); // 🔄 Явно вказати порожній масив
        }
        setIsLoaded(false);
      })
      .catch((error) => {
        console.error("Error loading tasks:", error);
        setIsLoaded(false);
      });
  }, []);

  return (
    <div className="px-2">
      {/* <TasksWithCategories />
      <TaskTree /> */}
      {!isLoaded ? (
        <div className="max-w-2xl m-auto">
          <MultipleContainers
            strategy={rectSortingStrategy}
            vertical
            trashable
            templated={true}
            items={dailyTasks}
            onChangeTasks={(tasks) => {
              saveDailyTasks(tasks);
            }}
          />
        </div>
      ) : (
        <Preloader />
      )}
    </div>
  );
};

export default TaskManager;
