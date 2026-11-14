import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
await RAPIER.init();
const root = '../src/components/page-partials/pages/experimental/three-scenes/games/rts-farmer/';
const compile = file => ts.transpileModule(readFileSync(new URL(root + file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const simulation = {};
vm.runInNewContext(compile('economy/simulation.ts'), { exports: simulation, structuredClone });
function run(auto) {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  const rb = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 1.08, -20).lockRotations().setAdditionalMass(500));
  world.createCollider(RAPIER.ColliderDesc.cuboid(1.05, 1.08, 2.2), rb);
  world.createCollider(RAPIER.ColliderDesc.cuboid(60, 0.5, 50).setTranslation(0, -0.5, 0));
  const runtime = { position: [0, 1.08, -20], yaw: -Math.PI / 2, speed: 0 };
  const controls = { forward: !auto, backward: false, leftward: false, rightward: false, run: false, jump: false };
  const visits = [];
  const completedCash = [];
  const store = { state: simulation.initialEconomy(), phoneOpen: false, driving: !auto, cameraMode: 'first-person', nearby: null, nearVan: false,
    dispatch(action) { const completed = action.type === 'arrive' && this.state.driverStop === 3; if (action.type === 'arrive') visits.push(simulation.STOPS[this.state.driverStop]); this.state = simulation.reduceEconomy(this.state, action); if (completed) completedCash.push(this.state.money); },
  };
  if (auto) { store.state.driverHired = true; store.state.autoDriver = true; }
  const useStore = selector => selector(store);
  useStore.getState = () => store;
  useStore.setState = data => Object.assign(store, data);
  let frame, physics;
  const refs = [];
  const modules = {
    react: { useRef(value) { const ref = { current: value }; refs.push(ref); return ref; }, useMemo: fn => fn(), useEffect() {} },
    'react/jsx-runtime': { jsx: () => null, jsxs: () => null },
    three: THREE,
    '@react-three/fiber': { useFrame: fn => { frame = fn; } },
    '@react-three/rapier': { useRapier: () => ({ world }), useBeforePhysicsStep: fn => { physics = fn; }, interactionGroups: () => 0xffffffff },
    '@/components/common/game-controller/store/control-game-store': { useControlStore: { getState: () => controls } },
    './economy/simulation': simulation,
    './economy/store': { useBusinessStore: useStore, vehicleRuntime: runtime, actorPosition: () => runtime.position, closestPlace: () => null, distance2D: (a, b) => Math.hypot(a[0] - b[0], a.at(-1) - b.at(-1)) },
  };
  const exports = {};
  vm.runInNewContext(compile('delivery-van.tsx'), { exports, require: name => { assert(name in modules, name); return modules[name]; }, document: { pointerLockElement: null } });
  exports.DeliveryVan();
  refs[0].current = rb;
  const camera = new THREE.PerspectiveCamera();
  const steps = auto ? 60 * 45 : 60 * 5;
  let manualDistance;
  for (let tick = 0; tick < steps; tick++) {
    if (!auto && tick === 180) { manualDistance = rb.translation().x; controls.forward = false; controls.jump = true; }
    physics(); world.step(); frame({ camera }, 1 / 60);
    if (tick % 60 === 0) store.dispatch({ type: 'tick' });
    assert(Number.isFinite(rb.translation().x));
    assert(rb.translation().y > 0.9, 'Van must stay on the road');
  }
  if (auto) {
    assert(visits.slice(0, 4).join(',') === 'farm,mill,bakery,shop', visits.join(','));
    assert(store.state.deliveries >= 4, 'Driver must perform actual economic deliveries');
    assert(completedCash[0] > 1000, 'A completed route must earn money after expenses');
    console.log('PASS: physical driver visits every facility and earns delivery income:', completedCash[0]);
  } else {
    assert(manualDistance < -20, 'Forward drive must reach the farm road');
    assert(Math.abs(runtime.speed) < 0.1, 'Brake must stop the van');
    assert(Number.isFinite(camera.position.x), 'First-person driving camera must be valid');
    console.log('PASS: manual drive, brakes, ground contact and first-person camera');
  }
  world.free();
}
run(false); run(true);
