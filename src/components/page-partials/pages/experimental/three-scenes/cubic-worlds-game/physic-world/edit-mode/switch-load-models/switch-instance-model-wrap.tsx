import { useCallback } from "react";
import { TypeModel } from "../../../config/3d-model.config";
import {
  BufferGeometry,
  Material,
  Matrix4,
  NormalBufferAttributes,
  ShaderMaterial,
} from "three";
import AddWinderInstancedModelWrap from "../draw-mesh/winder-model/add-winder-instanced-model-wrap";
import AddSimpleInstancedModelWrap from "../draw-mesh/simple-model/add-simple-instanced-model";

type Props = {
  placementPosition: Matrix4[];
  geom: BufferGeometry<NormalBufferAttributes>;
  material: Material | ShaderMaterial;
  type: TypeModel;
};

const SwitchInstanceModelWrap = ({
  type,
  placementPosition,
  geom,
  material,
}: Props) => {
  const switchType = useCallback(() => {
    switch (type) {
      case TypeModel.winder:
        return (
          <AddWinderInstancedModelWrap
            matrices={placementPosition}
            material={material as ShaderMaterial}
            blade={geom}
            isEditMode={false}
          />
        );
      case TypeModel.simple:
        return (
          <AddSimpleInstancedModelWrap
            matrices={placementPosition}
            material={material as ShaderMaterial}
            blade={geom}
            isEditMode={false}
          />
        );
      default:
        return null;
    }
  }, [material, geom, type, placementPosition]);
  return <>{switchType()}</>;
};

export default SwitchInstanceModelWrap;
