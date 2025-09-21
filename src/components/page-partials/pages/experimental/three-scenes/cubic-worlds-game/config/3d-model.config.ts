import { UpHint } from "../physic-world/edit-mode/draw-mesh/hooks/useCreatePivotPoint";
import { PhysicsData } from "../store/useEditModeStore";

export function publicModelPath(model: string) {
  return `/3d-models/cubic-worlds-model/${model}`;
}

export enum TypeModel {
  simple = "simple",
  winder = "winder",
}

export interface InstanceModelDraw {
  name: string;
  path: string;
  type: TypeModel;
  hintMode: UpHint;
}

export const DispabledPhysics: PhysicsData = {
  type: "fixed",
  colliders: "hull",
  restitution: 0,
  friction: 1,
  mass: 0,
  isPhysicsEnabled: false,
};

export const SingleAddModelConfig: InstanceModelDraw[] = [
  {
    name: "Box",
    path: publicModelPath("box.glb"),
    type: TypeModel.simple,
    hintMode: "y",
  },
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

export const PainterModelConfig: InstanceModelDraw[] = [
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
