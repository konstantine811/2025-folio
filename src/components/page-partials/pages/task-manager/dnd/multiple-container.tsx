import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CancelDrop,
  CollisionDetection,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  Modifiers,
  UniqueIdentifier,
  useSensors,
  useSensor,
  MeasuringStrategy,
  KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  SortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

import { coordinateGetter as multipleContainersCoordinateGetter } from "./utils/multipleContainersKeyboardCoordinates";
import { RenderItemProps } from "./item";
import { createRange } from "./utils/createRange";
import DroppableContainer from "./droppable-container";
import { GetItemStyles, Priority, Items } from "@/types/drag-and-drop.model";
import { PLACEHOLDER_ID, TRASH_ID } from "./config/dnd.config";
import useCollisionDectionStrategy from "./hooks/useCollisionDectionStrategy";
import { dropAnimation, getIndex } from "./utils/dnd.utils";
import useDrag from "./hooks/useDrag";
import SortableItem from "./sortable-item";
import Trash from "./trash";
import ContainerDragOverlay from "./container-drag-overlay";
import SortableItemDragOverlay from "./sortable-item-drag-overlay";

interface Props {
  adjustScale?: boolean;
  cancelDrop?: CancelDrop;
  columns?: number;
  containerStyle?: React.CSSProperties;
  coordinateGetter?: KeyboardCoordinateGetter;
  getItemStyles?: GetItemStyles;
  wrapperStyle?(args: { index: number }): React.CSSProperties;
  itemCount?: number;
  items?: Items;
  handle?: boolean;
  renderItem?: (args: RenderItemProps) => React.ReactElement;
  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  minimal?: boolean;
  trashable?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
}

export function MultipleContainers({
  adjustScale = false,
  itemCount = 3,
  cancelDrop,
  columns,
  handle = false,
  items: initialItems,
  containerStyle,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  trashable = false,
  vertical = false,
  scrollable,
}: Props) {
  const [items, setItems] = useState<Items>(() => {
    if (initialItems) return initialItems;
    return ["A", "B", "C", "D"].map((id) => ({
      id,
      title: id,
      tasks: createRange(itemCount, (index) => ({
        id: `${id}${index + 1}`,
        title: `Задача ${id}${index + 1}`,
        isDone: false,
        time: 0,
        timeDone: 0,
        priority: Priority.MEDIUM,
      })),
    }));
  });

  useEffect(() => {
    console.log("Items updated:", items);
  }, [items]);

  const [containers, setContainers] = useState<UniqueIdentifier[]>(
    items.map((cat) => cat.id)
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = activeId ? containers.includes(activeId) : false;

  const collisionDetectionStrategy: CollisionDetection =
    useCollisionDectionStrategy({
      activeId,
      items,
      lastOverId,
      recentlyMovedToNewContainer,
    });

  const {
    onDragOver,
    onDragEnd,
    handleAddColumn,
    onDragCancel,
    onDragStart,
    handleRemove,
  } = useDrag({
    items,
    setItems,
    recentlyMovedToNewContainer,
    setContainers,
    setActiveId,
    activeId,
  });

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );

  const handleToggleTask = (taskId: UniqueIdentifier, newIsDone: boolean) => {
    setItems((prevItems) =>
      prevItems.map((container) => ({
        ...container,
        tasks: container.tasks.map((t) =>
          t.id === taskId ? { ...t, isDone: newIsDone } : t
        ),
      }))
    );
  };

  const handleChangeTask = (
    taskId: UniqueIdentifier,
    title: string,
    priority: Priority,
    time: number,
    timeDone: number
  ) => {
    setItems((prevItems) =>
      prevItems.map((container) => ({
        ...container,
        tasks: container.tasks.map((t) =>
          t.id === taskId ? { ...t, title, priority, time, timeDone } : t
        ),
      }))
    );
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={({ active }) => {
        onDragStart(active);
      }}
      onDragOver={({ active, over }) => {
        return onDragOver(active, over);
      }}
      onDragEnd={({ active, over }) => {
        return onDragEnd(active, over);
      }}
      cancelDrop={cancelDrop}
      onDragCancel={onDragCancel}
      modifiers={modifiers}
    >
      <div className="w-full max-w-2xl">
        <SortableContext
          items={[...containers, PLACEHOLDER_ID]}
          strategy={
            vertical
              ? verticalListSortingStrategy
              : horizontalListSortingStrategy
          }
        >
          {items.map((category) => (
            <DroppableContainer
              key={category.id}
              id={category.id}
              label={minimal ? undefined : category.title}
              columns={columns}
              items={category.tasks}
              setItems={setItems}
              scrollable={scrollable}
              style={containerStyle}
              setContainers={setContainers}
              {...(minimal ? { unstyled: true } : {})}
              onRemove={() => handleRemove(category.id)}
            >
              <SortableContext
                items={category.tasks.map((t) => t.id)}
                strategy={strategy}
              >
                {category.tasks.length > 0 ? (
                  category.tasks.map((task, index) => (
                    <SortableItem
                      disabled={isSortingContainer}
                      key={task.id}
                      id={task.id}
                      index={index}
                      handle={handle}
                      items={items}
                      style={getItemStyles}
                      wrapperStyle={wrapperStyle}
                      renderItem={renderItem}
                      containerId={category.id}
                      getIndex={getIndex}
                      task={task}
                      onToggle={(id, value) => {
                        handleToggleTask(id, value);
                      }}
                      onChangeTask={handleChangeTask}
                    />
                  ))
                ) : (
                  <li className="h-[64px] rounded-xl border border-dashed border-muted/20 flex items-center justify-center text-muted-foreground text-sm">
                    Перетягни сюди задачу
                  </li>
                )}
              </SortableContext>
            </DroppableContainer>
          ))}

          {!minimal && (
            <DroppableContainer
              id={PLACEHOLDER_ID}
              disabled={isSortingContainer}
              items={[]}
              onClick={handleAddColumn}
              placeholder
            >
              + Add column
            </DroppableContainer>
          )}
        </SortableContext>
      </div>
      {createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {activeId ? (
            containers.includes(activeId) ? (
              <ContainerDragOverlay
                items={items}
                getItemStyles={getItemStyles}
                handle={handle}
                renderItem={renderItem}
                columns={columns}
                containerId={activeId}
              />
            ) : (
              <SortableItemDragOverlay
                items={items}
                getItemStyles={getItemStyles}
                handle={handle}
                renderItem={renderItem}
                id={activeId}
              />
            )
          ) : null}
        </DragOverlay>,
        document.body
      )}
      {trashable && activeId && !containers.includes(activeId) ? (
        <Trash id={TRASH_ID} />
      ) : null}
    </DndContext>
  );
}
