import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source = readFileSync(new URL('../src/components/page-partials/pages/experimental/three-scenes/games/rts-farmer/economy/simulation.ts', import.meta.url), 'utf8');
const exports = {};
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, structuredClone });
const { initialEconomy, reduceEconomy: reduce, cargoCount, purchasePrice, salePrice } = exports;
const buy = (s, place, good, quantity) => reduce(s, { type: 'trade', direction: 'buy', place, good, quantity });
const sell = (s, place, good, quantity) => reduce(s, { type: 'trade', direction: 'sell', place, good, quantity });
let state = initialEconomy();
const initial = state;
const original = JSON.stringify(initial);
state = buy(state, 'farm', 'apples', 20);
assert.equal(JSON.stringify(initial), original);
assert.equal(state.money, 600);
assert.equal(cargoCount(state), 20);
assert.equal(buy(state, 'farm', 'wheat', 1).money, 600);
state = sell(state, 'shop', 'apples', 20);
assert.equal(state.money, 1200);
assert.equal(state.tradeProfit, 200);
assert.equal(state.cargoCost.apples, 0);
assert.equal(state.demand.shop.apples, 20);
assert.equal(sell(state, 'shop', 'apples', 1).money, 1200);
for (const quantity of [-1, 0, NaN, Infinity, 21]) assert.equal(buy(state, 'farm', 'apples', quantity).money, 1200);
console.log('PASS: first delivery = 400 purchase + 100 route → 700 revenue → 200 profit; cargo, stock and invalid trade guards');

state = initialEconomy();
state = buy(state, 'farm', 'apples', 10);
state.seconds = 120;
state = buy(state, 'farm', 'apples', 10);
state = sell(state, 'shop', 'apples', 5);
assert.equal(state.cargoCost.apples, 277.5);
assert.equal(state.cargo.apples, 15);
state.demand.shop.apples = 5;
assert.equal(salePrice(state, 'shop', 'apples'), 28);
const denied = sell(state, 'shop', 'apples', 6);
assert.equal(denied.money, state.money);
state.seconds = 120;
assert.equal(purchasePrice(state, 'farm', 'apples'), 17);
console.log('PASS: weighted cargo cost, finite demand, low-demand prices and harvest discount');

state = initialEconomy();
state = reduce(state, { type: 'hire' });
assert.equal(state.driverHired, false);
for (let i = 0; i < 3; i++) {
  state = buy(state, 'farm', 'apples', 20);
  state = sell(state, 'shop', 'apples', 20);
  // Wait for residents' next orders and the farm's next harvest.
  for (let t = 0; t < 60; t++) state = reduce(state, { type: 'tick' });
}
assert(state.deliveries >= 3);
state = reduce(state, { type: 'hire' });
assert.equal(state.driverHired, true);
const hiredMoney = state.money;
assert.equal(reduce(state, { type: 'hire' }).money, hiredMoney);
state = reduce(state, { type: 'automation', enabled: true });
for (let rounds = 0; rounds < 10 && state.money < 2100; rounds++) {
  for (let stop = 0; stop < 4; stop++) {
    state = reduce(state, { type: 'arrive' });
    for (let t = 0; t < 12; t++) state = reduce(state, { type: 'tick' });
    assert(state.money >= 0);
    assert(cargoCount(state) <= 20);
  }
}
assert(state.money >= 1800, 'A hired driver must make deliveries that finance expansion');
state = reduce(state, { type: 'buyBakery' });
assert(state.bakeryOwned);
const boughtMoney = state.money;
assert.equal(reduce(state, { type: 'buyBakery' }).money, boughtMoney);
for (let t = 0; t < 100 && !state.bakeryBroken; t++) state = reduce(state, { type: 'tick' });
assert(state.bakeryBroken, 'First breakdown follows five owned production batches');
const stoppedBatches = state.bakeryBatches;
for (let t = 0; t < 30; t++) state = reduce(state, { type: 'tick' });
assert.equal(state.bakeryBatches, stoppedBatches);
state.money = Math.max(180, state.money);
state = reduce(state, { type: 'repair' });
assert(state.repaired && !state.bakeryBroken);
for (let t = 0; t < 100; t++) state = reduce(state, { type: 'tick' });
assert(!state.bakeryBroken, 'The tutorial breakdown must not loop endlessly');
console.log('PASS: full milestone — three deliveries, driver earns expansion funds, bakery purchase, breakdown, repair and resumed production');

state = initialEconomy();
state.bakeryOwned = true;
state = buy(state, 'mill', 'flour', 10);
const beforeTransfer = state.money;
state = sell(state, 'bakery', 'flour', 10);
assert.equal(state.money, beforeTransfer - 50, 'Own business cannot pay the player fictional external revenue');
assert.equal(state.tradeProfit, 0);
state.money = 0;
state = reduce(state, { type: 'relief' });
assert.equal(state.money, 150);
assert.equal(reduce(state, { type: 'relief' }).money, 150);
for (let t = 0; t < 60; t++) state = reduce(state, { type: 'tick' });
const beforeRelief = state.money;
assert.equal(reduce(state, { type: 'relief' }).money, beforeRelief + 150);
assert(Object.values(state.cargo).every(value => value >= 0));
console.log('PASS: internal transfers, company accounting and recovery job cooldown');
