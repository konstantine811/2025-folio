import {
  AnimationClip, AnimationMixer, Bone, Box3, Euler, Group, LoopOnce,
  Object3D, PropertyBinding, Quaternion, QuaternionKeyframeTrack,
  Vector3, VectorKeyframeTrack, type KeyframeTrack,
} from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export type Mask = 'all' | 'upper' | 'lower' | 'left' | 'right';
export type Layer = { id: string; clipId: string; weight: number; mask: Mask; start: number; end: number; speed: number; loop: boolean };
export type PoseKey = { bone: string; time: number; rotation: [number, number, number] };
export type ClipEntry = { id: string; clip: AnimationClip; included: boolean; source: string };
export type Draft = { name: string; duration: number; layers: Layer[]; keys: PoseKey[] };

export function bonesOf(root: Object3D): Bone[] {
  const bones: Bone[] = [];
  root.traverse(node => { if (node instanceof Bone) bones.push(node); });
  return bones;
}
export const boneKey = (name: string) => name.toLowerCase().replace(/^.*mixamorig[:_]?/, '').replace(/[^a-z0-9]/g, '');
export function trackNode(name: string) {
  const parsed = PropertyBinding.parseTrackName(name);
  return { name: parsed.objectName === 'bones' ? String(parsed.objectIndex) : parsed.nodeName, property: parsed.propertyName };
}
export function matchesMask(name: string, mask: Mask) {
  if (mask === 'all') return true;
  const key = boneKey(name);
  const upper = /spine|chest|neck|head|shoulder|arm|hand|finger|thumb|index|middle|ring|pinky/.test(key);
  if (mask === 'upper') return upper;
  if (mask === 'lower') return !upper;
  if (mask === 'left') return /left|l$/.test(key);
  return /right|r$/.test(key);
}

/** Keep normalization outside the imported rig, preserving bind matrices and tracks. */
export function prepareCharacter(root: Object3D) {
  const bones = bonesOf(root);
  if (!bones.length) throw new Error('Модель не має скелета. Завантажте персонажа Mixamo зі шкірою (With Skin).');
  const names = new Set<string>();
  for (const bone of bones) {
    if (!bone.name || names.has(bone.name)) throw new Error('Кістки повинні мати унікальні назви. Перевірте скелет моделі.');
    names.add(bone.name);
  }
  root.updateMatrixWorld(true);
  const box = new Box3().setFromObject(root);
  const height = box.getSize(new Vector3()).y;
  if (!Number.isFinite(height) || height < 0.0001) throw new Error('Не знайдено видимої геометрії персонажа. Використайте файл With Skin.');
  const wrapper = new Group();
  wrapper.name = 'AnimationStudioCharacter';
  wrapper.add(root);
  const scale = 1.8 / height;
  wrapper.scale.setScalar(scale);
  const center = box.getCenter(new Vector3());
  wrapper.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
  wrapper.updateMatrixWorld(true);
  return wrapper;
}

/** Retarget matching Mixamo bones in their rest coordinate frames. Never copy limb lengths. */
export function retargetAnimation(source: Object3D, target: Object3D, clip: AnimationClip, skipped: string[] = []) {
  source.updateMatrixWorld(true); target.updateMatrixWorld(true);
  const sourceBones = new Map(bonesOf(source).map(b => [boneKey(b.name), b]));
  const targetBones = new Map(bonesOf(target).map(b => [boneKey(b.name), b]));
  const tracks: KeyframeTrack[] = [];
  const missing = new Set<string>();
  const targetHip = targetBones.get('hips');
  const sourceHip = sourceBones.get('hips');
  // Translation tracks are local. Use local hip heights, excluding viewport normalization.
  const ratio = sourceHip && targetHip && Math.abs(sourceHip.position.y) > 0.0001
    ? Math.abs(targetHip.position.y / sourceHip.position.y) : 1;
  for (const track of clip.tracks) {
    const parsed = trackNode(track.name);
    const key = boneKey(parsed.name);
    const from = sourceBones.get(key);
    const to = targetBones.get(key);
    if (!from || !to) {
      const size = track.getValueSize();
      const constant = track.values.every((value, index) => Math.abs(value - track.values[index % size]) < 0.000001);
      const sourceNode = source.getObjectByName(parsed.name);
      const auxiliary = /eye|jaw|tongue|end$/.test(key) || (sourceNode && !(sourceNode instanceof Bone));
      if (constant && auxiliary) skipped.push(parsed.name);
      else missing.add(parsed.name);
      continue;
    }
    if (parsed.property === 'quaternion') {
      const fromParent = from.parent?.getWorldQuaternion(new Quaternion()) ?? new Quaternion();
      const toParent = to.parent?.getWorldQuaternion(new Quaternion()) ?? new Quaternion();
      const left = toParent.invert().multiply(fromParent);
      const right = from.getWorldQuaternion(new Quaternion()).invert().multiply(to.getWorldQuaternion(new Quaternion()));
      const values: number[] = [];
      for (let i = 0; i < track.values.length; i += 4) {
        const q = left.clone().multiply(new Quaternion().fromArray(track.values, i)).multiply(right).normalize();
        values.push(...q.toArray());
      }
      tracks.push(new QuaternionKeyframeTrack(`${to.name}.quaternion`, Array.from(track.times), values));
    } else if (parsed.property === 'position' && key === 'hips') {
      const values: number[] = [];
      for (let i = 0; i < track.values.length; i += 3) {
        const p = new Vector3().fromArray(track.values, i).sub(from.position).multiplyScalar(ratio).add(to.position);
        values.push(...p.toArray());
      }
      tracks.push(new VectorKeyframeTrack(`${to.name}.position`, Array.from(track.times), values));
    }
  }
  if (!tracks.some(t => t.name.endsWith('.quaternion'))) throw new Error('Анімація не відповідає скелету. Використайте анімацію для Mixamo-персонажа з такими самими назвами кісток.');
  if (missing.size) throw new Error(`Не вдалося зіставити кістки: ${[...missing].slice(0, 5).join(', ')}. Використайте сумісний скелет.`);
  return new AnimationClip(clip.name, clip.duration, tracks);
}

