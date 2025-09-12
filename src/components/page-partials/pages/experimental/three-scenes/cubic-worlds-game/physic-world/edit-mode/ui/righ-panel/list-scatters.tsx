import { useEffect, useRef, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectSeparator } from "@/components/ui/select";
import {
  deleteScatterFromStorage,
  renameScatterInStorage, // <— ДОДАЙ
} from "@/services/firebase/cubic-worlds-game/firestore-scatter-objects";
import {
  StatusServer,
  useEditModeStore,
} from "@components/page-partials/pages/experimental/three-scenes/cubic-worlds-game/store/useEditModeStore";
import { MousePointer, Trash2 } from "lucide-react";
import CheckTransformControl from "./check-transform-control";

const ListScatter = () => {
  const {
    scatters,
    onRemoveScatters,
    setIdEditScatter,
    idEditScatter,
    setIsDrawScatter,
    setStatusServer,
    // ДОДАЙ у стор: оновлення імені в локальному списку
    // onRenameScatter: (id: string, newName: string) => void
    onRenameScatter,
  } = useEditModeStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setDraft(currentName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const commitRename = async (id: string, oldName: string) => {
    const newName = draft.trim();
    cancelEdit();
    if (!newName || newName === oldName) {
      return;
    }
    try {
      setStatusServer(StatusServer.start);
      // ⚙️ переіменування у Storage (copy+delete)
      await renameScatterInStorage(oldName, newName);
      // 🔁 оновлюємо локальний стор/список
      onRenameScatter?.(id, newName);
    } catch (e) {
      console.error("Rename failed:", e);
      // можна показати тост
    } finally {
      setStatusServer(StatusServer.loaded);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <ScrollArea className="max-w-md rounded-md border mt-5 bg-background">
        <div className="p-4">
          <h4 className="mb-4 text-sm leading-none font-medium">
            Scatter Objects
          </h4>

          {scatters.map((scatter: { id: string; name: string }) => {
            const isEditing = editingId === scatter.id;
            return (
              <Fragment key={scatter.id}>
                <div className="flex gap-2 items-center justify-between">
                  {/* Назва / інпут перейменування */}
                  <div
                    className="flex-1 text-sm select-none"
                    onDoubleClick={() => startEdit(scatter.id, scatter.name)}
                    title="Double-click to rename"
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        className="w-full px-2 py-1 rounded border bg-background text-sm outline-none"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={() => commitRename(scatter.id, scatter.name)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            commitRename(scatter.id, scatter.name);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                    ) : (
                      <span>{scatter.name}</span>
                    )}
                  </div>

                  {/* Кнопки */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`size-6 ${
                        idEditScatter === scatter.id ? "bg-accent" : ""
                      }`}
                      onClick={() => {
                        if (idEditScatter === scatter.id) {
                          setIdEditScatter(null);
                        } else {
                          setIdEditScatter(scatter.id);
                          setIsDrawScatter(false);
                        }
                      }}
                    >
                      <MousePointer />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="size-6 bg-destructive"
                      onClick={() => {
                        setStatusServer(StatusServer.start);
                        deleteScatterFromStorage(scatter.name)
                          .then(() => {
                            onRemoveScatters(scatter.id);
                          })
                          .finally(() => setStatusServer(StatusServer.loaded));
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
                <SelectSeparator className="my-2" />
              </Fragment>
            );
          })}
        </div>
      </ScrollArea>
      {idEditScatter ? <CheckTransformControl /> : null}
    </div>
  );
};

export default ListScatter;
