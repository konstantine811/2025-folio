// db/scatters.db.ts
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
