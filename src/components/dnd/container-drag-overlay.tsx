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
  templated,
}: {
  containerId: UniqueIdentifier;
  items: Items;
  getItemStyles: GetItemStyles;
  handle?: boolean;
  renderItem?: (args: RenderItemProps) => React.ReactElement;
  columns?: number;
  templated: boolean;
}) => {
  const category = items.find((cat) => cat.id === containerId);

  if (!category) return null;

  return (
    <Container
      label={
        items.find((cat) => cat.id === containerId)?.title ??
        containerId.toString()
      }
      columns={columns}
      style={{ height: "100%" }}
    >
      {items
        .find((cat) => cat.id === containerId)
        ?.tasks.map((task) => (
          <Item
            key={task.id}
            value={task.id}
            handle={handle}
            templated={templated}
            style={getItemStyles({
              containerId,
              overIndex: -1,
              index: getIndex(task.id, items),
              value: task.id,
              isDragging: false,
              isSorting: false,
              isDragOverlay: false,
            })}
            color={getColor(task.id)}
            renderItem={renderItem}
            task={task}
          />
        ))}
    </Container>
  );
};

export default ContainerDragOverlay;
