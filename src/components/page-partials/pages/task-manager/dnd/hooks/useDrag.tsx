import { Active, Over, UniqueIdentifier } from "@dnd-kit/core";
import { TRASH_ID } from "../config/dnd.config";
import { Items } from "@/types/drag-and-drop.model";
import { arrayMove } from "@dnd-kit/sortable";
import { unstable_batchedUpdates } from "react-dom";
import { useState } from "react";
import { useHoverStore } from "@/storage/hoverStore";
import { HoverStyleElement } from "@/types/sound";

const useDrag = ({
  items,
  setItems,
  recentlyMovedToNewContainer,
  setContainers,
  setActiveId,
}: {
  items: Items;
  setItems: React.Dispatch<React.SetStateAction<Items>>;
  recentlyMovedToNewContainer: React.RefObject<boolean>;
  setContainers: React.Dispatch<React.SetStateAction<UniqueIdentifier[]>>;
  setActiveId: React.Dispatch<React.SetStateAction<UniqueIdentifier | null>>;
  activeId: UniqueIdentifier | null;
}) => {
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const setHover = useHoverStore((s) => s.setHover);

  function handleAddColumn() {
    const newContainerId = getNextContainerId();
    unstable_batchedUpdates(() => {
      setContainers((containers) => [...containers, newContainerId]);
      setItems((items) => [
        ...items,
        {
          id: newContainerId,
          title: newContainerId,
          tasks: [],
        },
      ]);
    });
  }

  function getNextContainerId() {
    const containerIds = items.map((cat) => cat.id);
    const lastContainerId = containerIds[containerIds.length - 1];
    return String.fromCharCode((lastContainerId as string).charCodeAt(0) + 1);
  }

  function handleRemove(containerID: UniqueIdentifier) {
    setContainers((containers) =>
      containers.filter((id) => id !== containerID)
    );
    setItems((items) => items.filter((cat) => cat.id !== containerID));
  }

  const onDragStart = (active: Active) => {
    setActiveId(active.id);
    setClonedItems(items);
  };

  const onDragOver = (active: Active, over: Over | null) => {
    const overId = over?.id;
    if (!overId || overId === TRASH_ID) return;

    const overCategory = items.find((cat) =>
      cat.tasks.some((t) => t.id === overId)
    );
    const activeCategory = items.find((cat) =>
      cat.tasks.some((t) => t.id === active.id)
    );

    if (
      !overCategory ||
      !activeCategory ||
      overCategory.id === activeCategory.id
    )
      return;

    const activeItemIndex = activeCategory.tasks.findIndex(
      (t) => t.id === active.id
    );
    const overItemIndex = overCategory.tasks.findIndex((t) => t.id === overId);

    const activeTask = activeCategory.tasks[activeItemIndex];

    recentlyMovedToNewContainer.current = true;

    setItems((prev) =>
      prev.map((cat) => {
        if (cat.id === activeCategory.id) {
          return {
            ...cat,
            tasks: cat.tasks.filter((t) => t.id !== active.id),
          };
        }
        if (cat.id === overCategory.id) {
          const newIndex =
            overItemIndex >= 0 ? overItemIndex + 1 : cat.tasks.length;
          return {
            ...cat,
            tasks: [
              ...cat.tasks.slice(0, newIndex),
              activeTask,
              ...cat.tasks.slice(newIndex),
            ],
          };
        }
        return cat;
      })
    );
  };

  const onDragEnd = (active: Active, over: Over | null) => {
    const isDraggingCategory = items.some((cat) => cat.id === active.id);
    const isOverCategory = over && items.some((cat) => cat.id === over.id);

    // 🟡 Якщо це переміщення категорії
    if (isDraggingCategory && isOverCategory && over) {
      const oldIndex = items.findIndex((cat) => cat.id === active.id);
      const newIndex = items.findIndex((cat) => cat.id === over.id);

      if (oldIndex !== newIndex) {
        setItems((prev) => arrayMove(prev, oldIndex, newIndex));
      }

      setActiveId(null);
      return;
    }

    const activeCategory = items.find((cat) =>
      cat.tasks.some((t) => t.id === active.id)
    );
    const overCategory = over
      ? items.find((cat) => cat.tasks.some((t) => t.id === over.id))
      : null;

    if (over?.id === TRASH_ID && activeCategory) {
      setItems((prev) =>
        prev.map((cat) =>
          cat.id === activeCategory.id
            ? { ...cat, tasks: cat.tasks.filter((t) => t.id !== active.id) }
            : cat
        )
      );
      setActiveId(null);
      return;
    }

    if (!over || !activeCategory || !overCategory) {
      setActiveId(null);
      return;
    }

    if (activeCategory.id === overCategory.id) {
      const activeIndex = activeCategory.tasks.findIndex(
        (t) => t.id === active.id
      );
      const overIndex = overCategory.tasks.findIndex((t) => t.id === over.id);

      if (activeIndex !== overIndex) {
        setItems((prev) =>
          prev.map((cat) =>
            cat.id === activeCategory.id
              ? {
                  ...cat,
                  tasks: arrayMove(cat.tasks, activeIndex, overIndex),
                }
              : cat
          )
        );
      }
    }

    setHover(false, null, HoverStyleElement.circle);
    setActiveId(null);
  };

  const onDragCancel = () => {
    if (clonedItems) {
      setItems(clonedItems);
    }
    setActiveId(null);
    setClonedItems(null);
  };

  return {
    onDragOver,
    onDragEnd,
    handleAddColumn,
    getNextContainerId,
    onDragCancel,
    onDragStart,
    handleRemove,
  };
};

export default useDrag;
