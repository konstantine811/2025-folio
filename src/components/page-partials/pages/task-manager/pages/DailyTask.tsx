import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import DailyRightDrawer from "../daily-components/daily-right-drawer";

import DailyTaskWrapper from "../daily-components/daily-task-wrapper";
import { useOutletContext, useParams } from "react-router";
import { TaskManagerOutletContext } from "../TaskManager";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import DailySidePanelWrapper from "../daily-components/daily-side-panel-wrapper";
import { useCallback, useEffect, useState } from "react";
import {
  loadDailyTasksByDate,
  updatePlannedTasksOnServer,
} from "@/services/firebase/taskManagerData";
import { FirebaseCollection } from "@/config/firebase.config";
import { ItemTask, ItemTaskCategory } from "@/types/drag-and-drop.model";
import { DailyTaskContext } from "../hooks/useDailyTask";
import { isFutureDate } from "@/utils/date.util";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useTranslation } from "react-i18next";

const DailyTask = () => {
  const mdSize = useIsAdoptive();
  const hS = useHeaderSizeStore((s) => s.size);
  const outletContext = useOutletContext<TaskManagerOutletContext>();
  const [dateVal, setDateVal] = useState<string | undefined>();
  const { id: date } = useParams(); // ← id це твоя дата у форматі "dd.MM.yyyy"
  const [plannedTasks, setPlannedTasks] = useState<ItemTaskCategory[] | null>(
    null
  );
  const [t] = useTranslation();

  useEffect(() => {
    setDateVal(date);
  }, [date]);
  const updatePlannedTask = useCallback(
    (updatedTask: ItemTask) => {
      //
      if (!plannedTasks) return;
      const index = plannedTasks.findIndex(
        (task) => task.id === updatedTask.id
      );
      if (index === -1) return;

      const updated: ItemTaskCategory = {
        ...plannedTasks[index],
        ...updatedTask,
      };

      const newTasks = [...plannedTasks];
      newTasks[index] = updated;
      setPlannedTasks(newTasks);
      if (!date) return;
      updatePlannedTasksOnServer(date, newTasks) // 🔧 реалізуй збереження
        .then(() => {
          // console.info("✅ Task updated on server")
        })
        .catch((err) => console.error("❌ Failed to update task:", err));
    },
    [plannedTasks, date]
  );

  const addPlannedTask = useCallback(
    (newTask: ItemTaskCategory) => {
      if (!plannedTasks || !date) return;

      const existingIndex = plannedTasks.findIndex((t) => t.id === newTask.id);
      let newTasks: ItemTaskCategory[];

      if (existingIndex !== -1) {
        // 🔁 Оновити існуючу
        newTasks = [...plannedTasks];
        newTasks[existingIndex] = newTask;
      } else {
        // ➕ Додати нову
        newTasks = [...plannedTasks, newTask];
      }

      setPlannedTasks(newTasks);
      updatePlannedTasksOnServer(date, newTasks)
        .then(() => {
          // console.info("✅ Task added/updated on server")
        })
        .catch((err) => console.error("❌ Failed to save planned tasks:", err));
    },
    [plannedTasks, date]
  );

  const deletePlannedTask = useCallback(
    (taskId: UniqueIdentifier) => {
      if (!plannedTasks || !date) return;

      const updated = plannedTasks.filter((task) => task.id !== taskId);

      setPlannedTasks(updated);
      updatePlannedTasksOnServer(date, updated)
        .then(() => {
          // console.info("✅ Task deleted on server")
        })
        .catch((err) => console.error("❌ Failed to delete task:", err));
    },
    [plannedTasks, date]
  );

  useEffect(() => {
    if (!date) return;
    if (isFutureDate(date)) {
      setPlannedTasks([]);
      return;
    }
    loadDailyTasksByDate<ItemTaskCategory[]>(
      date,
      FirebaseCollection.plannedTasks
    ).then((data) => {
      setPlannedTasks(data ?? []);
    });
  }, [date]);
  return (
    <DailyTaskContext.Provider
      value={{
        plannedTasks,
        updatePlannedTask,
        deletePlannedTask,
        addPlannedTask,
      }}
    >
      <div
        className="flex w-full"
        style={{ minHeight: `calc(100vh - ${hS}px)` }}
      >
        {/* Ліва колонка */}
        <div className="flex-1" />

        {/* Центральна колонка */}
        <main
          className={`w-full max-w-2xl px-4 flex flex-col justify-center ${outletContext.className}`}
          style={{ minHeight: `calc(100vh - ${hS}px)` }}
        >
          <h2 className="text-center text-foreground/50 text-sm mb-4 mt-2">
            {`${t("task_manager.daily_task_title")} : ${dateVal || ""}`}
          </h2>

          <DailyTaskWrapper />
        </main>

        {/* Права колонка */}
        <div className="flex-1 pt-8">
          {mdSize ? <DailyRightDrawer /> : <DailySidePanelWrapper />}
        </div>
      </div>
    </DailyTaskContext.Provider>
  );
};

export default DailyTask;
