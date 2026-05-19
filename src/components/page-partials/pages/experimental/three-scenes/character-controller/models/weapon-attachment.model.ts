import { Vector3Tuple } from "three";

export type WeaponAttachmentConfig = {
  modelPath: string;
  boneName?: string;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  scale: Vector3Tuple;
};
