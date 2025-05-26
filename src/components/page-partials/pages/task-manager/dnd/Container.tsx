import React, { forwardRef, useState } from "react";

import InputCombobox from "@/components/ui-abc/inputs/input-combobox";
import { Button } from "@/components/ui/button";
import { Grip, Pen, PenOff, X } from "lucide-react";
import SoundHoverElement from "@/components/ui-abc/sound-hover-element";
import { SoundTypeElement } from "@/types/sound";

export interface Props {
  children: React.ReactNode;
  columns?: number;
  label?: string;
  style?: React.CSSProperties;
  horizontal?: boolean;
  handleProps?: React.HTMLAttributes<HTMLButtonElement | HTMLDivElement>;
  scrollable?: boolean;
  shadow?: boolean;
  placeholder?: boolean;
  onClick?(): void;
  onRemove?(): void;
  onValueChange?: (value: string) => void;
}

export const Container = forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      columns = 1,
      handleProps,
      onRemove,
      label,
      placeholder,
      style,
      onValueChange,
      ...props
    }: Props,
    ref
  ) => {
    const Component = "div";
    const [isEdit, setIsEdit] = useState(false);
    return (
      <Component
        {...props}
        ref={ref}
        style={
          {
            ...style,
            "--columns": columns,
          } as React.CSSProperties
        }
        className="relative"
      >
        {label ? (
          <div className="flex items-center w-full gap-1 relative z-20">
            <div className="flex w-full gap-2 items-center justify-between">
              {isEdit ? (
                <InputCombobox
                  onValueChange={(value: string) => {
                    if (onValueChange) onValueChange(value);
                    setIsEdit(false);
                  }}
                  outerValue={label}
                />
              ) : (
                <label
                  onDoubleClick={() => setIsEdit(true)}
                  className="text-foreground text-xl ml-3"
                >
                  {label}
                </label>
              )}

              <SoundHoverElement
                animValue={0.9}
                hoverTypeElement={SoundTypeElement.SELECT}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEdit(!isEdit)}
                >
                  {isEdit ? <PenOff /> : <Pen />}
                </Button>
              </SoundHoverElement>
            </div>

            {!isEdit && (
              <div className="flex items-center gap-1">
                {onRemove && (
                  <SoundHoverElement
                    animValue={0.9}
                    hoverTypeElement={SoundTypeElement.SELECT_2}
                  >
                    <Button
                      variant="destructive"
                      className="bg-transparent"
                      size="icon"
                      onClick={onRemove}
                    >
                      <X />
                    </Button>
                  </SoundHoverElement>
                )}
                <SoundHoverElement
                  animValue={0.9}
                  hoverTypeElement={SoundTypeElement.SELECT}
                >
                  <Button
                    {...handleProps}
                    variant="ghost"
                    size="icon"
                    className="cursor-move"
                  >
                    <Grip />
                  </Button>
                </SoundHoverElement>
              </div>
            )}
          </div>
        ) : null}
        {placeholder ? children : <ul>{children}</ul>}
        {isEdit && (
          <div
            onClick={() => setIsEdit(false)}
            className="fixed top-0 left-0 w-full h-full z-[10] bg-card/90"
          ></div>
        )}
      </Component>
    );
  }
);
