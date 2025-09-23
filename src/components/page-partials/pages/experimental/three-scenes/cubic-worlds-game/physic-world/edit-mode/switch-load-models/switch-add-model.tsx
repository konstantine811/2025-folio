import { useCallback } from "react";
import { InstanceModelDraw, TypeModel } from "../../../config/3d-model.config";
import LoadTouchWinderModel from "./load-touch-winder-model";
import {
  BufferGeometry,
  Material,
  NormalBufferAttributes,
  ShaderMaterial,
} from "three";
import LoadSimpleModel from "./load-simple-model";
import LoadWinderModel from "./load-winder-model";

type Props = {
  scatterModelDraw: InstanceModelDraw;
  onCreateModelGeom: (
    geom: BufferGeometry<NormalBufferAttributes>,
    material: Material | ShaderMaterial,
    type: TypeModel
  ) => void;
};

const SwitchAddModel = ({ scatterModelDraw, onCreateModelGeom }: Props) => {
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
      case TypeModel.touchWinder:
        return (
          <LoadTouchWinderModel
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

export default SwitchAddModel;
