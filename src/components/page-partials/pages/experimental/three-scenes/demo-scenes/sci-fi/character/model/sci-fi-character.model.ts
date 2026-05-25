import type * as THREE from "three";
import type { GLTF } from "three-stdlib";

export const SCI_FI_CHARACTER_MODEL_PATH =
  "/3d-models/sci-fi/character_new.glb";

export type SciFiCharacterActionName =
  | "Armature.001|mixamo.com|Layer0"
  | "Armature.002|mixamo.com|Layer0"
  | "Armature.004|mixamo.com|Layer0"
  | "Armature.005|mixamo.com|Layer0"
  | "FallingIdle"
  | "Idle"
  | "mixamo.com"
  | "mixamo.com.001"
  | "Run"
  | "SadWalk"
  | "SadWalking"
  | "SitIdle"
  | "StandUp"
  | "StandUp.001"
  | "StopWalking"
  | "Walk";

export interface SciFiCharacterGLTFAction extends THREE.AnimationClip {
  name: SciFiCharacterActionName;
}

export type SciFiCharacterGLTF = GLTF & {
  nodes: {
    human: THREE.SkinnedMesh;
    l_manb: THREE.SkinnedMesh;
    mixamorigHips: THREE.Bone;
    Ctrl_Master: THREE.Bone;
    Ctrl_Foot_IK_Left: THREE.Bone;
    Ctrl_LegPole_IK_Left: THREE.Bone;
    Ctrl_Foot_IK_Right: THREE.Bone;
    Ctrl_LegPole_IK_Right: THREE.Bone;
    Ctrl_ArmPole_IK_Left: THREE.Bone;
    Ctrl_Hand_IK_Left: THREE.Bone;
    Ctrl_ArmPole_IK_Right: THREE.Bone;
    Ctrl_Hand_IK_Right: THREE.Bone;
  };
  materials: {
    ["Skin.002"]: THREE.MeshStandardMaterial;
    L_m_default: THREE.MeshStandardMaterial;
  };
  animations: SciFiCharacterGLTFAction[];
};
