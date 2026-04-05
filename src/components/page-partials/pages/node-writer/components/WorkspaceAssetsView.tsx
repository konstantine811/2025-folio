import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageIcon, Trash2 } from "lucide-react";
import type { Project, ProjectPatchFn } from "../types/types";
import {
  buildWorkspaceImageInventory,
  mergeWorkspaceInventoryWithStoragePaths,
  removeProjectReferencesToStoragePath,
  type ProjectImageReference,
  type WorkspaceImageEntry,
  type WorkspaceImageSource,
} from "../media/project-image-inventory";
import {
  deleteNodeWriterStorageObjectsByPaths,
  listAllNodeWriterWorkspaceImagePaths,
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

/** Джерело посилання — нейтральні кольори теми, ледь помітна смуга зліва. */
function refBadgeClass(kind: ProjectImageReference["kind"]) {
  const stripe =
    kind === "orphan"
      ? "border-l-muted-foreground/40"
      : kind === "asset"
        ? "border-l-primary/45"
        : "border-l-primary/30";
  return `rounded-md border border-border/10 bg-muted/30 px-2 py-1 text-[10px] leading-snug text-muted-foreground border-l-2 ${stripe}`;
}

function sourceIsStorageOnly(source: WorkspaceImageSource): boolean {
  return (
    source.references.length > 0 &&
    source.references.every((r) => r.kind === "orphan")
  );
}

interface WorkspaceAssetsViewProps {
  projects: Project[];
  onPatchProjectById: (projectId: string, fn: ProjectPatchFn) => void;
}

const WorkspaceAssetsView = ({
  projects,
  onPatchProjectById,
}: WorkspaceAssetsViewProps) => {
  const [storagePaths, setStoragePaths] = useState<string[] | undefined>(
    undefined,
  );
  const [storageRev, setStorageRev] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void listAllNodeWriterWorkspaceImagePaths(NODE_WRITER_WORKSPACE_SCOPE)
      .then((paths) => {
        if (!cancelled) setStoragePaths(paths);
      })
      .catch((err) => {
        console.warn("[Node writer] list Storage", err);
        if (!cancelled) setStoragePaths([]);
      });
    return () => {
      cancelled = true;
    };
  }, [storageRev]);

  const entries = useMemo(() => {
    const doc = buildWorkspaceImageInventory(projects);
    const paths = storagePaths === undefined ? [] : storagePaths;
    return mergeWorkspaceInventoryWithStoragePaths(
      doc,
      paths,
      projects,
      NODE_WRITER_WORKSPACE_SCOPE,
    );
  }, [projects, storagePaths]);

  const removeFromDocument = (
    entry: WorkspaceImageEntry,
    projectId: string,
    projectTitle: string,
  ) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Прибрати це зображення з документа «${projectTitle}»? Якщо воно не згадується в інших документах, файл буде видалено з Firebase Storage.`,
      )
    ) {
      return;
    }
    onPatchProjectById(projectId, (p) =>
      removeProjectReferencesToStoragePath(p, entry.storagePath),
    );
  };

  const deleteOrphanOnly = useCallback(
    async (entry: WorkspaceImageEntry, projectId: string) => {
      if (
        typeof window !== "undefined" &&
        !window.confirm(
          "Цей файл є лише в Storage (немає посилання в документі). Видалити його зі сховища?",
        )
      ) {
        return;
      }
      await deleteNodeWriterStorageObjectsByPaths(
        [entry.storagePath],
        projectId,
        NODE_WRITER_WORKSPACE_SCOPE,
      );
      setStorageRev((k) => k + 1);
    },
    [],
  );

  const storageListedCount = storagePaths?.length;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-y-auto px-4 py-6 pb-24 md:px-8">
      <header className="mb-8 shrink-0 border-b border-border/25 pb-6">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Усі медіа в робочій області
        </h2>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Показуються усі зображення з папок проєктів у Firebase Storage (
          <code className="mono text-[11px]">node-writer/shared/projects/…</code>
          ), злиті з посиланнями з документів. Файли лише в сховищі (без запису в
          Firestore) позначені окремо — їх можна прибрати тільки видаленням з
          Storage.
        </p>
        <p className="mono mt-3 text-[10px] text-muted-foreground/80">
          Документів: {projects.length}
          {storagePaths === undefined
            ? " · Завантаження списку з Storage…"
            : ` · Файлів у Storage: ${storageListedCount ?? 0} · Унікальних у списку: ${entries.length}`}
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/30 py-24 text-center">
          <ImageIcon className="mb-3 size-10 text-muted-foreground/25" aria-hidden />
          <p className="text-[13px] text-muted-foreground">
            Немає зображень у папках проєктів у Storage.
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
              <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
                <p className="mono break-all text-[9px] leading-snug text-muted-foreground/80">
                  {entry.storagePath}
                </p>
                <div className="flex flex-col gap-3">
                  {entry.sources.map((source) => (
                    <div
                      key={source.projectId}
                      className="rounded-lg border border-border/12 bg-muted/25 p-3"
                    >
                      <p className="mb-2 font-sans text-[11px] font-semibold text-foreground">
                        {source.projectTitle}
                      </p>
                      <ul className="mb-3 flex min-w-0 flex-col gap-1.5">
                        {source.references.map((r, i) => (
                          <li
                            key={`${r.kind}-${i}-${r.label}`}
                            className={refBadgeClass(r.kind)}
                          >
                            {r.label}
                          </li>
                        ))}
                      </ul>
                      {sourceIsStorageOnly(source) ? (
                        <button
                          type="button"
                          onClick={() =>
                            void deleteOrphanOnly(entry, source.projectId)
                          }
                          className="mono flex w-full items-center justify-center gap-2 rounded-lg border border-border/20 bg-muted/40 px-2 py-1.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:border-border/40 hover:bg-muted hover:text-foreground"
                        >
                          <Trash2 className="size-3 shrink-0" aria-hidden />
                          Видалити зі сховища
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            removeFromDocument(
                              entry,
                              source.projectId,
                              source.projectTitle,
                            )
                          }
                          className="mono flex w-full items-center justify-center gap-2 rounded-lg border border-border/20 bg-muted/40 px-2 py-1.5 text-[9px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:border-destructive/25 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-3 shrink-0" aria-hidden />
                          Прибрати з цього документа
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkspaceAssetsView;
