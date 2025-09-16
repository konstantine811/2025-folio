import { UpHint } from "../physic-world/edit-mode/draw-mesh/hooks/useCreatePivotPoint";

function publicModelPath(model: string) {
  return `/3d-models/cubic-worlds-model/${model}`;
}

export enum TypeModel {
  simple = "simple",
  winder = "winder",
}

export interface ScatterModelDraw {
  name: string;
  path: string;
  type: TypeModel;
  hintMode: UpHint;
}

export const PainterModelConfig: ScatterModelDraw[] = [
  {
    name: "Dirty",
    path: publicModelPath("dirty.glb"),
    type: TypeModel.simple,
    hintMode: "y",
  },
  {
    name: "Grass",
    path: publicModelPath("grass.glb"),
    type: TypeModel.winder,
    hintMode: "auto-normals",
  },
];
