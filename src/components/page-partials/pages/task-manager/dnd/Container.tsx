import React, { forwardRef } from "react";

import { Handle } from "./Handle";
import { Remove } from "./Remove";

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
      ...props
    }: Props,
    ref
  ) => {
    const Component = "div";

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
        className=""
      >
        {label ? (
          <div className="">
            {label}
            <div className="">
              {onRemove ? <Remove onClick={onRemove} /> : undefined}
              <Handle {...handleProps} />
            </div>
          </div>
        ) : null}
        {placeholder ? children : <ul>{children}</ul>}
      </Component>
    );
  }
);
