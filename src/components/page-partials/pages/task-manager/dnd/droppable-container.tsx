import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from "@dnd-kit/sortable";
import { Container, Props } from "./container";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";
import { Items, ItemTask, Priority } from "@/types/drag-and-drop.model";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

function DroppableContainer({
  children,
  columns = 1,
  disabled,
  id,
  items,
  setItems,
  onValueChange,
  style,
  ...props
}: Props & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: ItemTask[];
  style?: React.CSSProperties;
  setItems?: React.Dispatch<React.SetStateAction<Items>>;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: "container",
      children: items.map((task) => task.id),
    },
    animateLayoutChanges,
  });

  const handleAddTask = () => {
    if (!setItems) return;

    const newTask: ItemTask = {
      id: `${id}-${Date.now()}`,
      title: `Нова задача`,
      isDone: false,
      time: "30m",
      timeDone: "0m",
      priority: Priority.MEDIUM,
    };

    setItems((prev) =>
      prev.map((category) =>
        category.id === id
          ? { ...category, tasks: [...category.tasks, newTask] }
          : category
      )
    );
  };

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      onValueChange={onValueChange}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      {...props}
    >
      <ul>{children}</ul>

      {/* Add task button */}
      <div className="pt-2">
        <button
          onClick={handleAddTask}
          className="text-sm text-blue-500 hover:underline"
        >
          + Add task
        </button>
      </div>
    </Container>
  );
}

export default DroppableContainer;
