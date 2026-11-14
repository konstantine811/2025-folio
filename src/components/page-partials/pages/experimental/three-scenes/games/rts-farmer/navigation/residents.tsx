import { useEffect, useMemo, useRef, useState } from "react";
import { CapsuleCollider, RigidBody, interactionGroups, useBeforePhysicsStep, useRapier } from "@react-three/rapier";
import type { RapierRigidBody, RapierCollider } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { create } from "zustand";
import { Group } from "three";
import { Html } from "@react-three/drei";
import { FarmerCharacter } from "../character";
import { actorPosition, clearBusinessInput, useBusinessStore, vehicleRuntime } from "../economy/store";
import { PLACES, type Place } from "../economy/simulation";
import { RESIDENT_HALF_HEIGHT, RESIDENT_RADIUS } from "../ground";
import { stepResidentBody } from "./physics";
import { updateLocomotion } from "./locomotion";
import { isResidentStationary, ResidentCrowd, RESIDENTS, type Agent, type Command } from "./crowd";

const useResidents = create<{
  selected: number; open: boolean; crowd: ResidentCrowd | null; reply: string;
  select: (id: number) => void; command: (command: Command) => boolean;
}>((set, get) => ({
  selected: 0, open: false, crowd: null, reply: "",
  select: selected => set({ selected, reply: "" }),
  command: command => {
    const { crowd, selected } = get();
    if (!crowd) return false;
    if (command.type === "talk") {
      const a = crowd?.agents[selected], p = actorPosition();
      if (!a || Math.hypot(a.x - p[0], a.z - p[2]) > 3.5) { set({ reply: "Підійдіть до персонажа ближче — на відстань розмови." }); return false; }
      if (useBusinessStore.getState().driving) { set({ reply: "Вийдіть із фургона, щоб поговорити." }); return false; }
      clearBusinessInput();
      set({ reply: "Вітаю! Приємно вас бачити. Про що поговоримо?" });
    } else set({ reply: "" });
    crowd.command(selected, command);
    return true;
  },
}));
type Binding = { body: RapierRigidBody | null; collider: RapierCollider | null };
function Resident({ agent, binding }: { agent: Agent; binding: Binding }) {
  const person = RESIDENTS[agent.id];
  const visual = useRef<Group>(null);
  const elapsed = useRef(0);
  const locomotion = useRef({ moving: false, pending: 0 });
  const [view, setView] = useState({ moving: false, status: "У дорозі", bubble: "" });
  useFrame((_, dt) => {
    const moving = updateLocomotion(locomotion.current, Math.hypot(agent.velocity.x, agent.velocity.z), dt, isResidentStationary(agent));
    let angle: number | undefined;
    if (agent.phase === "chat") {
      const partner = agent.partner === null ? null : useResidents.getState().crowd?.agents[agent.partner];
      const p = actorPosition();
      angle = Math.atan2((partner?.x ?? p[0]) - agent.x, (partner?.z ?? p[2]) - agent.z);
    } else if (moving && Math.hypot(agent.velocity.x, agent.velocity.z) > 0.3) angle = Math.atan2(agent.velocity.x, agent.velocity.z);
    if (visual.current && angle !== undefined) visual.current.rotation.y += Math.atan2(Math.sin(angle - visual.current.rotation.y), Math.cos(angle - visual.current.rotation.y)) * Math.min(1, dt * 9);
    elapsed.current += dt;
    if (elapsed.current > 0.15) {
      elapsed.current = 0;
      setView(old => old.moving === moving && old.status === agent.status && old.bubble === agent.bubble ? old : { moving, status: agent.status, bubble: agent.bubble });
    }
  });
  return <RigidBody ref={rb => { binding.body = rb; }} type="kinematicPosition" colliders={false} position={[person.spawn[0], 1.3, person.spawn[1]]} enabledRotations={[false, false, false]}>
    <CapsuleCollider ref={shape => { binding.collider = shape; }} args={[RESIDENT_HALF_HEIGHT, RESIDENT_RADIUS]} collisionGroups={interactionGroups(2, [0, 1, 2])} />
    <group ref={visual} position={[0, -1.25, 0]}><FarmerCharacter isMoving={view.moving} isSprinting={false} isGrounded isJumpPreparing={false} isMovingJump={false} verticalVelocity={0} /></group>
    <Html position={[0, 1.8 + agent.id * 0.12, 0]} center distanceFactor={12} zIndexRange={[3, 0]} style={{ pointerEvents: "none" }}>
      <div className="whitespace-nowrap rounded bg-[#244b3c]/85 px-2 py-1 text-center text-[10px] text-white">{person.name} · {person.role}<div className="text-[8px] text-[#e7d196]">{view.status}</div></div>
      {view.bubble && <div className="mt-2 max-w-[190px] rounded-xl bg-[#fff8df] px-3 py-2 text-center text-[11px] text-[#244b3c] shadow">{view.bubble}</div>}
    </Html>
  </RigidBody>;
}
function CrowdScene() {
  const { world } = useRapier();
  const crowd = useMemo(() => new ResidentCrowd(), []);
  const bindings = useMemo<Binding[]>(() => RESIDENTS.map(() => ({ body: null, collider: null })), []);
  const controllers = useRef<ReturnType<typeof world.createCharacterController>[]>([]);
  useEffect(() => {
    controllers.current = bindings.map(() => {
      const c = world.createCharacterController(0.03);
      // The district is flat; stepping onto another capsule causes contact hopping.
      c.disableAutostep(); c.disableSnapToGround(); c.setSlideEnabled(true);
      c.setApplyImpulsesToDynamicBodies(false);
      return c;
    });
    useResidents.setState({ crowd, selected: 0, reply: "" });
    const talk = (event: KeyboardEvent) => {
      if (event.code !== "KeyR" || event.repeat || useBusinessStore.getState().phoneOpen || (event.target instanceof Element && event.target.closest("input,textarea,select,[contenteditable='true']"))) return;
      const p = actorPosition();
      const nearest = crowd.agents.reduce((a, b) => Math.hypot(a.x - p[0], a.z - p[2]) < Math.hypot(b.x - p[0], b.z - p[2]) ? a : b);
      useResidents.setState({ selected: nearest.id, open: true });
      useResidents.getState().command({ type: "talk" });
      if (document.pointerLockElement) document.exitPointerLock();
    };
    window.addEventListener("keydown", talk);
    return () => {
      window.removeEventListener("keydown", talk);
      controllers.current.forEach(c => world.removeCharacterController(c)); controllers.current = [];
      useResidents.setState({ crowd: null });
    };
  }, [bindings, crowd, world]);
  useBeforePhysicsStep(() => {
    if (useBusinessStore.getState().phoneOpen || document.hidden || !controllers.current.length) return;
    const dt = Math.min(world.timestep, 0.05), player = actorPosition();
    // Read every body first, then decide for the entire crowd from one snapshot.
    bindings.forEach((b, i) => { if (b.body) Object.assign(crowd.agents[i], { x: b.body.translation().x, z: b.body.translation().z }); });
    crowd.step(dt, { x: player[0], z: player[2] }, { x: vehicleRuntime.position[0], z: vehicleRuntime.position[2] });
    bindings.forEach((b, i) => {
      if (!b.body || !b.collider) return;
      const a = crowd.agents[i];
      a.velocity = stepResidentBody(controllers.current[i], b.body, b.collider, a.velocity, dt, isResidentStationary(a));

    });
  });
  return crowd.agents.map((agent, id) => <Resident key={id} agent={agent} binding={bindings[id]} />);
}
export function Residents() {
  const epoch = useBusinessStore(s => s.epoch);
  return <CrowdScene key={epoch} />;
}
export function ResidentCommands() {
  const store = useResidents();
  const button = "rounded bg-[#406650] px-2 py-1.5 text-[10px] text-white hover:bg-[#567d61]";
  return <div className="absolute right-4 top-16 w-[260px] rounded-xl bg-[#244b3c]/95 p-2 text-white" onPointerDown={e => e.stopPropagation()}>
    <button className="w-full text-left text-xs" onClick={() => { useResidents.setState({ open: !store.open }); if (document.pointerLockElement) document.exitPointerLock(); }}>Мешканці · розмови й команди {store.open ? "▴" : "▾"}</button>
    {store.open && <div className="mt-2 space-y-2">
      <select aria-label="Мешканець" className="w-full rounded bg-[#406650] p-1 text-xs" value={store.selected} onChange={e => store.select(Number(e.target.value))}>{RESIDENTS.map((p, id) => <option key={id} value={id}>{p.name} · {p.role}</option>)}</select>
      <div className="flex flex-wrap gap-1"><button className={button} onClick={() => store.command({ type: "talk" })}>Поговорити · R поруч</button><button className={button} onClick={() => store.command({ type: "follow" })}>За мною</button><button className={button} onClick={() => store.command({ type: "stop" })}>Стій</button><button className={button} onClick={() => store.command({ type: "routine" })}>До своїх справ / розійтись</button></div>
      {store.reply && <div className="rounded-lg bg-[#fff8df] p-2 text-[11px] text-[#244b3c]" role="status">{RESIDENTS[store.selected].name}: {store.reply}<div className="mt-2 flex gap-1"><button className={button} onClick={() => { if (store.command({ type: "talk" })) useResidents.setState({ reply: `Я ${RESIDENTS[store.selected].role.toLowerCase()}. Мій маршрут: ${RESIDENTS[store.selected].route.map(p => PLACES[p].name).join(" → ")}. Після справ звільняю місце для наступного.` }); }}>Як справи?</button><button className={button} onClick={() => store.command({ type: "routine" })}>Бувай!</button></div></div>}
      <p className="text-[10px] text-white/70">Йти до:</p><div className="flex flex-wrap gap-1">{(Object.keys(PLACES) as Place[]).map(place => <button key={place} className={button} onClick={() => store.command({ type: "go", place })}>{PLACES[place].name}</button>)}</div>
      <p className="text-[9px] text-white/60">R — розмова з найближчим. Клік у сцені повертає огляд.</p>
    </div>}
  </div>;
}
