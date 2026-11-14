import { create } from "zustand";
import { z } from "zod";
import { useControlStore } from "@/components/common/game-controller/store/control-game-store";
import { usePlayerPositionStore } from "../../../character-controller/physics-world/usePlayerPositionStore";
import { CAPACITY, EconomyAction, EconomyState, Good, Place, PLACES, initialEconomy, reduceEconomy } from "./simulation";

import { safePlayerSpawn } from "../ground";

const SAVE_KEY = "rts-farmer.company.v1";
const count = z.number().finite().nonnegative();
const inventory = z.object({ apples: count.int(), wheat: count.int(), flour: count.int(), bread: count.int() });
const costs = z.object({ apples: count, wheat: count, flour: count, bread: count });
const places = z.object({ farm: inventory, mill: inventory, bakery: inventory, shop: inventory, garage: inventory });
const schema = z.object({
  version: z.literal(1), seconds: count.int(), money: count,
  cargo: inventory, cargoCost: costs, stock: places, demand: places,
  deliveries: count.int(), tradeProfit: z.number().finite(), driverHired: z.boolean(), autoDriver: z.boolean(), driverStop: count.int().max(3),
  bakeryOwned: z.boolean(), bakeryBroken: z.boolean(), bakeryBatches: count.int(), breakdownSeen: z.boolean(), repaired: z.boolean(),
  reliefAt: z.number().finite(), ledger: z.array(z.object({ id: count, title: z.string().max(200), amount: z.number().finite(), detail: z.string().max(500) })).max(30),
  messages: z.array(z.string().max(1000)).max(6), nextId: count.int(),
});
const position = z.tuple([z.number().finite().min(-58).max(58), z.number().finite().min(-5).max(20), z.number().finite().min(-48).max(48)]);
// Accept a finite fallen-player height so recovery preserves the rest of an old save.
const savedPlayerPosition = z.tuple([z.number().finite().min(-58).max(58), z.number().finite(), z.number().finite().min(-48).max(48)]);
const saveSchema = z.object({ state: schema, van: z.object({ position, yaw: z.number().finite() }), player: savedPlayerPosition });
export type Pose = { position: [number, number, number]; yaw: number };
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const save = saveSchema.parse(JSON.parse(raw));
    if (Object.values(save.state.cargo).reduce((a, b) => a + b, 0) > CAPACITY) return null;
    return { ...save, player: safePlayerSpawn(save.player) };
  } catch { return null; }
}
const saved = load();
export const vehicleRuntime: Pose & { speed: number } = { position: saved?.van.position ?? [0, 1, -20], yaw: saved?.van.yaw ?? -Math.PI / 2, speed: 0 };
export function clearBusinessInput() { useControlStore.getState().resetControls(); }
export function actorPosition(): [number, number, number] {
  if (useBusinessStore.getState().driving) return vehicleRuntime.position;
  const p = usePlayerPositionStore.getState().position;
  return p ? [p.x, p.y, p.z] : useBusinessStore.getState().playerSpawn;
}
export function distance2D(a: readonly number[], b: readonly number[]) { return Math.hypot(a[0] - b[0], a[a.length - 1] - b[b.length - 1]); }
export function closestPlace(): Place | null {
  const p = actorPosition();
  return (Object.keys(PLACES) as Place[]).find(place => distance2D(p, PLACES[place].point) < 8) ?? null;
}
export function canTrade(place: Place) { return closestPlace() === place && distance2D(vehicleRuntime.position, PLACES[place].point) < 9 && Math.abs(vehicleRuntime.speed) < 1; }

type BusinessStore = {
  state: EconomyState;
  epoch: number;
  phonePage: "route" | "trade" | "company" | "ledger";
  driving: boolean;
  phoneOpen: boolean;
  nearby: Place | null;
  nearVan: boolean;
  playerSpawn: [number, number, number];
  cameraMode: "first-person" | "third-person";
  saveError: boolean;
  dispatch: (action: EconomyAction) => void;
  trade: (place: Place, direction: "buy" | "sell", good: Good, quantity: number) => void;
  setPhone: (open: boolean) => void;
  board: () => void;
  reset: () => void;
};
export const useBusinessStore = create<BusinessStore>((set, get) => ({
  state: saved?.state ?? initialEconomy(), epoch: 0, phonePage: "route", driving: false, phoneOpen: !saved,
  nearby: "garage", nearVan: true, playerSpawn: saved?.player ?? [-4, 1.3, -20], cameraMode: "third-person", saveError: false,
  dispatch: action => set(store => ({ state: reduceEconomy(store.state, action) })),
  trade: (place, direction, good, quantity) => {
    if (!canTrade(place)) { get().dispatch({ type: "message", text: "Припаркуй фургон біля підприємства й підійди до його майданчика завантаження." }); return; }
    get().dispatch({ type: "trade", place, direction, good, quantity });
  },
  setPhone: open => {
    clearBusinessInput();
    if (open && document.pointerLockElement) document.exitPointerLock();
    set({ phoneOpen: open });
  },
  board: () => {
    const store = get();
    clearBusinessInput();
    if (store.driving) {
      if (Math.abs(vehicleRuntime.speed) > 1) { store.dispatch({ type: "message", text: "Спочатку зупини фургон: відпусти газ або натисни Space." }); return; }
      const [x, , z] = vehicleRuntime.position;
      const yaw = vehicleRuntime.yaw;
      const spawn: [number, number, number] = [Math.max(-57, Math.min(57, x - Math.cos(yaw) * 3.2)), 1.3, Math.max(-47, Math.min(47, z + Math.sin(yaw) * 3.2))];
      usePlayerPositionStore.setState({ position: { x: spawn[0], y: spawn[1], z: spawn[2] } });
      set({ driving: false, playerSpawn: spawn });
      return;
    }
    if (distance2D(actorPosition(), vehicleRuntime.position) > 5) { store.dispatch({ type: "message", text: "Підійди ближче до фургона." }); return; }
    if (Math.abs(vehicleRuntime.speed) > 1) { store.dispatch({ type: "automation", enabled: false }); store.dispatch({ type: "message", text: "Водій зупиняється. Зачекай, поки фургон зупиниться." }); return; }
    if (store.state.autoDriver) store.dispatch({ type: "automation", enabled: false });
    set({ driving: true });
  },
  reset: () => {
    vehicleRuntime.position = [0, 1, -20]; vehicleRuntime.yaw = -Math.PI / 2; vehicleRuntime.speed = 0;
    usePlayerPositionStore.setState({ position: { x: -4, y: 1.3, z: -20 } });
    clearBusinessInput();
    set({ epoch: get().epoch + 1, state: initialEconomy(), driving: false, phoneOpen: true, phonePage: "route", nearby: "garage", nearVan: true, playerSpawn: [-4, 1.3, -20], saveError: false });
  },
}));

export function saveBusiness() {
  const store = useBusinessStore.getState();
  const player = safePlayerSpawn(store.driving ? store.playerSpawn : actorPosition());
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ state: store.state, van: { position: vehicleRuntime.position, yaw: vehicleRuntime.yaw }, player }));
    if (store.saveError) useBusinessStore.setState({ saveError: false });
  } catch { if (!store.saveError) useBusinessStore.setState({ saveError: true }); }
}
