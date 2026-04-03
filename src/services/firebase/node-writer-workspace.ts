/**
 * Node Writer → Firestore: `node-writer/shared/folders|projects` (спільний workspace).
 * Медіа → `node-writer/shared/projects/{projectId}/…`.
 * Права: `firestore.rules`, `storage.rules`.
 */
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
  type StorageReference,
} from "firebase/storage";
import { db, FirebaseCollection, storage } from "@/config/firebase.config";
import type {
  Asset,
  CanvasImageItem,
  Project,
  WorkspaceFolder,
} from "@/components/page-partials/pages/node-writer/types/types";

const FOLDERS = "folders";
const PROJECTS = "projects";

/** Префікс у Firestore для шляху в Storage (не плутати з публічним URL). */
export const NODE_WRITER_STORAGE_PREFIX = "nw-storage:";

export function isNodeWriterStorageRef(url: string): boolean {
  return url.startsWith(NODE_WRITER_STORAGE_PREFIX);
}

export function nodeWriterPathFromRef(url: string): string {
  return url.slice(NODE_WRITER_STORAGE_PREFIX.length);
}

export function nodeWriterRefFromPath(storagePath: string): string {
  return `${NODE_WRITER_STORAGE_PREFIX}${storagePath}`;
}

/** `workspaceScope` зазвичай `shared` (див. `NODE_WRITER_WORKSPACE_SCOPE`). */
export function nodeWriterFoldersRef(workspaceScope: string) {
  return collection(db, FirebaseCollection.nodeWriter, workspaceScope, FOLDERS);
}

export function nodeWriterProjectsRef(workspaceScope: string) {
  return collection(db, FirebaseCollection.nodeWriter, workspaceScope, PROJECTS);
}

function sanitizeStorageKey(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function extFromMime(mime: string): string {
  const m = (mime || "").toLowerCase();
  if (m.includes("png")) return "png";
  if (m.includes("jpeg") || m.includes("jpg")) return "jpg";
  if (m.includes("webp")) return "webp";
  if (m.includes("gif")) return "gif";
  if (m.includes("svg")) return "svg";
  return "bin";
}

/** Рекурсивно видаляє всі об'єкти під префіксом (для папки проєкту в Storage). */
async function deleteStorageTree(root: StorageReference): Promise<void> {
  const page = await listAll(root);
  await Promise.all(page.items.map((item) => deleteObject(item)));
  await Promise.all(page.prefixes.map((p) => deleteStorageTree(p)));
}

export async function deleteNodeWriterProjectMedia(
  workspaceScope: string,
  projectId: string,
): Promise<void> {
  const path = `node-writer/${workspaceScope}/projects/${projectId}`;
  try {
    await deleteStorageTree(ref(storage, path));
  } catch {
    /* префікс може не існувати */
  }
}

/**
 * Завантажує вставлене з буфера зображення в Storage одразу (поки `File` ще валідний).
 * Повертає https URL для `<img src>`; у Firestore при синку він згортається в `nw-storage:`.
 */
export async function uploadNodeWriterCanvasPastedFile(
  workspaceScope: string,
  projectId: string,
  canvasImageId: string,
  file: Blob,
): Promise<string> {
  const ext = extFromMime(file.type || "");
  const base = `canvas_${sanitizeStorageKey(canvasImageId)}`;
  const path = `node-writer/${workspaceScope}/projects/${projectId}/${base}.${ext}`;
  const sRef = ref(storage, path);
  await uploadBytes(sRef, file, {
    contentType: file.type || "application/octet-stream",
  });
  return getDownloadURL(sRef);
}

/** XHR інколи читає `blob:` там, де `fetch` падає з TypeError (розширення, відкликаний контекст тощо). */
function blobFromUrlXHR(url: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "blob";
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
          resolve(xhr.response);
        } else {
          resolve(null);
        }
      };
      xhr.onerror = () => resolve(null);
      xhr.send();
    } catch {
      resolve(null);
    }
  });
}

