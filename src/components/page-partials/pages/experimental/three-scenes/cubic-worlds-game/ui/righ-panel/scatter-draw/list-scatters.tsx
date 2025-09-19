import { useEffect, useRef, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectSeparator } from "@/components/ui/select";
import {
  deleteScatterFromStorage,
  renameScatterInStorage,
} from "@/services/firebase/cubic-worlds-game/firestore-scatter-objects";
import {
  EditModeAction,
  StatusServer,
  useEditModeStore,
} from "@components/page-partials/pages/experimental/three-scenes/cubic-worlds-game/store/useEditModeStore";
import { MousePointer, Trash2 } from "lucide-react";
import CheckTransformControl from "../check-transform-control";

const ListScatter = () => {
  const {
    instances,
    onRemoveInstnaces,
    setIdEditInstance,
    idEditInstance,
    setStatusServer,
    onRenameScatter,
    setEditModeAction,
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
      <ScrollArea className="max-w-md rounded-md border mt-5">
        <div className="p-4">
          <h4 className="mb-4 text-md text-muted-foreground leading-none font-medium">
            Scatter Objects
          </h4>

          {instances.map((instance: { id: string; name: string }) => {
            const isEditing = editingId === instance.id;
            return (
              <Fragment key={instance.id}>
                <div className="flex gap-2 items-center justify-between">
                  {/* Назва / інпут перейменування */}
                  <div
                    className="flex-1 text-sm select-none"
                    onDoubleClick={() => startEdit(instance.id, instance.name)}
                    title="Double-click to rename"
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        className="w-full px-2 py-1 rounded border bg-background text-sm outline-none"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={() => commitRename(instance.id, instance.name)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            commitRename(instance.id, instance.name);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                    ) : (
                      <span className="text-muted-foreground">
                        {instance.name}
                      </span>
                    )}
                  </div>

                  {/* Кнопки */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`size-6 ${
                        idEditInstance === instance.id ? "bg-accent" : ""
                      }`}
                      onClick={() => {
                        if (idEditInstance === instance.id) {
                          setIdEditInstance(null);
                          setEditModeAction(EditModeAction.none);
                        } else {
                          setIdEditInstance(instance.id);
                          setEditModeAction(EditModeAction.editScatter);
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
                        deleteScatterFromStorage(instance.name)
                          .then(() => {
                            onRemoveInstnaces(instance.id);
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
      {idEditInstance ? <CheckTransformControl /> : null}
    </div>
  );
};

export default ListScatter;
