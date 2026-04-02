export interface Project {
  id: string;
  title: string;
  content: string;
  nodes: NodeData[];
  links: LinkData[];
  slides: Slide[];
  images: Asset[];
  lastModified: number;
}

export interface NodeData {
  id: string;
  label: string;
  description?: string;
  imageUrl?: string;
  type: "concept" | "resource" | "activity";
  x?: number;
  y?: number;
  /** Явна ширина ноди (px); інакше дефолт канвасу. */
  width?: number;
  /** Явна висота ноди (px). */
  height?: number;
  fx?: number | null;
  fy?: number | null;
}

/** Порт ноди: північ, схід, південь, захід (край для звʼязку). */
export type NodePort = "n" | "e" | "s" | "w";

export interface LinkData {
  source: string;
  target: string;
  sourcePort?: NodePort;
  targetPort?: NodePort;
}

export interface Slide {
  id: string;
  title: string;
  content: string;
  visualType: "text" | "image" | "bullets";
}

export interface Asset {
  id: string;
  url: string;
  prompt: string;
}

export type AppView =
  | "dashboard"
  | "editor"
  | "nodes"
  | "presentation"
  | "assets";

export type ProjectPatchFn = (prev: Project) => Project;

export interface User {
  name: string;
  email: string;
  avatar: string;
}
