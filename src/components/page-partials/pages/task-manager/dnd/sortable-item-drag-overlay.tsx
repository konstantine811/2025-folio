import { GetItemStyles, Items } from "@/types/drag-and-drop.model";
import { Item, RenderItemProps } from "./item";
import { getColor, getIndex } from "./utils/dnd.utils";
import { UniqueIdentifier } from "@dnd-kit/core";

const SortableItemDragOverlay = ({
  id,
  handle,
  getItemStyles,
  items,
  renderItem,
}: {
  id: UniqueIdentifier;
  handle?: boolean;
  getItemStyles: GetItemStyles;
  items: Items;
  renderItem?: (args: RenderItemProps) => React.ReactElement;
  columns?: number;
}) => {
  const container = items.find((cat) => cat.tasks.some((t) => t.id === id));
  const task = container?.tasks.find((t) => t.id === id);

  if (!task || !container) return null;

  return (
    <Item
      task={task} // 🟢 додаємо task
      value={task.id}
      handle={handle}
      style={getItemStyles({
        containerId: container.id,
        overIndex: -1,
        index: getIndex(task.id, items),
        value: task.id,
        isSorting: true,
        isDragging: true,
        isDragOverlay: true,
      })}
      color={getColor(task.id)}
      renderItem={renderItem}
      dragOverlay
    />
  );
};

export default SortableItemDragOverlay;
