import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import RAPIER from '@dimforge/rapier3d-compat';
await RAPIER.init();
const root = new URL('../src/components/page-partials/pages/experimental/three-scenes/games/rts-farmer/', import.meta.url);
const compile = file => ts.transpileModule(readFileSync(new URL(file, root), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const groups = (member, filters) => (1 << member) << 16 | filters.reduce((mask, bit) => mask | 1 << bit, 0);
const ground = {};
vm.runInNewContext(compile('ground.ts'), { exports: ground });
for (let run = 0; run < 12; run++) {
  const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  let ready = false, afterStep;
  const modules = {
    react: { Suspense: 'Suspense', useState: () => [ready, value => { ready = value; }] },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    '@react-three/rapier': { CuboidCollider: 'CuboidCollider', RigidBody: 'RigidBody', interactionGroups: groups, useRapier: () => ({ world, rapier: RAPIER }), useAfterPhysicsStep: fn => { afterStep = fn; } },
  };
  const exports = {};
  vm.runInNewContext(compile('ground-physics.tsx'), { exports, require: name => { assert.ok(name in modules, name); return modules[name]; } });
  assert.equal(exports.GroundReadyActors({ children: 'actors' }), null);
  // Delayed collider mount must never release the actors, even after several steps.
  for (let i = 0; i < run + 1; i++) { world.step(); afterStep(); assert.equal(ready, false); }
  const unrelated = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  const other = world.createCollider(RAPIER.ColliderDesc.cuboid(1, 0.5, 1).setTranslation(0, 0, -15).setCollisionGroups(groups(1, [0, 2])), unrelated);
  world.step(); afterStep(); assert.equal(ready, false, 'An unrelated collider cannot release actors');
  world.removeCollider(other, false);
  const tree = exports.DistrictGround();
  assert.equal(tree.props.colliders, false, 'Ground must not depend on automatic mesh colliders');
  const floor = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  floor.userData = tree.props.userData;
  for (const child of tree.props.children.flat(Infinity)) {
    const p = child.props;
    world.createCollider(RAPIER.ColliderDesc.cuboid(...p.args).setTranslation(...p.position).setCollisionGroups(p.collisionGroups), floor);
  }
  world.step(); afterStep();
  assert.equal(ready, true, 'Actors released after real floor is queryable');
  assert.equal(exports.GroundReadyActors({ children: 'actors' }).props.children, 'actors');
  const player = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(-4, ground.PLAYER_SPAWN_Y, -20).setGravityScale(3).setCcdEnabled(true).lockRotations());
  world.createCollider(RAPIER.ColliderDesc.capsule(0.8, 0.4).setCollisionGroups(groups(0, [1, 2])), player);
  const bot = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(-18, 1.3, 15));
  const capsule = world.createCollider(RAPIER.ColliderDesc.capsule(ground.RESIDENT_HALF_HEIGHT, ground.RESIDENT_RADIUS).setCollisionGroups(groups(2, [0, 1, 2])), bot);
  const controller = world.createCharacterController(0.03);
  controller.enableSnapToGround(0.4);
  // Actors mount between steps; the next step must safely include their colliders.
  for (let tick = 0; tick < 120; tick++) {
    controller.computeColliderMovement(capsule, { x: 0.02, y: -9.81 * world.timestep, z: 0 });
    const movement = controller.computedMovement(), p = bot.translation();
    bot.setNextKinematicTranslation({ x: p.x + movement.x, y: Math.max(ground.RESIDENT_GROUND_CENTER, p.y + movement.y), z: p.z + movement.z });
    world.step();
    assert.ok(player.translation().y >= 1.18, `Player fell on cold start ${run}, tick ${tick}`);
    assert.ok(bot.translation().y >= ground.RESIDENT_GROUND_CENTER - 0.001, `Bot fell on cold start ${run}`);
  }
  world.free();
}
console.log('PASS: 12 cold starts with delayed floor creation, explicit production colliders, matching collision groups, player and bot ground contact from first step');