/** Останній вихід для картинки: малюємо в canvas → PNG (працює для багатьох `blob:`). */
function blobFromImageUrlViaCanvas(url: string): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (w <= 0 || h <= 0) {
          resolve(null);
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((b) => resolve(b), "image/png");
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function blobFromUrl(url: string): Promise<Blob | null> {
  if (!url) return null;
  if (!url.startsWith("blob:") && !url.startsWith("data:")) {
    return null;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    /* fetch(blob:) інколи дає TypeError: Failed to fetch */
  }

  const xhrBlob = await blobFromUrlXHR(url);
  if (xhrBlob && xhrBlob.size > 0) return xhrBlob;

  if (url.startsWith("blob:") || url.startsWith("data:")) {
    const fromCanvas = await blobFromImageUrlViaCanvas(url);
    if (fromCanvas && fromCanvas.size > 0) return fromCanvas;
  }

  return null;
}

/**
 * Після `getDownloadURL` у стані лежить https; перед записом у Firestore повертаємо `nw-storage:path`.
 */
export function firebaseDownloadUrlToNwRef(url: string): string | null {
  if (!url.startsWith("https://")) return null;
  try {
    const u = new URL(url);
    if (
      !u.hostname.includes("firebasestorage.googleapis.com") &&
      !u.hostname.includes("storage.googleapis.com")
    ) {
      return null;
    }
    const i = u.pathname.indexOf("/o/");
    if (i < 0) return null;
    const encoded = u.pathname.slice(i + 3);
    const path = decodeURIComponent(encoded.split("?")[0]);
    if (!path.startsWith("node-writer/")) return null;
    return nodeWriterRefFromPath(path);
  } catch {
    return null;
  }
}

/**
 * Локальний blob/data → upload; уже `nw-storage:` → без змін;
 * https з нашого Storage → назад у `nw-storage:` (без повторного upload);
 * інші http(s) → без змін.
 */
async function mediaUrlToStoragePath(
  workspaceScope: string,
  projectId: string,
  fileBase: string,
  url: string,
): Promise<string> {
  if (!url) return url;
  if (isNodeWriterStorageRef(url)) return url;
  const roundTrip = firebaseDownloadUrlToNwRef(url);
  if (roundTrip) return roundTrip;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const blob = await blobFromUrl(url);
  if (!blob) {
    return url;
  }

  const ext = extFromMime(blob.type);
  const path = `node-writer/${workspaceScope}/projects/${projectId}/${fileBase}.${ext}`;
  const sRef = ref(storage, path);
  try {
    await uploadBytes(sRef, blob, {
      contentType: blob.type || "application/octet-stream",
    });
  } catch (e) {
    console.warn(
      "[Node writer] uploadBytes не вдався; залишаємо поточний URL у документі.",
      fileBase,
      e,
    );
    return url;
  }
  return nodeWriterRefFromPath(path);
}

async function embedCanvasImages(
  items: CanvasImageItem[],
  workspaceScope: string,
  projectId: string,
): Promise<CanvasImageItem[]> {
  const pairs = await Promise.all(
    items.map(async (img) => {
      const url = await mediaUrlToStoragePath(
        workspaceScope,
        projectId,
        `canvas_${sanitizeStorageKey(img.id)}`,
        img.url,
      );
      return { img, url };
    }),
  );
  const kept = pairs.filter((p) => !p.url.startsWith("blob:"));
  const dropped = pairs.length - kept.length;
  if (dropped > 0) {
    console.warn(
      `[Node writer] ${dropped} зображ. на полотні пропущено при збереженні (мертві blob: URL — зазвичай після перезавантаження; перевставте). Проєкт: ${projectId}`,
    );
  }
  return kept.map(({ img, url }) => ({ ...img, url }));
}

async function embedNodes(
  nodes: Project["nodes"],
  workspaceScope: string,
  projectId: string,
): Promise<Project["nodes"]> {
  let droppedNodeImages = 0;
  const out = await Promise.all(
    nodes.map(async (n) => {
      if (!n.imageUrl) return n;
      const next = await mediaUrlToStoragePath(
        workspaceScope,
        projectId,
        `node_${sanitizeStorageKey(n.id)}`,
        n.imageUrl,
      );
      if (next.startsWith("blob:")) {
        droppedNodeImages++;
        const { imageUrl: _removed, ...rest } = n;
        return rest as typeof n;
      }
      return next === n.imageUrl ? n : { ...n, imageUrl: next };
    }),
  );
  if (droppedNodeImages > 0) {
    console.warn(
      `[Node writer] ${droppedNodeImages} зображ. у нодах знято з payload (мертві blob:). Проєкт: ${projectId}`,
    );
  }
  return out;
}

async function embedAssets(
  assets: Asset[],
  workspaceScope: string,
  projectId: string,
): Promise<Asset[]> {
  const pairs = await Promise.all(
    assets.map(async (a) => ({
      a,
      url: await mediaUrlToStoragePath(
        workspaceScope,
        projectId,
        `asset_${sanitizeStorageKey(a.id)}`,
        a.url,
      ),
    })),
  );
  const kept = pairs.filter((p) => !p.url.startsWith("blob:"));
  const dropped = pairs.length - kept.length;
  if (dropped > 0) {
    console.warn(
      `[Node writer] ${dropped} асетів пропущено (мертві blob:). Проєкт: ${projectId}`,
    );
  }
  return kept.map(({ a, url }) => ({ ...a, url }));
}

export async function prepareProjectForFirestore(
  project: Project,
  workspaceScope: string,
): Promise<Omit<Project, "id">> {
  const [canvasImages, nodes, images] = await Promise.all([
    embedCanvasImages(project.canvasImages, workspaceScope, project.id),
    embedNodes(project.nodes, workspaceScope, project.id),
    embedAssets(project.images, workspaceScope, project.id),
  ]);
  const { id: _id, ...rest } = project;
  return {
    ...rest,
    canvasImages,
    nodes,
    images,
  };
}

/**
 * Свіжий URL для `<img src>`: `nw-storage:` або застарілий https з нашого Firebase Storage
 * (токен у query згорає — треба знову взяти getDownloadURL по шляху).
 */
export async function resolveNodeWriterMediaUrlForDisplay(
  url: string,
): Promise<string> {
  if (!url) return url;
  if (isNodeWriterStorageRef(url)) {
    try {
      return await getDownloadURL(ref(storage, nodeWriterPathFromRef(url)));
    } catch {
      return url;
    }
  }
  const nw = firebaseDownloadUrlToNwRef(url);
  if (nw) {
    try {
      return await getDownloadURL(ref(storage, nodeWriterPathFromRef(nw)));
    } catch {
      return url;
    }
  }
  return url;
}

async function resolveUrlForDisplay(url: string): Promise<string> {
  return resolveNodeWriterMediaUrlForDisplay(url);
}

/**
 * Для localStorage: не кешувати довгі https з токеном — лише `nw-storage:path` (без терміну дії).
 */
export function toPersistableNodeWriterMediaUrl(url: string): string {
  if (!url) return url;
  if (isNodeWriterStorageRef(url)) return url;
  const nw = firebaseDownloadUrlToNwRef(url);
  return nw ?? url;
}

export async function resolveProjectMediaUrls(project: Project): Promise<Project> {
  const [canvasImages, nodes, images] = await Promise.all([
    Promise.all(
      project.canvasImages.map(async (img) => ({
        ...img,
        url: await resolveUrlForDisplay(img.url),
      })),
    ),
    Promise.all(
      project.nodes.map(async (n) => {
        if (!n.imageUrl) return n;
        const u = await resolveUrlForDisplay(n.imageUrl);
        return u === n.imageUrl ? n : { ...n, imageUrl: u };
      }),
    ),
    Promise.all(
      project.images.map(async (a) => ({
        ...a,
        url: await resolveUrlForDisplay(a.url),
      })),
    ),
  ]);
  return { ...project, canvasImages, nodes, images };
}

function firestoreSafe<T extends Record<string, unknown>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

const BATCH_LIMIT = 450;

async function commitInChunks(
  ops: Array<{ type: "set" | "delete"; ref: ReturnType<typeof doc>; data?: unknown }>,
) {
  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const slice = ops.slice(i, i + BATCH_LIMIT);
    const batch = writeBatch(db);
    for (const op of slice) {
      if (op.type === "delete") {
        batch.delete(op.ref);
      } else {
        batch.set(op.ref, firestoreSafe(op.data as Record<string, unknown>));
      }
    }
    await batch.commit();
  }
}

