import { useEffect, useState } from "react";
import { MixMaterialData } from "../../switch-load-models/load.model";
import DrawMesh from "../add-instance-mesh";
import { Matrix4 } from "three";
import {
  EditModeAction,
  useEditModeStore,
} from "../../../../store/useEditModeStore";
import SwitchAddModel from "../../switch-load-models/switch-add-model";
import SwitchInstanceModelWrap from "../../switch-load-models/switch-instance-model-wrap";
import { buildGridCells } from "../../../../utils/grid";

const DrawSingleInstanceWrap = () => {
  const [drawData, setDrawData] = useState<MixMaterialData | null>(null);
  const [placementPosition, setPlacementPosition] = useState<Matrix4[]>([]);
  const instanceModelDraw = useEditModeStore((s) => s.instanceModelDraw);
  const editModeAction = useEditModeStore((s) => s.editModeAction);
  const onSetNewInstance = useEditModeStore((s) => s.onSetNewInstance);

  useEffect(() => {
    if (
      editModeAction !== EditModeAction.addInstance &&
      placementPosition.length
    ) {
      const matrix = buildGridCells(placementPosition, 5);
      onSetNewInstance({
        matrix,
        model: instanceModelDraw,
      });
      setPlacementPosition([]);
    }
  }, [editModeAction, onSetNewInstance, instanceModelDraw, placementPosition]);
  return (
    <>
      {editModeAction === EditModeAction.addInstance && (
        <>
          <SwitchAddModel
            scatterModelDraw={instanceModelDraw}
            onCreateModelGeom={(geom, material) => {
              setDrawData({ geom, material });
            }}
          />
          {drawData && (
            <>
              <DrawMesh
                geom={drawData.geom}
                material={drawData.material}
                onUpdateMatrices={setPlacementPosition}
              />
              <SwitchInstanceModelWrap
                type={instanceModelDraw.type}
                geom={drawData.geom}
                material={drawData.material}
                placementPosition={placementPosition}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default DrawSingleInstanceWrap;
