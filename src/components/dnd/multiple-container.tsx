import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FixedSizeList as List } from "react-window";
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
import DroppableContainer from "./droppable-container";
import {
  GetItemStyles,
  Priority,
  Items,
  ItemTask,
} from "@/types/drag-and-drop.model";
import { PLACEHOLDER_ID, TRASH_ID } from "./config/dnd.config";
import useCollisionDectionStrategy from "./hooks/useCollisionDectionStrategy";
import { dropAnimation, getIndex } from "./utils/dnd.utils";
import useDrag from "./hooks/useDrag";
import SortableItem from "./sortable-item";
import Trash from "./trash";
import ContainerDragOverlay from "./container-drag-overlay";
import SortableItemDragOverlay from "./sortable-item-drag-overlay";
import { TooltipProvider } from "@/components/ui/tooltip";
import DialogTask from "./dialog-task";
import SoundHoverElement from "../ui-abc/sound-hover-element";
import { Button } from "../ui/button";
import { HoverStyleElement, SoundTypeElement } from "@/types/sound";
import { useTranslation } from "react-i18next";
import WrapperHoverElement from "../ui-abc/wrapper-hover-element";
import TaskTimer from "./task-timer";
import { useHeaderSizeStore } from "@/storage/headerSizeStore";
import { createRange } from "./utils/createRange";
import { useTaskManager } from "./context/use-task-manger-context";
import { CATEGORY_OPTIONS } from "./config/category-options";
import { createTask } from "./utils/createTask";

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
  templated?: boolean;
  testedCount?: number;
  onChangeTasks?: (items: Items) => void;
}

const TASK_ITEM_HEIGHT = 72;

