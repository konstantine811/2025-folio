import type { RefObject } from "react";
import { hexForColorInput } from "./constants";

interface NativeFolderColorInputProps {
  colorInputNonce: number;
  inputRef: RefObject<HTMLInputElement | null>;
  defaultTitleColor: string | null | undefined;
  onPick: (hex: string) => void;
}

export function NativeFolderColorInput({
  colorInputNonce,
  inputRef,
  defaultTitleColor,
  onPick,
}: NativeFolderColorInputProps) {
  return (
    <input
      key={`native-color-${colorInputNonce}`}
      ref={inputRef}
      type="color"
      aria-hidden
      tabIndex={-1}
      className="sr-only"
      defaultValue={hexForColorInput(defaultTitleColor)}
      onInput={(e) => onPick(e.currentTarget.value)}
      onChange={(e) => onPick(e.currentTarget.value)}
    />
  );
}
