import { createContext, useContext } from "react";
import { ItemTask, ItemTaskCategory } from "@/types/drag-and-drop.model";
import { UniqueIdentifier } from "@dnd-kit/core";

export const DailyTaskContext = createContext<{
  plannedTasks: ItemTaskCategory[] | null;
  updatePlannedTask: (task: ItemTask) => void;
  deletePlannedTask: (taskId: UniqueIdentifier) => void; // 🆕
}>({
  plannedTasks: null,
  updatePlannedTask: () => {},
  deletePlannedTask: () => {}, // 🆕
});

export const useDailyTaskContext = () => useContext(DailyTaskContext);
