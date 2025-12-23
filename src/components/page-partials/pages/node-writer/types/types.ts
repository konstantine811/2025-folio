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
  fx?: number | null;
  fy?: number | null;
}

export interface LinkData {
  source: string;
  target: string;
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

export interface User {
  name: string;
  email: string;
  avatar: string;
}
