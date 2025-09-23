import {
  Tree,
  getBackendOptions,
  MultiBackend,
  type NodeModel,
} from "@minoru/react-dnd-treeview";
import { DndProvider } from "react-dnd";
import { useState } from "react";

// ---- тип метаданих вузла
type Meta = {
  type: "group" | "item";
  info?: string; // додаткова інфа для item
};

// ---- початкові дані: group = droppable: true, item = droppable: false
const initialData: NodeModel<Meta>[] = [
  {
    id: 1,
    parent: 0,
    text: "Folder 1",
    droppable: true,
    data: { type: "group" },
  },
  {
    id: 2,
    parent: 1,
    text: "Doc 1-1.md",
    droppable: false,
    data: { type: "item", info: "Опис документу 1-1" },
  },
  {
    id: 3,
    parent: 1,
    text: "Doc 1-2.md",
    droppable: false,
    data: { type: "item", info: "Опис документу 1-2" },
  },
  {
    id: 4,
    parent: 0,
    text: "Folder 2",
    droppable: true,
    data: { type: "group" },
  },
  {
    id: 5,
    parent: 4,
    text: "Folder 2-1",
    droppable: true,
    data: { type: "group" },
  },
  {
    id: 6,
    parent: 5,
    text: "Spec.pdf",
    droppable: false,
    data: { type: "item", info: "PDF специфікація" },
  },
];

export default function TreeViewModel() {
  const [treeData, setTreeData] = useState<NodeModel<Meta>[]>(initialData);
  const [selected, setSelected] = useState<NodeModel<Meta> | null>(null);

  return (
    <div>
      <DndProvider backend={MultiBackend} options={getBackendOptions()}>
        <Tree<Meta>
          tree={treeData}
          rootId={0}
          onDrop={(newTree) => setTreeData(newTree)}
          // тільки в корінь або в group
          canDrop={(_, { dropTargetId, dropTarget }) =>
            dropTargetId === 0 ||
            (dropTarget &&
              dropTarget.droppable &&
              dropTarget.data?.type === "group")
          }
          // ручне сортування + зручний плейсхолдер між елементами
          sort={false}
          insertDroppableFirst={false}
          dropTargetOffset={6}
          placeholderRender={(_, { depth }) => (
            <div
              style={{
                marginLeft: depth * 12,
                height: 2,
                background: "currentColor",
                opacity: 0.35,
              }}
            />
          )}
          // трохи простору для дропа в корінь
          rootProps={{ style: { paddingTop: 8, paddingBottom: 8 } }}
          render={(node, { depth, isOpen, onToggle }) => {
            const isGroup = node.data?.type === "group";
            return (
              <div
                style={{
                  marginLeft: depth * 12,
                  padding: "4px 6px",
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  background:
                    selected?.id === node.id
                      ? "rgba(0,0,0,0.06)"
                      : "transparent",
                }}
                onClick={() => setSelected(node)}
              >
                {/* Тригер розкриття тільки для груп */}
                {isGroup ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle();
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      width: 20,
                      height: 20,
                      lineHeight: "20px",
                      cursor: "pointer",
                    }}
                    title={isOpen ? "Закрити" : "Відкрити"}
                  >
                    {isOpen ? "📂" : "📁"}
                  </button>
                ) : (
                  <span style={{ width: 20, textAlign: "center" }}>📄</span>
                )}

                <span>{node.text}</span>

                {/* бейдж типу справа */}
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    opacity: 0.6,
                    padding: "1px 6px",
                    borderRadius: 999,
                    border: "1px solid rgba(0,0,0,0.15)",
                  }}
                >
                  {isGroup ? "group" : "item"}
                </span>
              </div>
            );
          }}
        />
      </DndProvider>
    </div>
  );
}
