import {
  auth,
  FirebaseCollection,
  FirebaseCollectionProps,
  storage, // ← один інстанс з конфігу
} from "@/config/firebase.config";

import {
  ref as sref,
  uploadBytes,
  getBytes,
  getMetadata,
  deleteObject,
  listAll,
} from "firebase/storage";
import { Matrix4 } from "three";
import {
  decodeRaggedFromBytes,
  encodeRaggedToBytes,
} from "@/components/page-partials/pages/experimental/three-scenes/cubic-worlds-game/utils/encode-decode-matrix";
import { waitForUserAuth } from "../userAthUtils";
import { sanitizeName } from "@/utils/string.util";
import { db } from "@/services/indexedDbDexie/db";
import { makeId } from "@/utils/db.util";

/* ================== Типи ================== */

export type ScatterManifest = {
  name: string;
  updatedAt: string;
  email: string | null;
  storagePath: string;
  size: number;
  rows: number;
  rowLengths: number[];
  dtype: "f64";
  order: "column-major";
};

export type ScatterWithData = ScatterManifest & {
  matrices: Matrix4[][];
};

export function scatterDocRef(uid: string, name: string) {
  return `${FirebaseCollection.cubicWorlds}/${uid}/${
    FirebaseCollectionProps[FirebaseCollection.cubicWorlds].scatters
  }/${sanitizeName(name)}.f64`;
}

export function scatterRef(uid: string) {
  return `${FirebaseCollection.cubicWorlds}/${uid}/${
    FirebaseCollectionProps[FirebaseCollection.cubicWorlds].scatters
  }`;
}

/* ============== SAVE ============== */

export const saveScatterToStorage = async (
  name: string,
  matrices: Matrix4[][]
) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No auth");

  const safe = sanitizeName(name);
  const { bytes, meta } = encodeRaggedToBytes(matrices);

  const path = scatterDocRef(uid, safe);
  const updatedAt = new Date().toISOString();

  await uploadBytes(sref(storage, path), bytes, {
    contentType: "application/octet-stream",
    customMetadata: {
      name: safe,
      email: auth.currentUser?.email ?? "",
      updatedAt,
      rows: String(meta.rows),
      rowLengths: JSON.stringify(meta.rowLengths),
      dtype: meta.dtype,
      order: meta.order,
    },
  });

  // 🔽 локальний кеш
  await db.scatters.put({
    id: makeId(uid, safe),
    uid,
    name: safe,
    updatedAt,
    email: auth.currentUser?.email ?? null,
    storagePath: path,
    size: bytes.byteLength,
    rows: meta.rows,
    rowLengths: meta.rowLengths,
    dtype: meta.dtype,
    order: meta.order,
    matricesBytes: bytes,
  });
};

/* ============== LOAD (один) ============== */

export async function listScatters(): Promise<ScatterWithData[]> {
  const user = await waitForUserAuth();
  if (!user) return [];

  const dirRef = sref(storage, scatterRef(user.uid));
  const page = await listAll(dirRef);

  const out = await Promise.all(
    page.items.map(async (itemRef) => {
      const md = await getMetadata(itemRef);
      const cm = md.customMetadata ?? {};
      const rows = Number(cm.rows ?? 0);
      const rowLengths = cm.rowLengths ? JSON.parse(cm.rowLengths) : [];
      const dtype = (cm.dtype ?? "f64") as "f64";
      const order = (cm.order ?? "column-major") as "column-major";
      const name = cm.name ?? itemRef.name.replace(/\.f64$/, "");
      const updatedAt = cm.updatedAt ?? md.updated ?? new Date().toISOString();
      const email = (cm.email ?? "") || null;

      const ab = await getBytes(itemRef);
      const matrices = decodeRaggedFromBytes(new Uint8Array(ab), {
        rows,
        rowLengths,
        dtype,
        order,
      });

      return {
        name,
        updatedAt,
        email,
        storagePath: itemRef.fullPath,
        size: md.size ?? ab.byteLength,
        rows,
        rowLengths,
        dtype,
        order,
        matrices,
      } as ScatterWithData;
    })
  );

  out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return out;
}

export async function deleteScatterFromStorage(name: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No auth");

  const path = scatterDocRef(uid, sanitizeName(name));
  await deleteObject(sref(storage, path));

  await db.scatters.delete(makeId(uid, name));
}

export async function renameScatterInStorage(
  oldName: string,
  newName: string
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("No auth");

  const fromId = sanitizeName(oldName);
  const toId = sanitizeName(newName);
  if (!fromId || !toId) throw new Error("Empty name");
  if (fromId === toId) return;

  const fromRef = sref(storage, scatterDocRef(uid, fromId));
  const toRef = sref(storage, scatterDocRef(uid, toId));

  const [meta, ab] = await Promise.all([
    getMetadata(fromRef),
    getBytes(fromRef),
  ]);
  const cm = meta.customMetadata ?? {};

  const updatedAt = new Date().toISOString();

  await uploadBytes(toRef, new Uint8Array(ab), {
    contentType: meta.contentType || "application/octet-stream",
    cacheControl:
      meta.cacheControl || "no-cache, no-store, max-age=0, must-revalidate",
    customMetadata: {
      ...cm,
      name: toId,
      updatedAt,
    },
  });

  await deleteObject(fromRef).catch(() => {});

  // 🔽 кеш: оновлюємо запис (переносимо айді та name)
  const old = await db.scatters.get(makeId(uid, fromId));
  if (old) {
    await db.scatters.delete(old.id);
    await db.scatters.put({
      ...old,
      id: makeId(uid, toId),
      name: toId,
      updatedAt,
      storagePath: scatterDocRef(uid, toId),
    });
  }
}
