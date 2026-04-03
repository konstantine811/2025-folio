/**
 * Node Writer → Firestore: `node-writer/{uid}/folders|projects`.
 * Медіа → Firebase Storage за шляхом `node-writer/{uid}/projects/{projectId}/…`;
 * у Firestore у полях `url` / `imageUrl` зберігається посилання виду `nw-storage:<path>` (path без gs://).
 * Зовнішні http(s) та старі data: лишаються як є; при наступному збереженні data/blob підуть у Storage.
 * Правила: `firestore.rules`, `storage.rules`.
 */
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
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

export function nodeWriterFoldersRef(uid: string) {
  return collection(db, FirebaseCollection.nodeWriter, uid, FOLDERS);
}

export function nodeWriterProjectsRef(uid: string) {
  return collection(db, FirebaseCollection.nodeWriter, uid, PROJECTS);
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
  uid: string,
  projectId: string,
): Promise<void> {
  const path = `node-writer/${uid}/projects/${projectId}`;
  try {
    await deleteStorageTree(ref(storage, path));
  } catch {
    /* префікс може не існувати */
  }
}

async function blobFromUrl(url: string): Promise<Blob | null> {
  if (!url) return null;
  if (url.startsWith("blob:") || url.startsWith("data:")) {
    const res = await fetch(url);
    return res.blob();
  }
  return null;
}

/**
 * Після `getDownloadURL` у стані лежить https; перед записом у Firestore повертаємо `nw-storage:path`.
 */
function firebaseDownloadUrlToNwRef(url: string): string | null {
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
  uid: string,
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
  if (!blob) return url;

  const ext = extFromMime(blob.type);
  const path = `node-writer/${uid}/projects/${projectId}/${fileBase}.${ext}`;
  const sRef = ref(storage, path);
  await uploadBytes(sRef, blob, {
    contentType: blob.type || "application/octet-stream",
  });
  return nodeWriterRefFromPath(path);
}

async function embedCanvasImages(
  items: CanvasImageItem[],
  uid: string,
  projectId: string,
): Promise<CanvasImageItem[]> {
  return Promise.all(
    items.map(async (img) => ({
      ...img,
      url: await mediaUrlToStoragePath(
        uid,
        projectId,
        `canvas_${sanitizeStorageKey(img.id)}`,
        img.url,
      ),
    })),
  );
}

async function embedNodes(
  nodes: Project["nodes"],
  uid: string,
  projectId: string,
): Promise<Project["nodes"]> {
  return Promise.all(
    nodes.map(async (n) => {
      if (!n.imageUrl) return n;
      const next = await mediaUrlToStoragePath(
        uid,
        projectId,
        `node_${sanitizeStorageKey(n.id)}`,
        n.imageUrl,
      );
      return next === n.imageUrl ? n : { ...n, imageUrl: next };
    }),
  );
}

async function embedAssets(
  assets: Asset[],
  uid: string,
  projectId: string,
): Promise<Asset[]> {
  return Promise.all(
    assets.map(async (a) => ({
      ...a,
      url: await mediaUrlToStoragePath(
        uid,
        projectId,
        `asset_${sanitizeStorageKey(a.id)}`,
        a.url,
      ),
    })),
  );
}

export async function prepareProjectForFirestore(
  project: Project,
  uid: string,
): Promise<Omit<Project, "id">> {
  const [canvasImages, nodes, images] = await Promise.all([
    embedCanvasImages(project.canvasImages, uid, project.id),
    embedNodes(project.nodes, uid, project.id),
    embedAssets(project.images, uid, project.id),
  ]);
  const { id: _id, ...rest } = project;
  return {
    ...rest,
    canvasImages,
    nodes,
    images,
  };
}

async function resolveUrlForDisplay(url: string): Promise<string> {
  if (!url) return url;
  if (isNodeWriterStorageRef(url)) {
    return getDownloadURL(ref(storage, nodeWriterPathFromRef(url)));
  }
  return url;
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

export async function syncWorkspaceToFirestore(
  uid: string,
  folders: WorkspaceFolder[],
  projects: Project[],
): Promise<void> {
  const fCol = nodeWriterFoldersRef(uid);
  const pCol = nodeWriterProjectsRef(uid);

  const [fSnap, pSnap] = await Promise.all([getDocs(fCol), getDocs(pCol)]);

  const localFolderIds = new Set(folders.map((f) => f.id));
  const localProjectIds = new Set(projects.map((p) => p.id));

  const removedProjectIds = pSnap.docs
    .map((d) => d.id)
    .filter((id) => !localProjectIds.has(id));

  await Promise.all(
    removedProjectIds.map((id) => deleteNodeWriterProjectMedia(uid, id)),
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
    const payload = await prepareProjectForFirestore(p, uid);
    ops.push({
      type: "set",
      ref: doc(pCol, p.id),
      data: firestoreSafe(payload as unknown as Record<string, unknown>),
    });
  }

  await commitInChunks(ops);
}

export async function loadWorkspaceFromFirestore(uid: string): Promise<{
  folders: WorkspaceFolder[];
  projects: Project[];
}> {
  const [fSnap, pSnap] = await Promise.all([
    getDocs(nodeWriterFoldersRef(uid)),
    getDocs(nodeWriterProjectsRef(uid)),
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
