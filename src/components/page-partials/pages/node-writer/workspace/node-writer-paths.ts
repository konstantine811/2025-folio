import type { AppView } from "../types/types";

/** Same as RoutPath.NODE_WRITER — defined here to avoid a circular import (router-config → NodeWriter → this file). */
const NODE_WRITER = "/node-writer";

const base = NODE_WRITER.replace(/\/$/, "");

const DOC_VIEWS: AppView[] = [
  "nodes",
  "editor",
  "presentation",
  "assets",
];

function isDocView(s: string): s is AppView {
  return DOC_VIEWS.includes(s as AppView);
}

/**
 * `/node-writer` — dashboard.
 * `/node-writer/doc/{projectId}` — режим «Майстерня» (nodes).
 * `/node-writer/doc/{projectId}/editor|presentation|assets` — відповідний таб.
 */
export function buildNodeWriterPath(
  projectId: string | null,
  view: AppView,
): string {
  if (!projectId || view === "dashboard") {
    return NODE_WRITER;
  }
  const id = encodeURIComponent(projectId);
  if (view === "nodes") {
    return `${NODE_WRITER}/doc/${id}`;
  }
  return `${NODE_WRITER}/doc/${id}/${view}`;
}

export function parseNodeWriterPath(pathname: string): {
  projectId: string | null;
  view: AppView;
} {
  const norm = pathname.replace(/\/+$/, "") || "/";
  if (norm === base) {
    return { projectId: null, view: "dashboard" };
  }

  const escaped = base.replace(/\//g, "\\/");
  const re = new RegExp(`^${escaped}/doc/([^/]+)(?:/([^/]+))?$`);
  const m = norm.match(re);
  if (!m) {
    return { projectId: null, view: "dashboard" };
  }

  let projectId: string;
  try {
    projectId = decodeURIComponent(m[1]);
  } catch {
    return { projectId: null, view: "dashboard" };
  }

  const seg = m[2];
  if (!seg) {
    return { projectId, view: "nodes" };
  }
  if (isDocView(seg)) {
    return { projectId, view: seg };
  }
  return { projectId, view: "nodes" };
}
