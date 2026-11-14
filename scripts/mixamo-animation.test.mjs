import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

const path = '../src/components/page-partials/pages/experimental/three-scenes/character-controller/character-animation/adapt-mixamo-clip.ts';
const compiled = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
vm.runInNewContext(compiled, { exports, require: name => {
  assert.equal(name, 'three');
  return THREE;
} });
const { adaptMixamoClip } = exports;

function rig(prefix, rotate = false) {
  const scene = new THREE.Group();
  if (rotate) scene.rotation.x = Math.PI / 2;
  const hips = new THREE.Bone();
  hips.name = `${prefix}Hips`;
  hips.position.set(0, rotate ? 0 : 100, rotate ? -100 : 0);
  const spine = new THREE.Bone();
  spine.name = `${prefix}Spine`;
  hips.add(spine);
  scene.add(hips);
  return scene;
}
const source = rig('mixamorig:');
const target = rig('mixamorig', true);
const original = new THREE.AnimationClip('Walk', 1, [
  new THREE.VectorKeyframeTrack('mixamorig:Hips.position', [0, 1], [30, 100, 20, 40, 90, 50]),
  new THREE.QuaternionKeyframeTrack('mixamorig:Hips.quaternion', [0, 1], [0, 0, 0, 1, 0, 0, 0, 1]),
  new THREE.QuaternionKeyframeTrack('mixamorig:Spine.quaternion', [0, 1], [0, 0, 0, 1, 0, 0, 0, 1]),
  new THREE.VectorKeyframeTrack('mixamorig:Spine.position', [0, 1], [0, 5, 0, 0, 6, 0]),
  new THREE.VectorKeyframeTrack('mixamorig:Hips.scale', [0, 1], [1, 1, 1, 1, 1, 1]),
]);
source.animations = [original];
const before = JSON.stringify(original.toJSON());
const adapted = adaptMixamoClip({ source, target, name: 'walk' });
assert.equal(adapted.name, 'walk');
assert.equal(adapted.tracks.length, 3);
assert.equal(JSON.stringify(original.toJSON()), before, 'Cached source clips must stay unchanged');
const hipsPosition = adapted.tracks.find(track => track.name === 'mixamorigHips.position');
const first = new THREE.Vector3().fromArray(hipsPosition.values, 0).applyQuaternion(target.quaternion);
const last = new THREE.Vector3().fromArray(hipsPosition.values, 3).applyQuaternion(target.quaternion);
assert(Math.abs(first.y - 100) < 1e-5);
assert(Math.abs(last.y - 90) < 1e-5, 'Pelvis must descend with bent legs');
assert(Math.abs(first.x - last.x) < 1e-5 && Math.abs(first.z - last.z) < 1e-5, 'Horizontal movement belongs to physics');
const rotation = new THREE.Quaternion().fromArray(adapted.tracks[1].values);
assert(target.quaternion.clone().multiply(rotation).normalize().angleTo(new THREE.Quaternion()) < 1e-5, 'Parent axes must cancel');
const scaled = adaptMixamoClip({ source, target, name: 'walk', translationScale: 0.5 });
assert(Math.abs(scaled.tracks[0].values[5] + 95) < 1e-5);
source.animations.push(original.clone());
assert.throws(() => adaptMixamoClip({ source, target, name: 'walk' }), /select an existing animation/);
source.animations[1].name = 'Other';
assert.equal(adaptMixamoClip({ source, target, name: 'walk', clipName: 'Walk' }).name, 'walk');
assert.throws(() => adaptMixamoClip({ source, target: new THREE.Group(), name: 'walk', clipName: 'Walk' }), /requires Hips/);
console.log('PASS: namespaces, orientation, pelvis height, root motion, unit scaling, explicit clip selection and source immutability');

// Check the actual Farmer skeleton and all four FBX exports against the utility.
const root = new URL('../public/3d-models/rts-farmer/farmer/', import.meta.url);
const glb = readFileSync(new URL('farmer_idle.glb', root));
const json = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)));
const nodes = json.nodes.map(node => {
  const object = new THREE.Object3D();
  object.name = THREE.PropertyBinding.sanitizeNodeName(node.name ?? '');
  if (node.translation) object.position.fromArray(node.translation);
  if (node.rotation) object.quaternion.fromArray(node.rotation);
  if (node.scale) object.scale.fromArray(node.scale);
  return object;
});
json.nodes.forEach((node, i) => node.children?.forEach(child => nodes[i].add(nodes[child])));
const farmer = new THREE.Group();
json.scenes[json.scene].nodes.forEach(node => farmer.add(nodes[node]));
for (const file of ['Walking.fbx', 'Running.fbx', 'Jumping.fbx', 'Falling Idle.fbx']) {
  const bytes = readFileSync(new URL(file, root));
  const fbx = new FBXLoader().parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  const clip = adaptMixamoClip({ source: fbx, target: farmer, name: file });
  assert(clip.tracks.some(track => track.name === 'mixamorigHips.position'));
  assert(clip.tracks.every(track => Array.from(track.values).every(Number.isFinite)));
  console.log(`PASS: Farmer ${file}`);
}
