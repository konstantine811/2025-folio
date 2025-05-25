import { GetItemStyles, Items } from "@/types/drag-and-drop.model";
import { UniqueIdentifier } from "@dnd-kit/core";

import { getColor, getIndex } from "./utils/dnd.utils";
import { Item, RenderItemProps } from "./item";
import { Container } from "./container";

const ContainerDragOverlay = ({
  containerId,
  items,
  getItemStyles,
  handle,
  renderItem,
  columns,
}: {
  containerId: UniqueIdentifier;
  items: Items;
  getItemStyles: GetItemStyles;
  handle?: boolean;
  renderItem?: (args: RenderItemProps) => React.ReactElement;
  columns?: number;
}) => {
  const category = items.find((cat) => cat.id === containerId);

  if (!category) return null;

  return (
    <Container
      label={category.id.toString()}
      columns={columns}
      style={{ height: "100%" }}
    >
      {category.tasks.map((task) => (
        <Item
          key={task.id}
          value={task.id}
          task={task}
          handle={handle}
          style={getItemStyles({
            containerId: category.id,
            overIndex: -1,
            index: getIndex(task.id, items),
            value: task.id,
            isDragging: false,
            isSorting: false,
            isDragOverlay: false,
          })}
          color={getColor(task.id)}
          renderItem={renderItem}
        />
      ))}
    </Container>
  );
};

export default ContainerDragOverlay;
