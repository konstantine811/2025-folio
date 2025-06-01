import { UniqueIdentifier } from "@dnd-kit/core";

export interface TaskCategory {
  id: UniqueIdentifier;
  title: string;
  tasks: ItemTask[];
}

export type Items = TaskCategory[]; // <-- нова структура

export interface ItemTask {
  id: UniqueIdentifier;
  title: string;
  isDone: boolean;
  time: number; // запланований час (наприклад "30m", "2h")
  timeDone: number;
  priority: Priority; // фактично витрачено (аналогічно)
  isPlanned?: boolean; // чи заплановано
  whenDo: DayNumber[]; // дні тижня, коли планується виконання
  isDetermined?: boolean; // чи заплановано час виконання
}

export interface NormalizedTask extends ItemTask {
  categoryId: string;
  categoryTitle: string;
}

export interface ItemTaskCategory extends ItemTask {
  categoryName: string;
}

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export type DayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface GetItemStylesArgs {
  value: UniqueIdentifier;
  index: number;
  overIndex: number;
  isDragging: boolean;
  containerId: UniqueIdentifier;
  isSorting: boolean;
  isDragOverlay: boolean;
}

export type GetItemStyles = (args: GetItemStylesArgs) => React.CSSProperties;
