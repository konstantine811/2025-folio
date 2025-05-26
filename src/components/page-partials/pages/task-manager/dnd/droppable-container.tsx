import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from "@dnd-kit/sortable";
import { Container, Props } from "./container";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";
import { Items, ItemTask, Priority } from "@/types/drag-and-drop.model";
import DialogCreateTask from "./dialog-task";

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

  const handleAddTask = (
    title: string,
    priority: Priority,
    time: number,
    wastedTime: number
  ) => {
    if (!setItems) return;

    const newTask: ItemTask = {
      id: `${id}-${Date.now()}`,
      title,
      isDone: false,
      time,
      timeDone: wastedTime,
      priority,
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
      <ul className="flex flex-col gap-1">{children}</ul>

      {/* Add task button */}
      {!placeholder && (
        <DialogCreateTask
          onChangeTask={(title, prioriy, time, wastedTime) => {
            handleAddTask(title, prioriy, time, wastedTime);
          }}
        />
      )}
    </Container>
  );
}

export default DroppableContainer;
