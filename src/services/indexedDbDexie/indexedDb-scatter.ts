import { decodeRaggedFromBytes } from "@/components/page-partials/pages/experimental/three-scenes/cubic-worlds-game/utils/encode-decode-matrix";
import {
  scatterRef,
  ScatterWithData,
} from "../firebase/cubic-worlds-game/firestore-scatter-objects";
import { waitForUserAuth } from "../firebase/userAthUtils";
import { CachedScatter, db } from "./db";
import { ref as sref, getBytes, getMetadata, listAll } from "firebase/storage";
import { storage } from "@/config/firebase.config";
import { makeId, newerThan } from "@/utils/db.util";

function scatterDirRef(uid: string) {
  return scatterRef(uid);
}

/** 1) Отримати з кешу (миттєво) */
export async function getCachedScatters(): Promise<ScatterWithData[]> {
  const user = await waitForUserAuth();
  if (!user) return [];

  const list = await db.scatters.where("uid").equals(user.uid).toArray();

  const out = list.map(
    (c): ScatterWithData => ({
      name: c.name,
      updatedAt: c.updatedAt,
      email: c.email,
      storagePath: c.storagePath,
      size: c.size,
      rows: c.rows,
      rowLengths: c.rowLengths,
      dtype: c.dtype,
      order: c.order,
      matrices: decodeRaggedFromBytes(c.matricesBytes, {
        rows: c.rows,
        rowLengths: c.rowLengths,
        dtype: c.dtype,
        order: c.order,
      }),
    })
  );

  out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return out;
}

/** 2) Оновити кеш із бекенду (повертає актуальний список) */
export async function refreshScattersFromNetwork({
  removeMissing = false,
}: { removeMissing?: boolean } = {}): Promise<ScatterWithData[]> {
  const user = await waitForUserAuth();
  if (!user) return [];

  const dirRef = sref(storage, scatterDirRef(user.uid));
  const page = await listAll(dirRef);

  // 2.1 Прочитати кеш у Map
  const cachedArr = await db.scatters.where("uid").equals(user.uid).toArray();
  const cachedMap = new Map<string, CachedScatter>(
    cachedArr.map((i) => [i.name, i])
  );

  // 2.2 Пройти по віддаленим файлам
  const seenNames = new Set<string>();

  for (const itemRef of page.items) {
    const md = await getMetadata(itemRef);
    const cm = md.customMetadata ?? {};
    const name = (cm.name ?? itemRef.name.replace(/\.f64$/, "")).trim();
    const updatedAt = cm.updatedAt ?? md.updated ?? new Date().toISOString();
    const email = (cm.email ?? "") || null;
    const rows = Number(cm.rows ?? 0);
    const rowLengths = cm.rowLengths ? JSON.parse(cm.rowLengths) : [];
    const dtype = (cm.dtype ?? "f64") as "f64";
    const order = (cm.order ?? "column-major") as "column-major";
    const size = md.size ?? 0;
    const storagePath = itemRef.fullPath;

    seenNames.add(name);

    const cached = cachedMap.get(name);
    const shouldDownload = !cached || newerThan(updatedAt, cached.updatedAt);

    if (shouldDownload) {
      const ab = await getBytes(itemRef);
      const matricesBytes = new Uint8Array(ab);

      const rec: CachedScatter = {
        id: makeId(user.uid, name),
        uid: user.uid,
        name,
        updatedAt,
        email,
        storagePath,
        size: size || ab.byteLength,
        rows,
        rowLengths,
        dtype,
        order,
        matricesBytes,
      };

      await db.scatters.put(rec);
      cachedMap.set(name, rec);
    }
  }

  // 2.3 (опційно) Видалити з кешу те, чого вже немає у Storage
  if (removeMissing) {
    const toDelete = cachedArr.filter((c) => !seenNames.has(c.name));
    if (toDelete.length) {
      await db.scatters.bulkDelete(toDelete.map((c) => c.id));
      toDelete.forEach((c) => cachedMap.delete(c.name));
    }
  }

  // 2.4 Повернути актуальний список із кешу
  const final = Array.from(cachedMap.values()).map(
    (c): ScatterWithData => ({
      name: c.name,
      updatedAt: c.updatedAt,
      email: c.email,
      storagePath: c.storagePath,
      size: c.size,
      rows: c.rows,
      rowLengths: c.rowLengths,
      dtype: c.dtype,
      order: c.order,
      matrices: decodeRaggedFromBytes(c.matricesBytes, {
        rows: c.rows,
        rowLengths: c.rowLengths,
        dtype: c.dtype,
        order: c.order,
      }),
    })
  );

  final.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return final;
}
