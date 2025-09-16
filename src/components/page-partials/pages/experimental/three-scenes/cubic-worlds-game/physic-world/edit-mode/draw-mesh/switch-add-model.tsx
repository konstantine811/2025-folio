import { useCallback } from "react";
import { ScatterModelDraw, TypeModel } from "../../../config/3d-model.config";
import LoadWinderModel from "../switch-load-models/load-winder-model";
import {
  BufferGeometry,
  Material,
  NormalBufferAttributes,
  ShaderMaterial,
} from "three";
import LoadSimpleModel from "../switch-load-models/load-simple-model";

type Props = {
  scatterModelDraw: ScatterModelDraw;
  onCreateModelGeom: (
    geom: BufferGeometry<NormalBufferAttributes>,
    material: Material | ShaderMaterial,
    type: TypeModel
  ) => void;
};

const SwitchModelAdd = ({ scatterModelDraw, onCreateModelGeom }: Props) => {
  const switchLoadModel = useCallback(() => {
    switch (scatterModelDraw.type) {
      case TypeModel.simple:
        return (
          <LoadSimpleModel
            modelUrl={scatterModelDraw.path}
            onCreateModelGeom={(geom, material) =>
              onCreateModelGeom(geom, material, scatterModelDraw.type)
            }
          />
        );
      case TypeModel.winder:
        return (
          <LoadWinderModel
            modelUrl={scatterModelDraw.path}
            onCreateModelGeom={(geom, material) =>
              onCreateModelGeom(geom, material, scatterModelDraw.type)
            }
          />
        );
      default:
        return null;
    }
  }, [scatterModelDraw, onCreateModelGeom]);
  return <>{switchLoadModel()}</>;
};

export default SwitchModelAdd;
