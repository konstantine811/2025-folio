import { GetItemStyles, Items } from "@/types/drag-and-drop.model";
import { Item, RenderItemProps } from "./item";
import { findContainer, getColor, getIndex } from "./utils/dnd.utils";
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
  return (
    <Item
      value={id}
      handle={handle}
      style={getItemStyles({
        containerId: findContainer(id, items) as UniqueIdentifier,
        overIndex: -1,
        index: getIndex(id, items),
        value: id,
        isSorting: true,
        isDragging: true,
        isDragOverlay: true,
      })}
      color={getColor(id)}
      renderItem={renderItem}
      dragOverlay
    />
  );
};

export default SortableItemDragOverlay;
