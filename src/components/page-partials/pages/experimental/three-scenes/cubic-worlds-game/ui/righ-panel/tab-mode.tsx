import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEditModeStore } from "../../store/useEditModeStore";
import { Pen } from "lucide-react";
import clsx from "clsx";

const TabMode = () => {
  const {
    isDrawScatter,
    setIsDrawScatter,
    isTransformEdit,
    setIdEditScatter,
    // setIsTransformEdit,
  } = useEditModeStore();
  return (
    <div className="flex flex-col gap-1">
      {!isTransformEdit ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={`size-10 ${isDrawScatter ? "bg-accent" : ""}`}
            onClick={() => {
              setIsDrawScatter(!isDrawScatter);
              if (!isDrawScatter) {
                setIdEditScatter(null);
              }
            }}
          >
            <Pen />
          </Button>
          <Label
            className={clsx(
              `justify-center text-background ${
                isDrawScatter ? "text-green-500" : ""
              }`
            )}
          >
            Scatter Draw
          </Label>
        </div>
      ) : null}
      {/* {!isDrawScatter ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={`size-10 ${isTransformEdit ? "bg-accent" : ""}`}
            onClick={() => setIsTransformEdit(!isTransformEdit)}
          >
            <Move />
          </Button>
          <Label
            className={clsx(
              `justify-center text-background ${
                isDrawScatter ? "text-green-500" : ""
              }`
            )}
          >
            Transform Edit
          </Label>
        </div>
      ) : null} */}
    </div>
  );
};

export default TabMode;
