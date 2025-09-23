import { UpHint } from "../physic-world/edit-mode/draw-mesh/hooks/useCreatePivotPoint";
import { PhysicsData } from "../store/useEditModeStore";

export function publicModelPath(model: string) {
  return `/3d-models/cubic-worlds-model/${model}`;
}

export enum TypeModel {
  simple = "simple",
  winder = "winder",
  touchWinder = "touch-winder",
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
    name: "Tree",
    path: publicModelPath("tree.glb"),
    type: TypeModel.simple,
    hintMode: "y",
  },
  {
    name: "Rock Middle",
    path: publicModelPath("rock_middle.glb"),
    type: TypeModel.simple,
    hintMode: "y",
  },
  {
    name: "Rock Small",
    path: publicModelPath("rock_small.glb"),
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
    name: "Plank",
    path: publicModelPath("plank.glb"),
    type: TypeModel.simple,
    hintMode: "y",
  },
  {
    name: "Robot Trash",
    path: publicModelPath("robot_trash.glb"),
    type: TypeModel.simple,
    hintMode: "y",
  },
  {
    name: "Grass",
    path: publicModelPath("grass.glb"),
    type: TypeModel.touchWinder,
    hintMode: "auto-normals",
  },
  {
    name: "Vine",
    path: publicModelPath("vine.glb"),
    type: TypeModel.winder,
    hintMode: "auto-normals",
  },
  {
    name: "Log Pile",
    path: publicModelPath("cooking_pile.glb"),
    type: TypeModel.simple,
    hintMode: "y",
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
    type: TypeModel.touchWinder,
    hintMode: "auto-normals",
  },
  {
    name: "Tree",
    path: publicModelPath("tree.glb"),
    type: TypeModel.simple,
    hintMode: "y",
  },
  {
    name: "Rock Small",
    path: publicModelPath("rock_small.glb"),
    type: TypeModel.simple,
    hintMode: "y",
  },
  {
    name: "Plank",
    path: publicModelPath("plank.glb"),
    type: TypeModel.simple,
    hintMode: "y",
  },
  {
    name: "Robot Trash",
    path: publicModelPath("robot_trash.glb"),
    type: TypeModel.simple,
    hintMode: "y",
  },
];
