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

const DailyTask = () => {
  const mdSize = useIsAdoptive();
  const hS = useHeaderSizeStore((s) => s.size);
  const outletContext = useOutletContext<TaskManagerOutletContext>();
  const { id: date } = useParams(); // ← id це твоя дата у форматі "dd.MM.yyyy"
  const [plannedTasks, setPlannedTasks] = useState<ItemTaskCategory[] | null>(
    null
  );

  const updatePlannedTask = useCallback(
    (updatedTask: ItemTask) => {
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

  const deletePlannedTask = useCallback(
    (taskId: UniqueIdentifier) => {
      if (!plannedTasks || !date) return;

      const updated = plannedTasks.filter((task) => task.id !== taskId);

      setPlannedTasks(updated);
      updatePlannedTasksOnServer(date, updated)
        .then(() => console.log("🗑️ Task deleted on server"))
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
