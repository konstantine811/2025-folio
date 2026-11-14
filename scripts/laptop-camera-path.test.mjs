import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
const source = fs.readFileSync(new URL('../src/components/page-partials/pages/experimental/three-scenes/games/codeworlds/laptop-camera-path.ts', import.meta.url),'utf8');
const exports = {};
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:()=>THREE});
const {sampleLaptopCameraPath:sample} = exports;
for (const start of [new THREE.Vector3(0,2.2,-5),new THREE.Vector3(-4,2,-3),new THREE.Vector3(4,2,-3),new THREE.Vector3(2,2,2)]) {
  const end = new THREE.Vector3(0,1.8,0.65);
  assert(sample(start,end,0,new THREE.Vector3()).distanceTo(start)<1e-9);
  assert(sample(start,end,1,new THREE.Vector3()).distanceTo(end)<1e-9);
  let previous = start.clone();
  for(let i=1;i<=1000;i++) {
    const point=sample(start,end,i/1000,new THREE.Vector3());
    assert(Math.hypot(point.x,point.z)>=0.65-1e-9,'Camera must stay outside the torso');
    assert(point.distanceTo(previous)<0.05,'Path must be continuous');
    previous=point;
  }
}
console.log('PASS: side orbit, body clearance, continuity, exact opening/return endpoints');
