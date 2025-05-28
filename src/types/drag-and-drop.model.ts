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
}

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

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
