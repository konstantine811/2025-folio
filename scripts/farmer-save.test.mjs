import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { create } from 'zustand';
import { z } from 'zod';
const root = '../src/components/page-partials/pages/experimental/three-scenes/games/rts-farmer/economy/';
const compile = name => ts.transpileModule(readFileSync(new URL(root + name, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const simulation = {};
vm.runInNewContext(compile('simulation.ts'), { exports: simulation, structuredClone });
const ground = {};
vm.runInNewContext(compile("../ground.ts"), { exports: ground });
let persisted = null;
let blocked = false;
let player = { x: -4, y: 1.3, z: -20 };
const load = () => {
  const exports = {};
  const modules = {
    zustand: { create }, zod: { z }, './simulation': simulation, '../ground': ground,
    '@/components/common/game-controller/store/control-game-store': { useControlStore: { getState: () => ({ resetControls() {} }) } },
    '../../../character-controller/physics-world/usePlayerPositionStore': { usePlayerPositionStore: { getState: () => ({ position: player }), setState: state => { player = state.position; } } },
  };
  vm.runInNewContext(compile('store.ts'), { exports, require: name => { assert(name in modules, name); return modules[name]; }, structuredClone,
    document: { pointerLockElement: null }, localStorage: { getItem: () => persisted, setItem: (_, value) => { if (blocked) throw Error('quota'); persisted = value; } },
  });
  return exports;
};
let module = load();
const store = module.useBusinessStore;
assert.equal(store.getState().state.money, 1000);
store.getState().trade('farm', 'buy', 'apples', 10);
assert.equal(store.getState().state.money, 1000, 'Remote trading must be blocked');
player = { x: -26, y: 1.3, z: -20 };
module.vehicleRuntime.position = [-26, 1.08, -20];
store.getState().trade('farm', 'buy', 'apples', 10);
assert.equal(store.getState().state.money, 800);
assert.equal(store.getState().state.cargo.apples, 10);
module.saveBusiness();
const valid = persisted;
module = load();
assert.equal(module.useBusinessStore.getState().state.money, 800);
assert.equal(module.useBusinessStore.getState().state.cargo.apples, 10);
assert.equal(module.vehicleRuntime.position[0], -26);
assert.equal(module.useBusinessStore.getState().phoneOpen, false);
console.log('PASS: proximity and parked van required; money, cargo and van position restore after reload');
for (const invalid of ['not json', '{}', JSON.stringify({ state: { version: 99 } })]) {
  persisted = invalid;
  assert.equal(load().useBusinessStore.getState().state.money, 1000);
}
const corrupt = JSON.parse(valid);
corrupt.state.money = -1;
persisted = JSON.stringify(corrupt);
assert.equal(load().useBusinessStore.getState().state.money, 1000);
corrupt.state.money = 800;
corrupt.state.cargo.apples = 21;
persisted = JSON.stringify(corrupt);
assert.equal(load().useBusinessStore.getState().state.money, 1000);
persisted = valid;
module = load();
blocked = true;
module.saveBusiness();
assert.equal(module.useBusinessStore.getState().saveError, true);
blocked = false;
module.saveBusiness();
assert.equal(module.useBusinessStore.getState().saveError, false);
const epoch = module.useBusinessStore.getState().epoch;
module.useBusinessStore.getState().reset();
assert.equal(module.useBusinessStore.getState().state.money, 1000);
assert.equal(module.useBusinessStore.getState().epoch, epoch + 1);
console.log('PASS: corrupt/incompatible saves, capacity validation, storage failure/recovery and new company reset');

const undergroundSave = JSON.parse(valid);
for (const y of [-4, -100, -10000]) {
  undergroundSave.player = [-26, y, -20];
  persisted = JSON.stringify(undergroundSave);
  module = load();
  assert.equal(module.useBusinessStore.getState().state.money, 800, 'Recovery preserves company progress');
  assert.deepEqual(Array.from(module.useBusinessStore.getState().playerSpawn), [-26, 1.3, -20]);
}
player = { x: -26, y: -3, z: -20 };
module.saveBusiness();
assert.equal(JSON.parse(persisted).player[1], 1.3, 'Never persist an underground player pose');
console.log('PASS: underground saves recover safe height without losing progress; saves cannot persist a fall');
