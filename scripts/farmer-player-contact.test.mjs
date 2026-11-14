import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import RAPIER from '@dimforge/rapier3d-compat';
await RAPIER.init();
const root = new URL('../src/components/page-partials/pages/experimental/three-scenes/games/rts-farmer/navigation/', import.meta.url);
const cache = new Map();
function load(url) {
  if (cache.has(url.href)) return cache.get(url.href);
  const exports = {}; cache.set(url.href, exports);
  vm.runInNewContext(ts.transpileModule(readFileSync(url, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, structuredClone, require: name => load(new URL(`${name}.ts`, url)) });
  return exports;
}
const { ResidentCrowd } = load(new URL('crowd.ts', root));
const { stepResidentBody } = load(new URL('physics.ts', root));
for (const hz of [30, 60, 120]) for (const scenario of ["approach", "overlap"]) {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  world.timestep = 1 / hz;
  world.createCollider(RAPIER.ColliderDesc.cuboid(60, 0.5, 50).setTranslation(0, -0.5, 0));
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(-16, 1.3, 15));
  const shape = world.createCollider(RAPIER.ColliderDesc.capsule(0.7, 0.55), body);
  const player = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(scenario === "overlap" ? -15.2 : -7, 1.3, 15).lockRotations().setCcdEnabled(true));
  world.createCollider(RAPIER.ColliderDesc.capsule(0.8, 0.4), player);
  const controller = world.createCharacterController(0.03);
  controller.disableAutostep(); controller.disableSnapToGround(); controller.setSlideEnabled(true); controller.setApplyImpulsesToDynamicBodies(false);
  const crowd = new ResidentCrowd();
  for (const other of crowd.agents) crowd.command(other.id, { type: "stop" });
  const a = crowd.agents[0]; a.x = -16; a.z = 15; crowd.command(0, { type: "go", place: "bakery" });
  world.step();
  let progressAtSix = -Infinity;
  let reversals = 0, toggles = 0, previous = { x: 0, z: 0 };
  for (let tick = 0; tick < hz * 8; tick++) {
    const p = body.translation(), user = player.translation(), dt = world.timestep;
    Object.assign(a, { x: p.x, z: p.z });
    if (tick === hz * 6) progressAtSix = p.x;
    crowd.step(dt, { x: user.x, z: user.z });
    a.velocity = stepResidentBody(controller, body, shape, a.velocity, dt, false);
    const speed = Math.hypot(a.velocity.x, a.velocity.z), oldSpeed = Math.hypot(previous.x, previous.z);
    if (speed > 0.4 && oldSpeed > 0.4 && (a.velocity.x * previous.x + a.velocity.z * previous.z) / (speed * oldSpeed) < 0) reversals++;
    if ((speed > 0.3) !== (oldSpeed > 0.3)) toggles++;
    previous = a.velocity;
    player.setLinvel({ x: tick < hz * 4 ? -4.2 : 0, y: player.linvel().y, z: 0 }, true);
    world.step();
  }
  console.log(`PASS: physical player encounter ${scenario} at ${hz} Hz — ${reversals} reversals, ${toggles} motion transitions`);
  assert.ok(body.translation().x > player.translation().x + 2 && body.translation().x - progressAtSix > 1, `NPC passes player and continues along route: ${scenario} ${hz}Hz at x=${body.translation().x}`);
  assert.ok(reversals <= 2, `Player encounter must not repeatedly reverse the NPC (${reversals} at ${hz}Hz)`);
  assert.ok(toggles <= 6, `Player encounter must not repeatedly start/stop (${toggles} at ${hz}Hz)`);
  // Repeated player pressure cannot move a character ordered to stand still.
  crowd.command(0, { type: 'stop' });
  const held = body.translation();
  player.setTranslation({ x: held.x + 0.8, y: 1.3, z: held.z }, true);
  world.step();
  for (let tick = 0; tick < hz * 2; tick++) {
    a.velocity = stepResidentBody(controller, body, shape, { x: 0, z: 0 }, world.timestep, true);
    player.setLinvel({ x: -4.2, y: player.linvel().y, z: 0 }, true);
    world.step();
    const p = body.translation();
    assert.ok(Math.abs(p.x - held.x) < 0.00001 && Math.abs(p.z - held.z) < 0.00001, 'Stationary NPC must not drift under player contact');
    assert.ok(Math.abs(p.y - held.y) < 0.01, 'Stationary NPC must not hop under player contact');
  }
  world.free();
}

console.log("PASS: stopped NPC holds position under sustained physical player contact at 30/60/120 Hz");
