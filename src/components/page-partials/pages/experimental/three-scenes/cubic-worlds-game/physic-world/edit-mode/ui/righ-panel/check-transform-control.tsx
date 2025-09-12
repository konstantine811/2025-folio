import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Expand, Move, Rotate3d } from "lucide-react";
import { useEditModeStore } from "../../../../store/useEditModeStore";
import { TransformMode } from "@/config/three-world/transform.config";

const CheckTransformControl = () => {
  const { setEditTransformMode, editTransformMode } = useEditModeStore();
  return (
    <ToggleGroup
      className="w-full bg-background"
      type="single"
      onValueChange={(value) => setEditTransformMode(value as TransformMode)}
      defaultValue={editTransformMode as string}
      aria-label="Text alignment"
    >
      <ToggleGroupItem
        value={TransformMode.Translate}
        aria-label={`Toggle ${TransformMode.Translate}`}
      >
        <Move />
      </ToggleGroupItem>
      <ToggleGroupItem
        value={TransformMode.Scale}
        aria-label={`Toggle ${TransformMode.Scale}`}
      >
        <Expand />
      </ToggleGroupItem>
      <ToggleGroupItem
        value={TransformMode.Rotate}
        aria-label={`Toggle ${TransformMode.Rotate}`}
      >
        <Rotate3d />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default CheckTransformControl;
