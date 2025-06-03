import { DayNumber, ItemTask } from "../drag-and-drop.model";

export type WeekTaskEntity = {
  [key in DayNumber]?: WeekTaskData;
};

export interface WeekTaskData {
  totalTime: number;
  categories: string[];
  tasks: ItemTask[];
}

export interface FlattenedTask {
  day: number;
  title: string;
  duration: number;
}

export type StackedDay = {
  day: number;
  [title: string]: string | number; // ключ — назва задачі
};

export type TaskAnalytics = {
  weekTaskEntity: WeekTaskEntity;
  flattenTasks: FlattenedTask[];
};