/** Повна синхронізація: видалення зайвого на сервері + усі set (лише для адміна). */
async function syncWorkspaceFullAdmin(
  workspaceScope: string,
  folders: WorkspaceFolder[],
  projects: Project[],
): Promise<void> {
  const fCol = nodeWriterFoldersRef(workspaceScope);
  const pCol = nodeWriterProjectsRef(workspaceScope);

  const [fSnap, pSnap] = await Promise.all([getDocs(fCol), getDocs(pCol)]);

  const localFolderIds = new Set(folders.map((f) => f.id));
  const localProjectIds = new Set(projects.map((p) => p.id));

  const removedProjectIds = pSnap.docs
    .map((d) => d.id)
    .filter((id) => !localProjectIds.has(id));

  await Promise.all(
    removedProjectIds.map((id) =>
      deleteNodeWriterProjectMedia(workspaceScope, id),
    ),
  );

  const ops: Array<{
    type: "set" | "delete";
    ref: ReturnType<typeof doc>;
    data?: unknown;
  }> = [];

  fSnap.docs.forEach((d) => {
    if (!localFolderIds.has(d.id)) {
      ops.push({ type: "delete", ref: d.ref });
    }
  });
  pSnap.docs.forEach((d) => {
    if (!localProjectIds.has(d.id)) {
      ops.push({ type: "delete", ref: d.ref });
    }
  });

  for (const f of folders) {
    const { id, ...payload } = f;
    ops.push({
      type: "set",
      ref: doc(fCol, id),
      data: firestoreSafe(payload as unknown as Record<string, unknown>),
    });
  }

  for (const p of projects) {
    const payload = await prepareProjectForFirestore(p, workspaceScope);
    ops.push({
      type: "set",
      ref: doc(pCol, p.id),
      data: firestoreSafe(payload as unknown as Record<string, unknown>),
    });
  }

  await commitInChunks(ops);
}

