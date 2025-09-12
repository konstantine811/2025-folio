import { RapierRigidBody } from "@react-three/rapier";
import { Texture, Vector2 } from "three";
import {
  AnimationAction,
  AnimationMixer,
  Group,
  Mesh,
  Object3D,
  Object3DEventMap,
} from "three";
import { create } from "zustand";

interface ModelNodes {
  [name: string]: Object3D<Object3DEventMap>;
}

export interface CharacterTextureProps {
  presenceTex: Texture | null;
  sizeTexture: number;
  boundsXZ: { min: Vector2; max: Vector2 };
}

interface GameDataState {
  characterAnim: {
    group: Group;
    mixer: AnimationMixer;
    actions: Record<string, AnimationAction>;
  } | null;
  characterNodes: ModelNodes;
  groundMesh: Mesh | null;
  characterRigidBody: RapierRigidBody | null;
  characterTextureData: CharacterTextureProps;
}

const initialState: GameDataState = {
  characterAnim: null,
  characterNodes: {},
  groundMesh: null,
  characterRigidBody: null,
  characterTextureData: {
    presenceTex: null,
    sizeTexture: 1024,
    boundsXZ: { min: new Vector2(-50, -50), max: new Vector2(50, 50) },
  },
};

interface GameDataActions {
  setCharacterAnim: (anim: GameDataState["characterAnim"]) => void;
  setCharacterNodes: (nodes: ModelNodes) => void;
  setCharacterGroundMesh: (mesh: Mesh) => void;
  setCharacterRigidBody: (body: RapierRigidBody) => void;
  setCharacterTextureData: (data: CharacterTextureProps) => void;
}

type GameDataStore = GameDataState & GameDataActions;

export const useGameDataStore = create<GameDataStore>()((set) => ({
  ...initialState,
  setCharacterAnim: (anim) => set({ characterAnim: anim }),
  setCharacterNodes: (nodes) =>
    set(() => ({
      characterNodes: nodes,
    })),
  setCharacterGroundMesh: (mesh: Mesh) => set({ groundMesh: mesh }),
  setCharacterRigidBody: (body: RapierRigidBody) =>
    set({ characterRigidBody: body }),
  setCharacterTextureData: (data: CharacterTextureProps) =>
    set({ characterTextureData: data }),
}));
