import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const base = new URL('../src/components/page-partials/pages/experimental/three-scenes/games/codeworlds/code/', import.meta.url);
const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(new URL(`${name}.ts`, base), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(code, { exports, require: id => id.startsWith('./') ? load(id.slice(2)) : require(id) });
  cache.set(name, exports);
  return exports;
}
const { runWorldCode } = load('runtime');
const { EXAMPLES } = load('examples');
for (const [index, count] of [10,10,12].entries()) assert.equal(runWorldCode(EXAMPLES[index].code).world.entities.length,count);
assert.equal(runWorldCode('const a = [2, 3]; world.create("block", {size: [a[0], a[1], 4]});').world.entities[0].size[1],3);
assert.equal(runWorldCode('let a = 0; for(let i=0;i<3;i++){a=a+1;} if(a===3){world.name("OK");}').world.name,'OK');
for (const source of [
  'for(;;) {}',
  'for(let i=0;i<201;i++){world.create("block");}',
  'world.create("block", {position: [100,0,0]});',
  'world.create("block", {size: [1/0,1,1]});',
  'world.create("block", {id:"same"}); world.create("tree", {id:"same"});',
  'world.spawn(0,0,0); world.create("block");',
  'window.localStorage.clear();', 'fetch("https://example.com");',
  'console.log.constructor("return globalThis")();',
  'const a = {__proto__: {}};', 'const a = 1; a=2;',
  'import x from "https://example.com";', 'world.name(',
]) assert.throws(() => runWorldCode(source), source);
const initial = runWorldCode('world.name("Previous world");').world;
assert.throws(() => runWorldCode('world.name("Changed"); unknown();'));
assert.equal(initial.name,'Previous world');
console.log('PASS: 3 templates, expressions, loops, validation, execution limits, forbidden host access, independent runs');
