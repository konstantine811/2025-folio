import { useState } from "react";
import LoadWinderModel from "../../switch-load-models/load-winder-model";
import { MixMaterialData } from "../../switch-load-models/load.model";
import DrawMesh from "../add-instance-mesh";
import AddWinderInstancedModelWrap from "../winder-model/add-winder-instanced-model-wrap";
import { Matrix4, ShaderMaterial } from "three";

const DrawSingleInstanceWrap = () => {
  const modelUrl = "/3d-models/cubic-worlds-model/grass.glb";
  const [drawData, setDrawData] = useState<MixMaterialData | null>(null);
  const [placementPosition, setPlacementPosition] = useState<Matrix4[]>([]);
  return (
    <>
      <LoadWinderModel
        modelUrl={modelUrl}
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
          <AddWinderInstancedModelWrap
            matrices={placementPosition}
            material={drawData.material as ShaderMaterial}
            blade={drawData.geom}
            // meshName="grass"
            isEditMode={false}
          />
        </>
      )}
    </>
  );
};

export default DrawSingleInstanceWrap;
