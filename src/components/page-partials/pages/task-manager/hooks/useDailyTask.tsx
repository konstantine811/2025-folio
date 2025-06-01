import { createContext, useContext } from "react";
import { ItemTask, ItemTaskCategory } from "@/types/drag-and-drop.model";
import { UniqueIdentifier } from "@dnd-kit/core";

export const DailyTaskContext = createContext<{
  plannedTasks: ItemTaskCategory[] | null;
  updatePlannedTask: (task: ItemTask) => void;
  deletePlannedTask: (taskId: UniqueIdentifier) => void; // 🆕
  addPlannedTask?: (newTask: ItemTaskCategory) => void; // 🆕
}>({
  plannedTasks: null,
  updatePlannedTask: () => {},
  deletePlannedTask: () => {}, // 🆕
  addPlannedTask: () => {}, // 🆕
});

export const useDailyTaskContext = () => useContext(DailyTaskContext);
