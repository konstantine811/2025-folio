import React, { useEffect } from "react";
import type {
  DraggableSyntheticListeners,
  UniqueIdentifier,
} from "@dnd-kit/core";
import type { Transform } from "@dnd-kit/utilities";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { SoundTypeElement } from "@/types/sound";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { ItemTask } from "@/types/drag-and-drop.model";
import { TaskItem } from "./task-item";

export type RenderItemProps = {
  dragOverlay: boolean;
  dragging: boolean;
  sorting: boolean;
  index: number | undefined;
  fadeIn: boolean;
  listeners: DraggableSyntheticListeners;
  ref: React.Ref<HTMLElement>;
  style: React.CSSProperties | undefined;
  transform: Props["transform"];
  transition: Props["transition"];
  value: Props["value"];
  task: ItemTask;
};

export interface Props {
  dragOverlay?: boolean;
  color?: string;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: React.HTMLAttributes<HTMLButtonElement> & {
    ref?: React.Ref<HTMLButtonElement>;
  };
  height?: number;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  value: React.ReactNode;
  task: ItemTask;
  onRemove?(): void;
  renderItem?: (args: RenderItemProps) => React.ReactElement;
  onToggle?: (id: UniqueIdentifier, value: boolean) => void;
  onEditTask?: (task: ItemTask) => void;
  templated: boolean;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        dragOverlay,
        dragging,
        fadeIn,
        handle,
        index,
        listeners,
        onEditTask,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        task,
        onToggle,
        templated,
        ...props
      },
      ref
    ) => {
      useEffect(() => {
        if (!dragOverlay) {
          return;
        }
        document.body.style.cursor = "grabbing";

        return () => {
          document.body.style.cursor = "";
        };
      }, [dragOverlay]);

      return renderItem ? (
        renderItem({
          dragOverlay: Boolean(dragOverlay),
          dragging: Boolean(dragging),
          sorting: Boolean(sorting),
          index,
          fadeIn: Boolean(fadeIn),
          listeners,
          ref,
          style,
          transform,
          transition,
          value,
          task,
        })
      ) : (
        <li className="list-none" ref={ref} tabIndex={!handle ? 0 : undefined}>
          <TaskItem
            index={index}
            templated={templated}
            dragging={dragOverlay}
            task={task}
            onToggle={onToggle}
            onEditTask={onEditTask}
            style={{
              transform: transform
                ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                : undefined,
              transition: transition ?? undefined, // ← fix тут
              ...style,
            }}
          >
            {
              <div>
                <SoundHoverElement
                  animValue={0.9}
                  hoverTypeElement={SoundTypeElement.SHIFT}
                >
                  <Button
                    data-cypress="draggable-item"
                    {...(!handle ? listeners : undefined)}
                    {...props}
                    variant="ghost"
                    size="icon"
                    className="cursor-move hover:bg-background hover:text-foreground"
                  >
                    <GripVertical />
                  </Button>
                </SoundHoverElement>
              </div>
            }
          </TaskItem>
        </li>
      );
    }
  )
);
