import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import RAPIER from '@dimforge/rapier3d-compat';
await RAPIER.init();
const root = new URL('../src/components/page-partials/pages/experimental/three-scenes/games/rts-farmer/', import.meta.url);
const cache = new Map();
function load(url) {
  if (cache.has(url.href)) return cache.get(url.href);
  const exports = {}; cache.set(url.href, exports);
  vm.runInNewContext(ts.transpileModule(readFileSync(url, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, structuredClone, require: name => load(new URL(`${name}.ts`, url)) });
  return exports;
}
const { ResidentCrowd, chooseVelocity, isResidentStationary } = load(new URL('navigation/crowd.ts', root));
const { servicePoint, obstacles } = load(new URL('navigation/world.ts', root));
const { stepResidentBody } = load(new URL('navigation/physics.ts', root));
const { walkable, findPath } = load(new URL('navigation/pathfinding.ts', root));
const { PLACES } = load(new URL('economy/simulation.ts', root));
for (const place of Object.keys(PLACES)) for (let slot = 0; slot < 4; slot++) {
  const point = servicePoint(place, slot);
  assert.ok(walkable(point, obstacles), `${place} queue slot ${slot} accessible`);
  assert.ok(findPath({ x: 0, z: -15 }, point, obstacles).length, `${place} queue reachable`);
}
// A valid position beside an inflated wall must survive rounding to the grid.
assert.ok(findPath({ x: 0, z: 5.3 }, { x: 5, z: 8 }, [{ x: 0, z: 0, hx: 3, hz: 4.6 }]).length);
function simulate(crowd, seconds, player = { x: 55, z: 45 }) {
  const dt = 1 / 30;
  for (let tick = 0; tick < seconds * 30; tick++) {
    crowd.step(dt, player);
    for (const a of crowd.agents) { a.x += a.velocity.x * dt; a.z += a.velocity.z * dt; assert.ok(Number.isFinite(a.x + a.z)); assert.ok(walkable(a.target, obstacles), `${a.id}: ${a.phase} target must be accessible`); }
  }
}

const one = { id: 0, x: -12, z: 15, stalled: 0 }, two = { id: 1, x: -8, z: 15, stalled: 0 };
for (let tick = 0; tick < 180; tick++) {
  const v1 = chooseVelocity(one, { x: -5, z: 15 }, [{ ...two, radius: 0.72 }], 1 / 30);
  const v2 = chooseVelocity(two, { x: -15, z: 15 }, [{ ...one, radius: 0.72 }], 1 / 30);
  one.velocity = v1; two.velocity = v2;
  one.x += v1.x / 30; one.z += v1.z / 30; two.x += v2.x / 30; two.z += v2.z / 30;
  assert.ok(Math.hypot(one.x - two.x, one.z - two.z) > 1.35, 'Head-on bodies remain separated');
}
assert.ok(one.x > two.x, 'Head-on agents pass each other');
const yielding = chooseVelocity({ x: -10, z: 15, id: 0, stalled: 0 }, undefined, [{ x: -9, z: 15, radius: 0.85, id: -1 }], 1 / 30);
assert.equal(yielding.x, 0, 'Stationary character stays put beside player');
assert.equal(yielding.z, 0);
console.log('PASS: head-on agents pass with body clearance; stationary character keeps its position');


const parked = new ResidentCrowd();
for (const a of parked.agents) parked.command(a.id, { type: 'stop' });
const parkedPositions = parked.agents.map(a => ({ x: a.x, z: a.z }));
for (let tick = 0; tick < 300; tick++) {
  parked.step(1 / 30, { x: parkedPositions[0].x + 0.2, z: parkedPositions[0].z });
  for (const a of parked.agents) {
    assert.equal(a.velocity.x, 0, 'Stopped actor never yields to proximity');
    assert.equal(a.velocity.z, 0);
    assert.equal(a.x, parkedPositions[a.id].x); assert.equal(a.z, parkedPositions[a.id].z);
  }
}
const bypass = new ResidentCrowd();
for (const a of bypass.agents) bypass.command(a.id, { type: 'stop' });
bypass.agents[0].x = -16; bypass.agents[0].z = 15;
bypass.agents[1].x = -12; bypass.agents[1].z = 15;
bypass.command(0, { type: 'follow' });
simulate(bypass, 20, { x: -6, z: 15 });
assert.ok(bypass.agents[0].x > -10, 'Moving actor passes the stopped actor');
assert.equal(bypass.agents[1].x, -12); assert.equal(bypass.agents[1].z, 15);
const { updateLocomotion } = load(new URL('navigation/locomotion.ts', root));
const motion = { moving: false, pending: 0 };
for (let i = 0; i < 120; i++) assert.equal(updateLocomotion(motion, i % 2 ? 0 : 0.5, 1 / 60, false), false, 'Contact noise cannot repeatedly start walking');
for (let i = 0; i < 20; i++) updateLocomotion(motion, 2, 1 / 60, false);
assert.equal(motion.moving, true);
for (let i = 0; i < 120; i++) assert.equal(updateLocomotion(motion, i % 2 ? 0 : 0.5, 1 / 60, false), true, 'Brief contact stops cannot flicker walk/idle');
assert.equal(updateLocomotion(motion, 2, 1 / 60, true), false, 'Explicit stop switches to idle immediately');
console.log('PASS: stationary positions remain pinned and animation ignores contact noise');

const crowd = new ResidentCrowd();
for (const a of crowd.agents) crowd.command(a.id, { type: 'go', place: 'bakery' });
simulate(crowd, 180);
for (const a of crowd.agents) assert.ok(a.visits >= 2, `${a.id} leaves shared doorway and continues routines (${a.visits} visits, ${a.status}, ${a.x.toFixed(1)},${a.z.toFixed(1)})`);
console.log('PASS: all queue slots reachable, wall rounding repaired, four agents share bakery without deadlock and continue visiting');
const chatting = new ResidentCrowd();
chatting.agents[0].x = -10; chatting.agents[0].z = 15;
chatting.agents[1].x = -7.8; chatting.agents[1].z = 15;
chatting.agents[0].cooldown = chatting.agents[1].cooldown = 0;
chatting.step(1 / 30, { x: 55, z: 45 });
assert.equal(chatting.agents[0].partner, 1);
assert.equal(chatting.agents[1].partner, 0);
simulate(chatting, 8);
assert.equal(chatting.agents[0].partner, null);
assert.equal(chatting.agents[1].partner, null);
assert.ok(chatting.agents[0].cooldown > 0);
chatting.command(0, { type: 'talk' });
simulate(chatting, 1, { x: chatting.agents[0].x + 2, z: chatting.agents[0].z });
assert.equal(chatting.agents[0].phase, 'chat');
chatting.command(0, { type: 'follow' });
assert.equal(chatting.agents[0].phase, 'travel');
assert.equal(chatting.agents[0].bubble, '');
console.log('PASS: reciprocal conversation, timed farewell, cooldown, player conversation and command interruption');

// Exercise the same crowd against real Rapier capsules, walls, and the ground.
const physical = new ResidentCrowd();
const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
world.timestep = 1 / 30;
world.createCollider(RAPIER.ColliderDesc.cuboid(60, 0.5, 50).setTranslation(0, -0.5, 0));
for (const o of obstacles) world.createCollider(RAPIER.ColliderDesc.cuboid(o.hx, 2.5, o.hz).setTranslation(o.x, 2.5, o.z));
const bodies = physical.agents.map(a => {
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(a.x, 1.3, a.z));
  const shape = world.createCollider(RAPIER.ColliderDesc.capsule(0.7, 0.55), body);
  const controller = world.createCharacterController(0.03);
  controller.disableAutostep(); controller.disableSnapToGround(); controller.setSlideEnabled(true); controller.setApplyImpulsesToDynamicBodies(false);
  physical.command(a.id, { type: 'go', place: 'bakery' });
  return { body, shape, controller };
});
world.step();
for (let tick = 0; tick < 30 * 240; tick++) {
  for (let i = 0; i < bodies.length; i++) Object.assign(physical.agents[i], { x: bodies[i].body.translation().x, z: bodies[i].body.translation().z });
  physical.step(world.timestep, { x: 55, z: 45 });
  for (let i = 0; i < bodies.length; i++) {
    const { body, shape, controller } = bodies[i], a = physical.agents[i], dt = world.timestep;
    a.velocity = stepResidentBody(controller, body, shape, a.velocity, dt, isResidentStationary(a));
  }
  world.step();
  for (const { body } of bodies) assert.ok(body.translation().y > 1.1 && body.translation().y < 2, `Grounded capsule: ${JSON.stringify(body.translation())} at ${tick} states ${JSON.stringify(physical.agents.map(a => ({ id: a.id, x: a.x, z: a.z, phase: a.phase, visits: a.visits })))}`);
}
for (const a of physical.agents) assert.ok(a.visits >= 3, `Physical agent ${a.id} must leave queue and resume routines: ${a.visits}, ${a.status}, ${a.x.toFixed(1)}, ${a.z.toFixed(1)}`);
world.free();
console.log('PASS: four minutes of real Rapier crowd movement, ground contact, shared doorway service and resumed routines');
