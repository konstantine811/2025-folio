import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../src/components/common/game-controller/keyboard-controller.tsx', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const handlers = new Map();
const visibility = new Map();
const state = {};
const setters = Object.fromEntries(['Forward','Backward','Leftward','Rightward','Jump','Run'].map(name => [`set${name}`,value => { state[name] = value; }]));
let cleanup;
class Element { constructor(editable) { this.editable = editable; } closest() { return this.editable; } }
const exports = {};
vm.runInNewContext(code, {
  exports, Element,
  window: { addEventListener: (key,fn) => handlers.set(key,fn), removeEventListener: key => handlers.delete(key) },
  document: { hidden: false, addEventListener: (key,fn) => visibility.set(key,fn), removeEventListener: (key,fn) => { assert.equal(visibility.get(key),fn); visibility.delete(key); } },
  require: name => name === 'react' ? { useRef: current => ({current}), useEffect: fn => { cleanup = fn(); } } : { useControlStore: { getState: () => setters } },
});
exports.default();
const down = (code, editable = false, defaultPrevented = false) => handlers.get('keydown')({code,target:new Element(editable),defaultPrevented});
down('KeyW',true); assert.notEqual(state.Forward,true,'Typing in the laptop must not move the player');
down('Space',true); assert.notEqual(state.Jump,true,'Typing spaces must not jump');
down('KeyW',false,true); assert.notEqual(state.Forward,true,'Consumed keys must not move');
down('KeyW'); assert.equal(state.Forward,true);
handlers.get('keyup')({code:'KeyW'}); assert.equal(state.Forward,false);
down('KeyW'); cleanup(); assert.equal(state.Forward,false,'Unmount must release held input');
assert.equal(handlers.size,0); assert.equal(visibility.size,0);
console.log('PASS: editor typing, consumed keys, movement, key release, listener cleanup');
