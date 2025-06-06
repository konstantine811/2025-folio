import { ANALYTICS_PERIODS } from "@/config/task-analytics.config";
import { DayNumber, ItemTask, Priority } from "../drag-and-drop.model";
import { UniqueIdentifier } from "@dnd-kit/core";

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

export type TaskAnalyticsIdEntity = {
  [id: UniqueIdentifier]: TaskAnalyticsData;
};

export type CategoryAnalyticsNameEntity = {
  [id: string]: CategoryAnalyticsData;
};

export interface TaskAnalyticsData {
  title: string;
  time: number;
  timeDone: number;
  category: string;
  isDone: boolean;
  priority: Priority;
}

export interface CategoryAnalyticsData {
  time: number;
  countDone: number;
  countDoneTime: number;
  taskDone: string[];
  taskNoDone: string[];
}
export type TaskAnalyticsBarOrientation = "vertical" | "horizontal";
