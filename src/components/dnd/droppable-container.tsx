import {
  AnimateLayoutChanges,
  defaultAnimateLayoutChanges,
  useSortable,
} from "@dnd-kit/sortable";
import { Container, Props } from "./container";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";
import { Items, ItemTask } from "@/types/drag-and-drop.model";
import WrapperHoverElement from "../ui-abc/wrapper-hover-element";
import SoundHoverElement from "../ui-abc/sound-hover-element";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Progress } from "../ui/progress";

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
  onAddTask,
  style,
  options,
  templated,
  ...props
}: Props & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: ItemTask[];
  options: string[];
  style?: React.CSSProperties;
  setItems?: React.Dispatch<React.SetStateAction<Items>>;
  setContainers?: React.Dispatch<React.SetStateAction<UniqueIdentifier[]>>;
  onAddTask?: (containerId: UniqueIdentifier) => void;
  templated: boolean;
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

  const [t] = useTranslation();
  const [donePercentage, setDonePercentage] = useState(0);

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

  useEffect(() => {
    const totalTasks = items.length;
    const doneTasks = items.filter((task) => task.isDone).length;
    const donePercentage =
      totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
    setDonePercentage(donePercentage);
  }, [items]);

  return (
    <Container
      options={options}
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
      {items.length > 0 && !templated && (
        <div className="px-4">
          <div className="text-xs text-muted-foreground text-center mt-1">
            {donePercentage}%
          </div>
          <Progress value={donePercentage} />
        </div>
      )}
      <ul className="flex flex-col gap-1">{children}</ul>

      {/* Add task button */}
      {!placeholder && onAddTask && (
        <div className="flex justify-center mt-2">
          <WrapperHoverElement>
            <SoundHoverElement
              animValue={0.99}
              hoverTypeElement={SoundTypeElement.LINK}
              hoverStyleElement={HoverStyleElement.quad}
            >
              <Button
                onClick={() => onAddTask(id)}
                variant="link"
                className="cursor-pointer"
              >
                {t("task_manager.add")}
              </Button>
            </SoundHoverElement>
          </WrapperHoverElement>
        </div>
      )}
    </Container>
  );
}

export default DroppableContainer;
