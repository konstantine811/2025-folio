import { useEffect, useState } from "react";
import DailyAddTemplateButton from "../daily-components/daily-add-button";
import DialogFeatureTask from "./dialog-task";
import { ItemTaskCategory } from "@/types/drag-and-drop.model";
import TaskFutureTimeline from "./task-future-timeline";
import {
  loadDailyTasksByDate,
  saveDailyTasks,
} from "@/services/firebase/taskManagerData";
import { FirebaseCollection } from "@/config/firebase.config";
import Preloader from "@/components/page-partials/preloader/preloader";

const AddFutureTask = ({ date }: { date: string | undefined }) => {
  const [isOpoenDialog, setIsOpenDialog] = useState(false);
  const [categoryTasks, setCategoryTasks] = useState<ItemTaskCategory[]>([]);
  const [editTask, setEditTask] = useState<ItemTaskCategory | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const handleAddTask = () => {
    setIsOpenDialog(true);
  };

  useEffect(() => {
    setIsLoaded(false);
    if (date) {
      loadDailyTasksByDate<ItemTaskCategory[]>(
        date,
        FirebaseCollection.plannedTasks
      ).then((tasks) => {
        if (tasks && tasks.length) {
          setCategoryTasks(tasks);
        } else {
          setCategoryTasks([]); // 🔄 Явно вказати порожній масив
        }
        setIsLoaded(true);
      });
    }
  }, [date]);

  useEffect(() => {
    if (!date || !isLoaded) return;
    saveDailyTasks<ItemTaskCategory[]>(
      categoryTasks,
      date,
      FirebaseCollection.plannedTasks
    );
  }, [categoryTasks, date, isLoaded]);
  return (
    <>
      {isLoaded ? (
        <div className="flex flex-col gap-4">
          <DailyAddTemplateButton
            title={"task_manager.add"}
            onClick={handleAddTask}
          />
          <DialogFeatureTask
            isOpen={isOpoenDialog}
            setOpen={setIsOpenDialog}
            task={editTask}
            onChangeTask={(task, categoryName) => {
              const categoryTask: ItemTaskCategory = {
                ...task,
                categoryName: categoryName,
              };
              setIsOpenDialog(false);
              setEditTask(null);
              setCategoryTasks((prev) => {
                const index = prev.findIndex((t) => t.id === categoryTask.id);
                if (index !== -1) {
                  // Заміна існуючої
                  const updated = [...prev];
                  updated[index] = categoryTask;
                  return updated;
                }
                // Додавання нової
                return [...prev, categoryTask];
              });
            }}
          />
          {categoryTasks.length > 0 && (
            <TaskFutureTimeline
              tasks={categoryTasks}
              setCategoryTasks={setCategoryTasks}
              onEditTask={(task) => {
                setEditTask(task);
                setIsOpenDialog(true);
              }}
            />
          )}
        </div>
      ) : (
        <Preloader />
      )}
    </>
  );
};

export default AddFutureTask;
