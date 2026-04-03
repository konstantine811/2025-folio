export function newNodeId(): string {
  return `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function newCanvasImageId(): string {
  return `ci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function newMarkdownBlockId(): string {
  return `mb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
