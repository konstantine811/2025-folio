import { ANALYTICS_PERIODS } from "@/config/task-analytics.config";
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

export type ItemTimeMap = {
  [title: string]: number; // ключ — назва категорії
};

export type StackedDay = {
  day: number;
  [title: string]: string | number; // ключ — назва задачі
};

export type TaskAnalytics = {
  weekTaskEntity: WeekTaskEntity;
  flattenTasks: FlattenedTask[];
};

export enum ItemTimeMapKeys {
  category = "category",
  task = "task",
}

export enum TemplateTypeChart {
  timeCount = "timeCount",
  category = ItemTimeMapKeys.category,
  task = ItemTimeMapKeys.task,
}

export type TypeAnalyticsPeriod = (typeof ANALYTICS_PERIODS)[number];