export function rotationAt(keys: PoseKey[], bone: string, time: number) {
  const sorted = keys.filter(k => k.bone === bone).sort((a, b) => a.time - b.time);
  if (!sorted.length) return new Quaternion();
  const first = sorted[0];
  if (first.time > 0) sorted.unshift({ bone, time: 0, rotation: [0, 0, 0] });
  const next = sorted.findIndex(k => k.time >= time);
  const b = sorted[next < 0 ? sorted.length - 1 : next];
  const a = sorted[Math.max(0, next < 0 ? sorted.length - 1 : next - 1)];
  const q = (k: PoseKey) => new Quaternion().setFromEuler(new Euler(...k.rotation.map(v => v * Math.PI / 180) as [number, number, number], 'XYZ'));
  return q(a).slerp(q(b), a === b ? 0 : (time - a.time) / (b.time - a.time));
}

/** Bake the same layered mixer + post-animation bone offsets used by the preview in sich. */
export function bakeAnimation(root: Object3D, entries: ClipEntry[], draft: Draft, fps = 30) {
  if (!Number.isFinite(draft.duration) || draft.duration < 0.1 || draft.duration > 60) throw new Error('Тривалість має бути від 0.1 до 60 секунд.');
  const model = clone(root);
  const mixer = new AnimationMixer(model);
  const nodes = new Map<string, Object3D>(bonesOf(model).map(b => [b.name, b]));
  const actions = draft.layers.map(layer => {
    const source = entries.find(e => e.id === layer.clipId)?.clip;
    if (!source) throw new Error('Один із кліпів композиції видалено.');
    if (!Number.isFinite(layer.speed) || layer.speed <= 0 || layer.start < 0 || layer.end > source.duration + 0.001 || layer.end <= layer.start) throw new Error('Перевірте початок, кінець і швидкість шару.');
    const clip = new AnimationClip(source.name, source.duration, source.tracks.filter(t => matchesMask(trackNode(t.name).name, layer.mask)).map(t => t.clone()));
    for (const track of clip.tracks) {
      const name = trackNode(track.name).name;
      const node = model.getObjectByName(name);
      if (node) nodes.set(name, node);
    }
    const action = mixer.clipAction(clip).setLoop(LoopOnce, 1).setEffectiveWeight(layer.weight).play();
    action.clampWhenFinished = true;
    return { action, layer };
  });
  const records = [...nodes.values()].map(node => ({ node, animatedRotation: node.quaternion.clone(), position: [] as number[], quaternion: [] as number[], scale: [] as number[] }));
  const times: number[] = [];
  const frameCount = Math.ceil(draft.duration * fps);
  const editedBones = [...new Set(draft.keys.map(k => k.bone))];
  try {
    for (let frame = 0; frame <= frameCount; frame++) {
      const time = frame * draft.duration / frameCount;
      times.push(time);
      // As in sich, restore the last animated pose before applying offsets again.
      for (const record of records) record.node.quaternion.copy(record.animatedRotation);
      for (const { action, layer } of actions) {
        const span = layer.end - layer.start;
        action.time = layer.start + (layer.loop ? (time * layer.speed) % span : Math.min(time * layer.speed, span));
      }
      for (const { action } of actions) action.enabled = true;
      mixer.update(0);
      for (const record of records) record.animatedRotation.copy(record.node.quaternion);
      for (const bone of editedBones) nodes.get(bone)?.quaternion.multiply(rotationAt(draft.keys, bone, time));
      for (const record of records) {
        record.position.push(...record.node.position.toArray());
        record.quaternion.push(...record.node.quaternion.toArray());
        record.scale.push(...record.node.scale.toArray());
      }
    }
  } finally { mixer.stopAllAction(); mixer.uncacheRoot(model); }
  const tracks = records.flatMap(r => [
    new VectorKeyframeTrack(`${r.node.name}.position`, times, r.position),
    new QuaternionKeyframeTrack(`${r.node.name}.quaternion`, times, r.quaternion),
    new VectorKeyframeTrack(`${r.node.name}.scale`, times, r.scale),
  ]);
  return new AnimationClip(draft.name.trim() || 'Моя анімація', draft.duration, tracks).optimize();
}

export function uniqueClipName(name: string, entries: ClipEntry[]) {
  const base = name.trim() || 'Animation';
  const names = new Set(entries.map(e => e.clip.name));
  let result = base; let i = 2;
  while (names.has(result)) result = `${base} ${i++}`;
  return result;
}
