import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from "@dnd-kit/sortable";
import { Container, Props } from "./container";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";
import { Items, ItemTask, Priority } from "@/types/drag-and-drop.model";
import DialogCreateTask from "./dialog-create-task";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

function DroppableContainer({
  children,
  columns = 1,
  disabled,
  id,
  items,
  setItems,
  placeholder,
  setContainers,
  style,
  ...props
}: Props & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: ItemTask[];
  style?: React.CSSProperties;
  setItems?: React.Dispatch<React.SetStateAction<Items>>;
  setContainers?: React.Dispatch<React.SetStateAction<UniqueIdentifier[]>>;
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

  const handleChangeCategory = (value: string) => {
    console.log("handleChangeCategory", value);
    if (!setItems || !setContainers) return;
    setItems((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, title: value } : cat))
    );
    setContainers((prev) =>
      prev.map(
        (containerId) => (id === id ? id : containerId) // ❗️не міняємо ID, просто оновили title вже в items
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
      onValueChange={handleChangeCategory}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      columns={columns}
      {...props}
    >
      <ul>{children}</ul>

      {/* Add task button */}
      {!placeholder && <DialogCreateTask />}
    </Container>
  );
}

export default DroppableContainer;