export function MultipleContainers({
  adjustScale = false,
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
  templated = true,
  testedCount,
  scrollable,
  onChangeTasks = () => {},
}: Props) {
  const [t] = useTranslation();
  const [items, setItems] = useState<Items>(() => initialItems ?? []);
  const sH = useHeaderSizeStore((s) => s.size);

  const [containers, setContainers] = useState<UniqueIdentifier[]>(
    items.map((cat) => cat.id)
  );
  const [addTaskContainerId, setAddTaskContainerId] =
    useState<UniqueIdentifier | null>(null);
  const [editTask, setEditTask] = useState<ItemTask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = activeId ? containers.includes(activeId) : false;
  const taskTimeDone = useTaskManager((s) => s.updatedTask);
  const [hasInitialized, setHasInitialized] = useState(false);
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
  const updateTaskTime = (taskId: UniqueIdentifier, newTimeDone: number) => {
    setItems((prev) =>
      prev.map((container) => ({
        ...container,
        tasks: container.tasks.map((task) =>
          task.id === taskId ? { ...task, timeDone: newTimeDone } : task
        ),
      }))
    );
  };

  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
      setHasInitialized(true); // ✅
    }
  }, [initialItems]);

  useEffect(() => {
    if (hasInitialized) {
      onChangeTasks(items);
    }
  }, [items, hasInitialized, onChangeTasks]);

  useEffect(() => {
    if (testedCount) {
      setItems(
        ["A", "B", "C", "D"].map((id) => ({
          id,
          title: id,
          tasks: createRange(testedCount, (index) => ({
            id: `${id}${index + 1}`,
            title: `Задача ${id}${index + 1}`,
            isDone: false,
            time: 10000,
            timeDone: 0,
            priority: Priority.MEDIUM,
          })),
        }))
      );
    }
  }, [testedCount]);
  useEffect(() => {
    if (taskTimeDone) {
      updateTaskTime(taskTimeDone.id, taskTimeDone?.timeDone);
    }
  }, [taskTimeDone]);

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

  const handleAddTask = (
    title: string,
    priority: Priority,
    time: number,
    wastedTime: number,
    id: UniqueIdentifier
  ) => {
    if (!setItems) return;
    const newTask = createTask(title, priority, time, false, wastedTime);
    setItems((prev) =>
      prev.map((category) =>
        category.id === id
          ? { ...category, tasks: [...category.tasks, newTask] }
          : category
      )
    );
  };

  const handleEditTask = (
    taskId: UniqueIdentifier,
    title: string,
    priority: Priority,
    time: number,
    timeDone: number,
    containerId: UniqueIdentifier
  ) => {
    setItems((prevItems) =>
      prevItems.map((container) => {
        if (container.id === containerId) {
          return {
            ...container,
            tasks: container.tasks.map((task) =>
              task.id === taskId
                ? { ...task, title, priority, time, timeDone }
                : task
            ),
          };
        }
        return container;
      })
    );
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  return (
    <>
      <DialogTask
        key={editTask?.id ?? "new-task"}
        isOpen={isDialogOpen}
        containerId={addTaskContainerId}
        task={editTask}
        templated={templated}
        onChangeTask={(
          taskId,
          title,
          priority,
          time,
          wastedTime,
          containerId
        ) => {
          if (taskId && containerId) {
            handleEditTask(
              taskId,
              title,
              priority,
              time,
              wastedTime,
              containerId
            );
          } else if (containerId) {
            handleAddTask(title, priority, time, wastedTime, containerId);
          }
          setIsDialogOpen(false);
          setAddTaskContainerId(null);
          setEditTask(null);
        }}
        setOpen={(status) => {
          setAddTaskContainerId(null);
          setEditTask(null);
          setIsDialogOpen(status);
        }}
      />
      {!templated && (
        <div
          style={{ top: sH }}
          className="sticky flex justify-center items-center z-10  py-5 bg-background/50 backdrop-blur-xs"
        >
          <TaskTimer />
        </div>
      )}
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
        <div className={`${templated && "mt-5"}`}>
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
                templated={templated}
                label={minimal ? undefined : category.title}
                columns={columns}
                items={category.tasks}
                setItems={setItems}
                scrollable={scrollable}
                style={containerStyle}
                options={CATEGORY_OPTIONS}
                onAddTask={(id) => {
                  setAddTaskContainerId(id);
                  setIsDialogOpen(true);
                }}
                setContainers={setContainers}
                {...(minimal ? { unstyled: true } : {})}
                onRemove={() => handleRemove(category.id)}
              >
                <SortableContext
                  items={category.tasks.map((t) => t.id)}
                  strategy={strategy}
                >
                  {category.tasks.length === 0 ? (
                    <li
                      className={`rounded-xl border border-dashed border-muted/20 flex items-center justify-center text-muted-foreground text-sm transition-all duration-200
    ${category.tasks.length > 0 ? "invisible absolute" : ""}
  `}
                      style={{
                        minHeight: "72px",
                        height: "72px",
                      }}
                    >
                      {t("task_manager.drag_task_here")}
                    </li>
                  ) : category.tasks.length > 10 ? (
                    <List
                      height={Math.min(
                        500,
                        category.tasks.length * TASK_ITEM_HEIGHT
                      )}
                      itemCount={category.tasks.length}
                      itemSize={TASK_ITEM_HEIGHT}
                      width="100%"
                      outerElementType="ul"
                    >
                      {({ index, style }) => {
                        const task = category.tasks[index];
                        return (
                          <div style={style} key={task.id}>
                            <SortableItem
                              disabled={isSortingContainer}
                              id={task.id}
                              templated={templated}
                              index={index}
                              handle={handle}
                              items={items}
                              style={getItemStyles}
                              wrapperStyle={wrapperStyle}
                              renderItem={renderItem}
                              containerId={category.id}
                              getIndex={getIndex}
                              task={task}
                              onToggle={handleToggleTask}
                              onEditTask={(task) => {
                                setEditTask(null);
                                setTimeout(() => {
                                  setEditTask(task);
                                  setAddTaskContainerId(category.id);
                                  setIsDialogOpen(true);
                                }, 0);
                              }}
                            />
                          </div>
                        );
                      }}
                    </List>
                  ) : (
                    <TooltipProvider>
                      {category.tasks.map((task, index) => (
                        <SortableItem
                          disabled={isSortingContainer}
                          key={task.id}
                          id={task.id}
                          templated={templated}
                          index={index}
                          handle={handle}
                          items={items}
                          style={getItemStyles}
                          wrapperStyle={wrapperStyle}
                          renderItem={renderItem}
                          containerId={category.id}
                          getIndex={getIndex}
                          task={task}
                          onToggle={handleToggleTask}
                          onEditTask={(task) => {
                            setEditTask(null);
                            setTimeout(() => {
                              setEditTask(task);
                              setAddTaskContainerId(category.id);
                              setIsDialogOpen(true);
                            }, 0);
                          }}
                        />
                      ))}
                    </TooltipProvider>
                  )}
                </SortableContext>
              </DroppableContainer>
            ))}

            {!minimal && (
              <DroppableContainer
                id={PLACEHOLDER_ID}
                templated={templated}
                options={CATEGORY_OPTIONS}
                disabled={isSortingContainer}
                items={[]}
                onClick={handleAddColumn}
                placeholder
              >
                <div className="flex justify-center items-center">
                  <WrapperHoverElement className="w-full">
                    <SoundHoverElement
                      animValue={1.09}
                      hoverTypeElement={SoundTypeElement.LINK}
                      hoverStyleElement={HoverStyleElement.quad}
                      className="w-full"
                    >
                      <Button
                        className="w-full uppercase hover:bg-transparent hover:text-primary"
                        variant="ghost"
                      >
                        {t("task_manager.add_container")}
                      </Button>
                    </SoundHoverElement>
                  </WrapperHoverElement>
                </div>
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
                  templated={templated}
                  options={CATEGORY_OPTIONS}
                />
              ) : (
                <SortableItemDragOverlay
                  items={items}
                  templated={templated}
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
    </>
  );
}
