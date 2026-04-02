import type { LinkData, NodeData } from "../../types/types";

interface LinksPanelProps {
  links: LinkData[];
  nodes: NodeData[];
  onRemoveLink: (source: string, target: string) => void;
}

export function LinksPanel({ links, nodes, onRemoveLink }: LinksPanelProps) {
  if (links.length === 0) return null;

  return (
    <div className="max-h-28 overflow-y-auto border-t border-white/10 bg-black px-4 py-2">
      <p className="mono mb-2 text-[8px] tracking-widest text-white/30 uppercase">
        Зв&apos;язки
      </p>
      <ul className="flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={`${l.source}-${l.target}`}>
            <button
              type="button"
              className="mono border border-white/10 px-2 py-1 text-[9px] text-white/50 uppercase hover:border-red-500/50 hover:text-red-400"
              onClick={() => onRemoveLink(l.source, l.target)}
            >
              {nodes.find((n) => n.id === l.source)?.label ?? l.source} →{" "}
              {nodes.find((n) => n.id === l.target)?.label ?? l.target} ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
