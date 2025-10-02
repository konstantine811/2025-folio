import { Button } from "@/components/ui/button";
import { EditModeAction, useEditModeStore } from "../../store/useEditModeStore";
import ListScatter from "./scatter-draw/list-scatters";
import { ScatterModalWindow } from "./scatter-draw/scatter-modal-window";
import SelectDrawInstanceModel from "./select-draw-instance-model";
import TabMode from "./tab-mode";
import TabScatterDraw from "./tab-scatter-draw";
import { Vector3 } from "three";
// import TreeViewModel from "./tree-view-model";

const RightSidePanel = () => {
  const editModeAction = useEditModeStore((s) => s.editModeAction);
  const controls = useEditModeStore((s) => s.cameraControls);
  return (
    <div className="bg-background/50 backdrop-blur-2xl pointer-events-auto p-3 rounded-tl-md rounded-bl-md min-w-40 max-h-[calc(100vh-160px)] overflow-auto">
      <Button
        className="mb-3"
        onClick={() => {
          if (controls) {
            console.log(
              "CAMERA POSITION ",
              controls.getPosition(new Vector3())
            );
            console.log("CAMERA TARGET ", controls.getTarget(new Vector3()));
            // console.log("CAMERA LOOK AT ", controls.g);
          }
        }}
      >
        Get Camera Positioin
      </Button>
      <TabMode />
      <TabScatterDraw />
      {editModeAction === EditModeAction.addInstance ? (
        <div className="pt-3">
          <SelectDrawInstanceModel />
        </div>
      ) : null}
      {/* <TreeViewModel /> */}
      <ListScatter />
      <ScatterModalWindow />
    </div>
  );
};

export default RightSidePanel;
