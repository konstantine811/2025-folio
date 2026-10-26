import { Float32BufferAttribute, SkinnedMesh, Uint16BufferAttribute, Vector3, type Object3D } from 'three';

export type BrushMode = 'add' | 'remove' | 'smooth';
type Values = { indices: number[]; weights: number[] };
type Change = { mesh: number; vertex: number; before: Values; after: Values };
export class SkinWeightEditor {
  meshes: SkinnedMesh[] = [];
  private baseline: Values[][];
  private neighbors = new Map<number, Set<number>[]>();
  private stroke = new Map<string, Change>();
  undoStack: Change[][] = [];
  redoStack: Change[][] = [];
  constructor(root: Object3D) {
    root.traverse(node => { if (node instanceof SkinnedMesh && node.geometry.getAttribute('skinWeight')) this.meshes.push(node); });
    const replaced = new Set(this.meshes.map(mesh => mesh.geometry));
    for (const mesh of this.meshes) {
      const geometry = mesh.geometry.clone();
      const indices = geometry.getAttribute('skinIndex'), weights = geometry.getAttribute('skinWeight');
      const indexArray = [], weightArray = [];
      for (let v = 0; v < weights.count; v++) for (let k = 0; k < 4; k++) {
        indexArray.push(indices.getComponent(v, k)); weightArray.push(weights.getComponent(v, k));
      }
      geometry.setAttribute('skinIndex', new Uint16BufferAttribute(indexArray, 4));
      geometry.setAttribute('skinWeight', new Float32BufferAttribute(weightArray, 4));
      mesh.geometry = geometry;
    }
    root.traverse(node => { if ('geometry' in node) replaced.delete(node.geometry as SkinnedMesh['geometry']); });
    replaced.forEach(geometry => geometry.dispose());
    this.baseline = this.meshes.map((mesh, i) => Array.from({ length: mesh.geometry.getAttribute('skinWeight').count }, (_, v) => this.read(i, v)));
  }
  read(mesh: number, vertex: number): Values {
    const geometry = this.meshes[mesh].geometry;
    return { indices: [0, 1, 2, 3].map(k => geometry.getAttribute('skinIndex').getComponent(vertex, k)), weights: [0, 1, 2, 3].map(k => geometry.getAttribute('skinWeight').getComponent(vertex, k)) };
  }
  weight(mesh: number, vertex: number, bone: number) {
    const value = this.read(mesh, vertex);
    return value.weights.reduce((sum, w, k) => sum + (value.indices[k] === bone ? w : 0), 0);
  }
  private write(mesh: number, vertex: number, value: Values) {
    const geometry = this.meshes[mesh].geometry;
    for (let k = 0; k < 4; k++) {
      geometry.getAttribute('skinIndex').setComponent(vertex, k, value.indices[k]);
      geometry.getAttribute('skinWeight').setComponent(vertex, k, value.weights[k]);
    }
    geometry.getAttribute('skinIndex').needsUpdate = true;
    geometry.getAttribute('skinWeight').needsUpdate = true;

  }
  setWeight(mesh: number, vertex: number, bone: number, target: number, fallback: number) {
    if (bone < 0 || fallback < 0 || bone === fallback || !Number.isFinite(target)) return;
    const before = this.read(mesh, vertex), rest = new Map<number, number>();
    const weight = Math.max(0, Math.min(1, target));
    const current = before.weights.reduce((sum, w, k) => sum + (before.indices[k] === bone ? w : 0), 0);
    if (Math.abs(current - weight) < 1e-7) return;
    before.indices.forEach((index, k) => { if (index !== bone && before.weights[k] > 0) rest.set(index, (rest.get(index) ?? 0) + before.weights[k]); });
    const others = [...rest].sort((a, b) => b[1] - a[1]).slice(0, 3);
    if (!others.length) others.push([fallback, 1]);
    const total = others.reduce((sum, [, w]) => sum + w, 0);
    const after = { indices: [bone, ...others.map(([i]) => i)], weights: [weight, ...others.map(([, w]) => w / total * (1 - weight))] };
    while (after.indices.length < 4) { after.indices.push(0); after.weights.push(0); }
    if (before.indices.every((v, i) => v === after.indices[i]) && before.weights.every((v, i) => Math.abs(v - after.weights[i]) < 1e-7)) return;
    const key = `${mesh}:${vertex}`;
    this.stroke.set(key, { mesh, vertex, before: this.stroke.get(key)?.before ?? before, after });
    this.write(mesh, vertex, after);
  }
  private adjacency(mesh: number) {
    const cached = this.neighbors.get(mesh); if (cached) return cached;
    const geometry = this.meshes[mesh].geometry, positions = geometry.getAttribute('position');
    const result = Array.from({ length: positions.count }, () => new Set<number>());
    const welded = new Map<string, number>();
    for (let v = 0; v < positions.count; v++) {
      const key = [positions.getX(v), positions.getY(v), positions.getZ(v)].join(',');
      const other = welded.get(key);
      if (other !== undefined) { result[v].add(other); result[other].add(v); } else welded.set(key, v);
    }
    const count = geometry.index?.count ?? positions.count;
    for (let i = 0; i + 2 < count; i += 3) {
      const triangle = [0, 1, 2].map(k => geometry.index?.getX(i + k) ?? i + k);
      for (const a of triangle) for (const b of triangle) if (a !== b) result[a].add(b);
    }
    this.neighbors.set(mesh, result); return result;
  }
  paint(mesh: number, posed: SkinnedMesh, seeds: number[], point: Vector3, radius: number, strength: number, bone: number, fallback: number, mode: BrushMode) {
    const adjacent = this.adjacency(mesh), queue = [...seeds], seen = new Set<number>(), edits: [number, number][] = [];
    const position = new Vector3();
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const vertex = queue[cursor]; if (seen.has(vertex)) continue; seen.add(vertex);
      posed.getVertexPosition(vertex, position).applyMatrix4(posed.matrixWorld);
      const distance = position.distanceTo(point); if (distance > radius) continue;
      const weight = this.weight(mesh, vertex, bone), amount = strength * (1 - distance / radius) ** 2;
      const neighbors = [...adjacent[vertex]];
      const average = neighbors.length ? neighbors.reduce((sum, v) => sum + this.weight(mesh, v, bone), 0) / neighbors.length : weight;
      edits.push([vertex, mode === 'smooth' ? weight + (average - weight) * amount : weight + (mode === 'add' ? amount : -amount)]);
      queue.push(...neighbors.filter(v => !seen.has(v)));
    }
    edits.forEach(([vertex, value]) => this.setWeight(mesh, vertex, bone, value, fallback));
    return edits.length;
  }
  finish() { if (this.stroke.size) { this.undoStack.push([...this.stroke.values()]); this.undoStack = this.undoStack.slice(-30); this.redoStack = []; this.stroke.clear(); } }
  undo() { this.finish(); const changes = this.undoStack.pop(); if (changes) { changes.forEach(c => this.write(c.mesh, c.vertex, c.before)); this.redoStack.push(changes); } }
  redo() { const changes = this.redoStack.pop(); if (changes) { changes.forEach(c => this.write(c.mesh, c.vertex, c.after)); this.undoStack.push(changes); } }
  reset(mesh: number) {
    this.finish();
    this.baseline[mesh].forEach((after, vertex) => {
      const before = this.read(mesh, vertex);
      if (JSON.stringify(before) !== JSON.stringify(after)) { this.stroke.set(`${mesh}:${vertex}`, { mesh, vertex, before, after }); this.write(mesh, vertex, after); }
    });
    this.finish();
  }
}
