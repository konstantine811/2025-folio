import { MultipleContainers } from "@/components/dnd/multiple-container";
import Preloader from "@/components/page-partials/preloader/preloader";
import {
  loadTemplateTasks,
  saveTemplateTasks,
} from "@/services/firebase/taskManagerData";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { Items } from "@/types/drag-and-drop.model";
import { cn } from "@/utils/classname";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { TaskManagerOutletContext } from "../TaskManager";
import { TaskManagerProvider } from "@/components/dnd/context/task-manager-context";
import { useTranslation } from "react-i18next";

const TemplateTask = () => {
  const outletContext = useOutletContext<TaskManagerOutletContext>();
  const [dailyTasks, setDailyTasks] = useState<Items>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const hS = useHeaderSizeStore((s) => s.size);
  const [t] = useTranslation();
  useEffect(() => {
    setIsLoaded(true);
    loadTemplateTasks()
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
    <div
      className={`${cn(
        `px-2 flex flex-col justify-center ${outletContext.className}`
      )}`}
      style={{ minHeight: `calc(100vh - ${hS}px)` }}
    >
      {!isLoaded ? (
        <div className="max-w-2xl w-full m-auto">
          <h2 className="text-center text-foreground/50 text-sm mb-4 mt-2">
            {t("task_manager.template_daily_task_title")}
          </h2>
          <TaskManagerProvider>
            <MultipleContainers
              strategy={rectSortingStrategy}
              vertical
              trashable
              templated={true}
              items={dailyTasks}
              onChangeTasks={(tasks) => {
                saveTemplateTasks(tasks);
              }}
            />
          </TaskManagerProvider>
        </div>
      ) : (
        <Preloader />
      )}
    </div>
  );
};

export default TemplateTask;
