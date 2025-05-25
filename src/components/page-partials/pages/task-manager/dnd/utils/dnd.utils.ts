import { Items } from "@/types/drag-and-drop.model";
import {
  defaultDropAnimationSideEffects,
  DropAnimation,
  UniqueIdentifier,
} from "@dnd-kit/core";

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

export const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};
