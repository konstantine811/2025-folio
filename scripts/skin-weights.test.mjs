import test from 'node:test';
import assert from 'node:assert/strict';
import { Bone, BufferGeometry, Float32BufferAttribute, Group, Skeleton, SkinnedMesh, Uint16BufferAttribute, Vector3 } from 'three';
import { SkinWeightEditor } from '../src/components/page-partials/pages/experimental/animation-studio/skin-weights.ts';
function fixture() {
  const root = new Group(), geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute([0,0,0, .1,0,0, 0,.1,0, 0,0,.01, .1,0,.01, 0,.1,.01],3));
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(Array.from({length:6},()=>[0,1,2,3]).flat(),4));
  geometry.setAttribute('skinWeight', new Float32BufferAttribute(Array.from({length:6},()=>[1,0,0,0]).flat(),4));
  const mesh = new SkinnedMesh(geometry), bones = Array.from({length:5},(_,i)=>{const b = new Bone();b.name=`bone${i}`;return b;});
  bones.forEach(b=>root.add(b));root.add(mesh);mesh.bind(new Skeleton(bones));root.updateMatrixWorld(true);
  return { root, mesh, editor:new SkinWeightEditor(root) };
}
test('adding missing influence normalizes and supports undo/redo/reset',()=>{
  const {editor}=fixture();
  editor.setWeight(0,0,4,.3,0);editor.finish();
  assert.ok(Math.abs(editor.weight(0,0,4)-.3)<1e-6);
  assert.ok(Math.abs(editor.read(0,0).weights.reduce((a,b)=>a+b)-1)<1e-6);
  editor.undo();assert.equal(editor.weight(0,0,0),1);
  editor.redo();assert.ok(editor.weight(0,0,4)>.29);
  editor.reset(0);assert.equal(editor.weight(0,0,0),1);
  editor.undo();assert.ok(editor.weight(0,0,4)>.29);
});
test('removing sole influence transfers to fallback without zero sum',()=>{
  const {editor}=fixture();editor.setWeight(0,0,0,0,1);
  assert.equal(editor.weight(0,0,1),1);
});
test('stroke is one undo entry and does not reach disconnected nearby surface',()=>{
  const {editor,mesh}=fixture();
  for(let i=0;i<3;i++)editor.paint(0,mesh,[0,1,2],new Vector3(),.3,.2,1,0,'add');
  editor.finish();assert.equal(editor.undoStack.length,1);
  assert.ok(editor.weight(0,0,1)>.5);assert.equal(editor.weight(0,3,1),0);
  editor.undo();assert.equal(editor.weight(0,0,1),0);
});
test('smoothing samples neighbor weights before applying edits',()=>{
  const {editor,mesh}=fixture();editor.setWeight(0,1,1,1,0);editor.finish();
  editor.paint(0,mesh,[0,1,2],new Vector3(),.3,1,1,0,'smooth');
  assert.ok(Math.abs(editor.weight(0,0,1)-.5)<1e-6);
  assert.ok(editor.weight(0,1,1)<1);
});
test('shared imported geometry becomes independently editable',()=>{
  const {root,mesh}=fixture();const other=mesh.clone();root.add(other);
  const editor=new SkinWeightEditor(root);editor.setWeight(0,0,1,.6,0);
  assert.equal(editor.weight(1,0,1),0);
});
test('new influence keeps strongest three others and total one',()=>{
  const {editor}=fixture();
  const weights=editor.meshes[0].geometry.getAttribute('skinWeight');
  weights.setXYZW(0,.4,.3,.2,.1);
  editor.setWeight(0,0,4,.5,0);
  const result=editor.read(0,0);
  assert.deepEqual(result.indices,[4,0,1,2]);
  assert.ok(Math.abs(result.weights.reduce((a,b)=>a+b)-1)<1e-6);
});
test('brush uses posed world positions',()=>{
  const {editor,mesh}=fixture();mesh.skeleton.bones[0].position.x=2;
  mesh.parent.updateMatrixWorld(true);
  editor.paint(0,mesh,[0,1,2],new Vector3(2,0,0),.3,.2,1,0,'add');
  assert.ok(editor.weight(0,0,1)>.19);
});
test('removing absent influence does not discard existing influences or create history',()=>{
  const {editor}=fixture();editor.meshes[0].geometry.getAttribute('skinWeight').setXYZW(0,.4,.3,.2,.1);
  const before=editor.read(0,0);editor.setWeight(0,0,4,-.1,0);editor.finish();
  assert.deepEqual(editor.read(0,0),before);assert.equal(editor.undoStack.length,0);
});
