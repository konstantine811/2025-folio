import { Items, Priority } from "@/types/drag-and-drop.model";
import {
  defaultDropAnimationSideEffects,
  DropAnimation,
  UniqueIdentifier,
} from "@dnd-kit/core";

export enum PriorityPrefixClass {
  text = "text",
  border = "border",
  from = "from",
}

export const findContainer = (id: UniqueIdentifier, items: Items) => {
  return items.find((cat) => cat.tasks.some((t) => t.id === id))?.id;
};

export const getIndex = (id: UniqueIdentifier, items: Items) => {
  const container = items.find((cat) => cat.tasks.some((t) => t.id === id));

  if (!container) {
    return -1;
  }

  return container.tasks.findIndex((t) => t.id === id);
};

export function getColor(id: UniqueIdentifier) {
  switch (String(id)[0]) {
    case "A":
      return "#7193f1";
    case "B":
      return "#ffda6c";
    case "C":
      return "#00bcd4";
    case "D":
      return "#ef769f";
  }

  return undefined;
}

export function getPriorityClassByPrefix(
  priority: Priority,
  type: PriorityPrefixClass = PriorityPrefixClass.text
) {
  switch (priority) {
    case Priority.HIGH:
      return `${type}-destructive`;
    case Priority.MEDIUM:
      return `${type}-yellow-200`;
    case Priority.LOW:
      return `${type}-primary`;
    default:
      return "";
  }
}

export function getPriorityBorderClass(priority: Priority) {
  switch (priority) {
    case Priority.HIGH:
      return "border-destructive";
    case Priority.MEDIUM:
      return "border-yellow-200";
    case Priority.LOW:
      return "border-primary";
    default:
      return "";
  }
}

export const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};
