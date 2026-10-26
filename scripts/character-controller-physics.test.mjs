import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

await RAPIER.init();
const source = readFileSync(new URL('../src/components/page-partials/pages/experimental/three-scenes/character-controller/useCharacterControllerPhysics.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;

function simulate(renderHz) {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 1.2, 0).lockRotations());
  world.createCollider(RAPIER.ColliderDesc.capsule(0.8, 0.4), body);
  world.createCollider(RAPIER.ColliderDesc.cuboid(50, 0.5, 50).setTranslation(0, -0.5, 0));
  const pivot = new THREE.Object3D();
  const followCam = new THREE.Object3D();
  followCam.position.z = -5;
  pivot.add(followCam);
  let frame, physics;
  const controls = { forward: true, backward: false, rightward: false, leftward: false, run: false, jump: false };
  const modules = {
    react: { useRef: current => ({ current }), useMemo: fn => fn(), useState: value => [value, () => {}] },
    '@react-three/fiber': { useFrame: fn => { frame = fn; } },
    '@react-three/rapier': {
      useRapier: () => ({ rapier: RAPIER, world }),
      useBeforePhysicsStep: fn => { physics = fn; },
      interactionGroups: () => 0xffffffff,
    },
    three: THREE,
    '@/components/common/hooks/camera/useFollowCamera': { default: () => ({ pivot, followCam, cameraCollisionDetect() {} }), __esModule: true },
    '@/components/common/game-controller/store/control-game-store': { useControlStore: () => controls },
    '@/utils/game.utils': { getPivotMovingDirection: () => controls.forward ? 0 : null },
    '@/components/common/game-controller/utils/physics': {
      createMovementVelocity: (x,z,speed,y) => ({ x:x*speed,y,z:z*speed }),
      createJumpImpulse: force => ({ x:0,y:force*7.5,z:0 }),
      createFallForce: () => ({ x:0,y:0.07848,z:0 }),
    },
    '@/components/page-partials/pages/experimental/three-scenes/character-controller/physics-world/usePlayerPositionStore': { usePlayerPositionStore: selector => selector({setPosition() {}}) },
  };
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: name => { assert(name in modules, name); return modules[name]; } });
  exports.useCharacterControllerPhysics({ playerRef: {current:{rigidBody:body}}, modelRef:{current:new THREE.Group()}, capsuleHalfHeight:0.8, capsuleRadius:0.4 });
  const camera = new THREE.PerspectiveCamera();
  for (let tick=0; tick<240; tick++) {
    if (tick % (240/renderHz) === 0) frame({camera},1/renderHz);
    if (tick % 4 === 0) { physics(); world.step(); }
  }
  const distance = body.translation().z;
  world.free();
  return distance;
}
const distances = [30,60,120].map(simulate);
assert(distances.every(distance => distance > 2), 'Walking should advance');
assert(Math.max(...distances)-Math.min(...distances)<0.001,'Render refresh rate must not change movement');
console.log('PASS: movement at 30/60/120 Hz:', distances, '');
