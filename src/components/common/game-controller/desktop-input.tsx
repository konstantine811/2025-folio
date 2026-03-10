import KeyboardController from "./keyboard-controller";
import { useMouseButtonsToStore } from "./use-mouse-buttons";

export default function DesktopInput() {
    useMouseButtonsToStore(true);
    return <KeyboardController />;
  };