/** Лише **create** нових id (без update/delete існуючих) — для не-адмінів за правилами Firestore. */
async function syncWorkspaceNewItemsOnly(
  workspaceScope: string,
  folders: WorkspaceFolder[],
  projects: Project[],
): Promise<void> {
  const fCol = nodeWriterFoldersRef(workspaceScope);
  const pCol = nodeWriterProjectsRef(workspaceScope);
  const [fSnap, pSnap] = await Promise.all([getDocs(fCol), getDocs(pCol)]);
  const serverFolderIds = new Set(fSnap.docs.map((d) => d.id));
  const serverProjectIds = new Set(pSnap.docs.map((d) => d.id));

  const ops: Array<{
    type: "set" | "delete";
    ref: ReturnType<typeof doc>;
    data?: unknown;
  }> = [];

  for (const f of folders) {
    if (!serverFolderIds.has(f.id)) {
      const { id, ...payload } = f;
      ops.push({
        type: "set",
        ref: doc(fCol, id),
        data: firestoreSafe(payload as unknown as Record<string, unknown>),
      });
    }
  }

  for (const p of projects) {
    if (!serverProjectIds.has(p.id)) {
      const payload = await prepareProjectForFirestore(p, workspaceScope);
      ops.push({
        type: "set",
        ref: doc(pCol, p.id),
        data: firestoreSafe(payload as unknown as Record<string, unknown>),
      });
    }
  }

  if (ops.length > 0) {
    await commitInChunks(ops);
  }
}

export async function syncWorkspaceToFirestore(
  workspaceScope: string,
  folders: WorkspaceFolder[],
  projects: Project[],
  fullAdminSync: boolean,
): Promise<void> {
  if (fullAdminSync) {
    await syncWorkspaceFullAdmin(workspaceScope, folders, projects);
  } else {
    await syncWorkspaceNewItemsOnly(workspaceScope, folders, projects);
  }
}

export async function loadWorkspaceFromFirestore(workspaceScope: string): Promise<{
  folders: WorkspaceFolder[];
  projects: Project[];
}> {
  const [fSnap, pSnap] = await Promise.all([
    getDocs(nodeWriterFoldersRef(workspaceScope)),
    getDocs(nodeWriterProjectsRef(workspaceScope)),
  ]);

  const folders: WorkspaceFolder[] = fSnap.docs.map((d) => {
    const data = d.data() as Partial<Omit<WorkspaceFolder, "id">>;
    const row: WorkspaceFolder = {
      id: d.id,
      parentId: data.parentId ?? null,
      title: data.title ?? "",
      sortOrder: data.sortOrder ?? 0,
    };
    if (data.titleColor != null && data.titleColor !== "") {
      row.titleColor = data.titleColor;
    }
    return row;
  });

  const projectsRaw: Project[] = pSnap.docs.map((d) => {
    const data = d.data() as Partial<Omit<Project, "id">>;
    return {
      id: d.id,
      title: data.title ?? "",
      content: data.content ?? "",
      nodes: data.nodes ?? [],
      links: data.links ?? [],
      canvasImages: data.canvasImages ?? [],
      slides: data.slides ?? [],
      images: data.images ?? [],
      lastModified: data.lastModified ?? Date.now(),
      folderId: data.folderId ?? null,
      workspaceOrder: data.workspaceOrder ?? 0,
    };
  });

  const projects = await Promise.all(
    projectsRaw.map((p) => resolveProjectMediaUrls(p)),
  );

  return { folders, projects };
}
