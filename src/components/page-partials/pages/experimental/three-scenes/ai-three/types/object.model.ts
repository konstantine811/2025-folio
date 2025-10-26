export type ObjectType = "cube" | "sphere";

export type ObjectSpec = {
  type: ObjectType;
  color: string; // "#rrggbb"
  size: [number, number, number];
  radius: number;
  position: [number, number, number];
};

// Це те, що лежить у vocab.json (те, що ми зберегли після тренування)
export interface VocabData {
  vocab: Record<string, number>;
  MAX_TOKENS: number;
  TYPE_TO_ID: Record<ObjectType, number>;
  COLOR_TO_ID: Record<string, number>; // наприклад { red:0, blue:1, ... }
}

// types/scene.ts
export type SceneObjectType = "cube" | "sphere";

export interface SceneObjectFromServer {
  type: SceneObjectType;
  color: string; // "#rrggbb"
  radius: number; // for sphere
  size: [number, number, number]; // for cube (or [0,0,0] for sphere)
  position: [number, number, number];
}

export interface SceneObject extends SceneObjectFromServer {
  id: string; // локальний унікальний id для рендера/маніпуляції
}
