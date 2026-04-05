import { useEffect, useMemo, useState } from "react";
import { ImageIcon, Trash2 } from "lucide-react";
import type { Project, ProjectPatchFn } from "../types/types";
import {
  buildProjectImageInventory,
  mergeProjectInventoryWithStoragePaths,
  removeProjectReferencesToStoragePath,
  type ProjectImageInventoryEntry,
  type ProjectImageReference,
} from "../media/project-image-inventory";
import {
  deleteNodeWriterStorageObjectsByPaths,
  listNodeWriterProjectImagePaths,
  resolveNodeWriterMediaUrlForDisplay,
} from "@/services/firebase/node-writer-workspace";
import { NODE_WRITER_WORKSPACE_SCOPE } from "@/config/node-writer-access.config";

function InventoryThumb({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    void resolveNodeWriterMediaUrlForDisplay(url).then((u) => {
      if (!cancelled) setSrc(u);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!src) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-muted/40">
        <ImageIcon className="size-8 text-muted-foreground/25" aria-hidden />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className="aspect-video w-full object-cover"
      loading="lazy"
    />
  );
}

function refBadgeClass(kind: ProjectImageReference["kind"]) {
  const stripe =
    kind === "orphan"
      ? "border-l-muted-foreground/40"
      : kind === "asset"
        ? "border-l-primary/45"
        : "border-l-primary/30";
  return `rounded-md border border-border/10 bg-muted/30 px-2 py-1 text-[10px] leading-snug text-muted-foreground border-l-2 ${stripe}`;
}

function entryIsStorageOnly(entry: ProjectImageInventoryEntry): boolean {
  return (
    entry.references.length > 0 &&
    entry.references.every((r) => r.kind === "orphan")
  );
}

interface AssetsViewProps {
  project: Project;
  onProjectPatch: (fn: ProjectPatchFn) => void;
}

const AssetsView = ({ project, onProjectPatch }: AssetsViewProps) => {
  const [storagePaths, setStoragePaths] = useState<string[] | undefined>(
    undefined,
  );
  const [storageRev, setStorageRev] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void listNodeWriterProjectImagePaths(
      NODE_WRITER_WORKSPACE_SCOPE,
      project.id,
    )
      .then((paths) => {
        if (!cancelled) setStoragePaths(paths);
      })
      .catch((err) => {
        console.warn("[Node writer] list project Storage", err);
        if (!cancelled) setStoragePaths([]);
      });
    return () => {
      cancelled = true;
    };
  }, [project.id, storageRev]);

  const entries = useMemo(() => {
    const doc = buildProjectImageInventory(project);
    const paths = storagePaths === undefined ? [] : storagePaths;
    return mergeProjectInventoryWithStoragePaths(
      doc,
      paths,
      project,
      NODE_WRITER_WORKSPACE_SCOPE,
    );
  }, [project, storagePaths]);

  const removeEntry = (entry: ProjectImageInventoryEntry) => {
    if (entryIsStorageOnly(entry)) {
      if (
        typeof window !== "undefined" &&
        !window.confirm(
          "Цей файл є лише в Storage (немає посилання в документі). Видалити його зі сховища?",
        )
      ) {
        return;
      }
      void deleteNodeWriterStorageObjectsByPaths(
        [entry.storagePath],
        project.id,
        NODE_WRITER_WORKSPACE_SCOPE,
      ).then(() => setStorageRev((k) => k + 1));
      return;
    }
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Видалити це зображення з Firebase Storage і прибрати всі посилання в документі (ноди, полотно, слайди, бібліотека)?",
      )
    ) {
      return;
    }
    onProjectPatch((p) =>
      removeProjectReferencesToStoragePath(p, entry.storagePath),
    );
  };

  const storageListedCount = storagePaths?.length;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-y-auto px-4 py-6 pb-24 md:px-8">
      <header className="mb-8 shrink-0 border-b border-border/25 pb-6">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Медіа в документі
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Усі зображення з папки цього проєкту в Firebase Storage, злиті з
          посиланнями в документі. Файли лише в сховищі (без посилання в
          Firestore) показані окремо.
        </p>
        <p className="mono mt-3 text-[10px] text-muted-foreground/80">
          {storagePaths === undefined
            ? "Завантаження списку з Storage…"
            : `Файлів у Storage: ${storageListedCount ?? 0} · У списку: ${entries.length}`}
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-24 text-center">
          <ImageIcon className="mb-3 size-10 text-muted-foreground/25" aria-hidden />
          <p className="text-[13px] text-muted-foreground">
            Немає зображень у папці проєкту в Storage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) => (
            <article
              key={entry.storagePath}
              className="flex flex-col overflow-hidden rounded-xl border border-border/15 bg-card/90 shadow-sm ring-1 ring-border/10"
            >
              <div className="overflow-hidden rounded-t-xl border-b border-border/10">
                <InventoryThumb url={entry.previewUrl} />
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
                <p className="mono break-all text-[9px] leading-snug text-muted-foreground/80">
                  {entry.storagePath}
                </p>
                <ul className="flex min-w-0 flex-col gap-1.5">
                  {entry.references.map((r, i) => (
                    <li
                      key={`${r.kind}-${i}-${r.label}`}
                      className={refBadgeClass(r.kind)}
                    >
                      {r.label}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => removeEntry(entry)}
                  className="mono mt-auto flex items-center justify-center gap-2 rounded-lg border border-border/20 bg-muted/40 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:border-destructive/25 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5 shrink-0" aria-hidden />
                  {entryIsStorageOnly(entry)
                    ? "Видалити зі сховища"
                    : "Видалити зі сховища та з документа"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetsView;
