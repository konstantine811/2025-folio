import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { EditModeAction, useEditModeStore } from "../../store/useEditModeStore";
import { Pen, SquarePlus } from "lucide-react";
import clsx from "clsx";

const TabMode = () => {
  const {
    setEditModeAction,
    editModeAction,
    // setIsTransformEdit,
  } = useEditModeStore();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className={`size-10 ${
            editModeAction === EditModeAction.drawScatter ? "bg-accent" : ""
          }`}
          onClick={() => {
            if (editModeAction === EditModeAction.drawScatter) {
              setEditModeAction(EditModeAction.none);
            } else {
              setEditModeAction(EditModeAction.drawScatter);
            }
          }}
        >
          <Pen />
        </Button>
        <Label
          className={clsx(
            `justify-center text-background ${
              editModeAction === EditModeAction.drawScatter
                ? "text-green-500"
                : ""
            }`
          )}
        >
          Scatter Draw
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className={`size-10 ${
            editModeAction === EditModeAction.addInstance ? "bg-accent" : ""
          }`}
          onClick={() => {
            if (editModeAction === EditModeAction.addInstance) {
              setEditModeAction(EditModeAction.none);
            } else {
              setEditModeAction(EditModeAction.addInstance);
            }
          }}
        >
          <SquarePlus />
        </Button>
        <Label
          className={clsx(
            `justify-center text-background ${
              editModeAction === EditModeAction.addInstance
                ? "text-green-500"
                : ""
            }`
          )}
        >
          Add Instance
        </Label>
      </div>
    </div>
  );
};

export default TabMode;
