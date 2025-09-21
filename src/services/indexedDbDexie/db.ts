// db/scatters.db.ts
import { TypeModel } from "@/components/page-partials/pages/experimental/three-scenes/cubic-worlds-game/config/3d-model.config";
import { PhysicsData } from "@/components/page-partials/pages/experimental/three-scenes/cubic-worlds-game/store/useEditModeStore";
import Dexie, { Table } from "dexie";

export interface CachedScatter {
  id: string; // `${uid}::${name}`
  uid: string;
  name: string;
  updatedAt: string; // ISO
  email: string | null;
  storagePath: string;
  size: number;
  rows: number;
  rowLengths: number[];
  dtype: "f64";
  order: "column-major";
  matricesBytes: Uint8Array; // зберігаємо байти, не об'єкти Matrix4
  modelPath: string;
  modelName: string;
  hint: string;
  type: TypeModel;
  physicsData: PhysicsData | null;
}

class CubicWorldsDB extends Dexie {
  scatters!: Table<CachedScatter, string>;

  constructor() {
    super("cubicWorlds");
    this.version(1).stores({
      // індекси: id — primary key; плюс індекси для запитів
      scatters: "id, uid, name, updatedAt",
    });
  }
}

export const db = new CubicWorldsDB();
