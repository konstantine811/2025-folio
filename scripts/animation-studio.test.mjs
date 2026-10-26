// Run with Node >= 23: node --test scripts/animation-studio.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { AnimationClip, Bone, Group, Quaternion, QuaternionKeyframeTrack, VectorKeyframeTrack } from 'three';
import { bakeAnimation, retargetAnimation, rotationAt, uniqueClipName } from '../src/components/page-partials/pages/experimental/animation-studio/animation-core.ts';

function rig(prefix = 'mixamorig', height = 100) {
  const root = new Group(); const hip = new Bone(); hip.name = `${prefix}Hips`; hip.position.y = height;
  const arm = new Bone(); arm.name = `${prefix}LeftArm`; arm.position.set(20, 30, 0);
  const leg = new Bone(); leg.name = `${prefix}LeftUpLeg`; leg.position.y = -40;
  root.add(hip); hip.add(arm, leg); root.updateMatrixWorld(true);
  return { root, hip, arm, leg };
}
const q = angle => new Quaternion().setFromAxisAngle({ x: 0, y: 0, z: 1 }, angle).toArray();
const sample = (clip, node, t) => clip.tracks.find(track => track.name === `${node}.quaternion`).InterpolantFactoryMethodLinear().evaluate(t);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-5, `${a} != ${b}`);

test('retargets namespace variants and hip displacement without copying limb lengths', () => {
  const source = rig('mixamorig:', 100), target = rig('mixamorig', 2);
  const clip = new AnimationClip('Walk', 1, [
    new QuaternionKeyframeTrack('mixamorig:LeftArm.quaternion', [0, 1], [...q(0), ...q(Math.PI / 2)]),
    new VectorKeyframeTrack('mixamorig:Hips.position', [0, 1], [0, 100, 0, 10, 110, 0]),
    new VectorKeyframeTrack('mixamorig:LeftArm.position', [0, 1], [20, 30, 0, 20, 30, 0]),
  ]);
  const result = retargetAnimation(source.root, target.root, clip);
  assert.equal(result.tracks.length, 2);
  near(result.tracks[1].values[3], 0.2); near(result.tracks[1].values[4], 2.2);
  near(sample(result, target.arm.name, 1)[2], Math.SQRT1_2);
  assert.equal(target.arm.position.x, 20);
});
test('refuses unmatched skeletons', () => {
  const source = rig(), target = rig('other');
  const clip = new AnimationClip('x', 1, [new QuaternionKeyframeTrack('mixamorigLeftArm.quaternion', [0, 1], [...q(0), ...q(1)])]);
  assert.throws(() => retargetAnimation(source.root, target.root, clip), /не відповідає/);
});
test('bone offsets do not accumulate over a held animated pose', () => {
  const { root, arm } = rig();
  const clip = new AnimationClip('Hold', 1, [new QuaternionKeyframeTrack(`${arm.name}.quaternion`, [0, 1], [...q(Math.PI / 4), ...q(Math.PI / 4)])]);
  const result = bakeAnimation(root, [{ id: 'a', clip, included: true, source: '' }], {
    name: 'Custom', duration: 2,
    layers: [{ id: 'layer', clipId: 'a', start: 0, end: 1, speed: 1, weight: 1, loop: false, mask: 'all' }],
    keys: [{ bone: arm.name, time: 0, rotation: [0, 0, 45] }],
  });
  for (const t of [0, 0.5, 1, 2]) near(sample(result, arm.name, t)[2], Math.SQRT1_2);
  near(arm.quaternion.z, 0);
});
test('upper/lower masks keep separate motions and trimming holds the final pose', () => {
  const { root, arm, leg } = rig();
  const clip = new AnimationClip('Source', 2, [arm, leg].map(b => new QuaternionKeyframeTrack(`${b.name}.quaternion`, [0, 2], [...q(0), ...q(Math.PI)])));
  const result = bakeAnimation(root, [{ id: 'a', clip, included: true, source: '' }], {
    name: 'Upper', duration: 2, keys: [], layers: [{ id: 'l', clipId: 'a', start: 0, end: 1, speed: 2, weight: 1, loop: false, mask: 'upper' }],
  });
  near(sample(result, arm.name, 2)[2], Math.SQRT1_2); near(sample(result, leg.name, 2)[2], 0);
});
test('authored keys interpolate and hold without source clips', () => {
  const { root, arm } = rig();
  const keys = [{ bone: arm.name, time: 1, rotation: [0, 0, 90] }];
  near(rotationAt(keys, arm.name, 0).z, 0);
  near(rotationAt(keys, arm.name, 0.5).z, Math.sin(Math.PI / 8));
  const clip = bakeAnimation(root, [], { name: 'Pose', duration: 2, layers: [], keys });
  near(sample(clip, arm.name, 2)[2], Math.SQRT1_2);
  assert.equal(clip.duration, 2);
});
test('duplicate animation names receive unique export names', () => {
  const entries = ['Walk', 'Walk 2'].map(name => ({ clip: new AnimationClip(name, 1, []) }));
  assert.equal(uniqueClipName(' Walk ', entries), 'Walk 3');
});
test('retargeting preserves a different target rest orientation', () => {
  const source = rig(), target = rig();
  source.root.rotation.x = Math.PI / 2;
  target.arm.rotation.z = Math.PI / 6;
  const clip = new AnimationClip('Rest', 1, [new QuaternionKeyframeTrack(`${source.arm.name}.quaternion`, [0, 1], [...q(0), ...q(0)])]);
  const result = retargetAnimation(source.root, target.root, clip);
  const actual = new Quaternion().fromArray(sample(result, target.arm.name, 0));
  near(Math.abs(actual.dot(target.arm.quaternion)), 1);
});
test('weighted layers bake the blended pose rather than exporting separate actions', () => {
  const { root, arm } = rig();
  const entries = [0, Math.PI / 2].map((angle, index) => ({ id: String(index), clip: new AnimationClip('Pose', 1, [new QuaternionKeyframeTrack(`${arm.name}.quaternion`, [0, 1], [...q(angle), ...q(angle)])]), included: true, source: '' }));
  const clip = bakeAnimation(root, entries, { name: 'Blend', duration: 1, keys: [], layers: entries.map(e => ({ id: e.id, clipId: e.id, weight: 0.5, start: 0, end: 1, speed: 1, loop: false, mask: 'all' })) });
  near(sample(clip, arm.name, 0.5)[2], Math.sin(Math.PI / 8));
});
test('real Mixamo FBX accepts absent static eye/helper tracks and reports them', () => {
  const bytes = fs.readFileSync(new URL('../public/3d-models/render-target-model/animations/Sitting.fbx', import.meta.url));
  const source = new FBXLoader().parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  const target = source.clone(true);
  target.getObjectByName('LeftEye')?.removeFromParent();
  target.getObjectByName('RightEye')?.removeFromParent();
  const skipped = [];
  const clip = retargetAnimation(source, target, source.animations[0], skipped);
  assert.ok(clip.tracks.length > 50);
  assert.deepEqual(new Set(skipped), new Set(['Armature', 'LeftEye', 'RightEye']));
});
