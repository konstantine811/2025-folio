import { useSortable } from "@dnd-kit/sortable";
import { getColor } from "./utils/dnd.utils";
import { Item, RenderItemProps } from "./item";
import { UniqueIdentifier } from "@dnd-kit/core";
import { Items, ItemTask, Priority } from "@/types/drag-and-drop.model";

interface SortableItemProps {
  containerId: UniqueIdentifier;
  id: UniqueIdentifier;
  index: number;
  handle: boolean;
  disabled?: boolean;
  style(args: {
    index: number;
    value: UniqueIdentifier;
    isDragging: boolean;
    isSorting: boolean;
    overIndex: number;
    containerId: UniqueIdentifier;
  }): React.CSSProperties;
  getIndex(id: UniqueIdentifier, items: Items): number;
  renderItem?: (args: RenderItemProps) => React.ReactElement;
  wrapperStyle({ index }: { index: number }): React.CSSProperties;
  items: Items;
  task: ItemTask;
  onToggle?: (id: UniqueIdentifier, value: boolean) => void;
  onChangeTask: (
    id: UniqueIdentifier,
    title: string,
    priority: Priority,
    time: number,
    wastedTime: number
  ) => void;
}

function SortableItem({
  disabled,
  id,
  index,
  handle,
  renderItem,
  style,
  containerId,
  getIndex,
  items,
  onToggle,
  task,
  onChangeTask,
}: SortableItemProps) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
    transform,
    transition,
  } = useSortable({
    id,
  });

  return (
    <Item
      ref={disabled ? undefined : setNodeRef}
      value={task.title}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
      index={index}
      onToggle={onToggle}
      style={style({
        index,
        value: id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id, items) : overIndex,
        containerId,
      })}
      color={getColor(id)}
      transition={transition}
      transform={transform}
      listeners={listeners}
      renderItem={renderItem}
      task={task}
      onChangeTask={onChangeTask}
    />
  );
}

export default SortableItem;
