import { useEffect, useRef, useState } from "react";

export function useFolderTitleColorPicker(
  onSetFolderTitleColor: (id: string, color: string | null) => void,
) {
  const [paletteOpenForFolderId, setPaletteOpenForFolderId] = useState<
    string | null
  >(null);
  const [nativePickFolderId, setNativePickFolderId] = useState<string | null>(
    null,
  );
  const [colorInputNonce, setColorInputNonce] = useState(0);
  const paletteAnchorRef = useRef<HTMLDivElement | null>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const colorPickFolderRef = useRef<string | null>(null);

  useEffect(() => {
    if (!paletteOpenForFolderId) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const el = paletteAnchorRef.current;
      if (el && !el.contains(e.target as Node)) {
        setPaletteOpenForFolderId(null);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [paletteOpenForFolderId]);

  const openNativeFolderColorPicker = (folderId: string) => {
    setPaletteOpenForFolderId(null);
    colorPickFolderRef.current = folderId;
    setNativePickFolderId(folderId);
    setColorInputNonce((n) => n + 1);
    queueMicrotask(() => colorInputRef.current?.click());
  };

  const applyNativePickerColor = (hex: string) => {
    const fid = colorPickFolderRef.current;
    if (fid) onSetFolderTitleColor(fid, hex);
  };

  return {
    paletteOpenForFolderId,
    setPaletteOpenForFolderId,
    nativePickFolderId,
    colorInputNonce,
    paletteAnchorRef,
    colorInputRef,
    openNativeFolderColorPicker,
    applyNativePickerColor,
  };
}
