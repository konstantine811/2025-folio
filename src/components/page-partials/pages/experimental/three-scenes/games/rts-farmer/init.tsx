import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics, interactionGroups } from "@react-three/rapier";
import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import InitKeyboardController from "@/components/common/game-controller/init-keyboard";
import { usePlayerPositionStore } from "../../character-controller/physics-world/usePlayerPositionStore";
import ThreeLoader from "../../common/three-loader";
import { CharacterController } from "../../character-controller/controller/character-controller";
import { FarmerCharacter } from "./character";
import { District } from "./district";
import { GroundReadyActors } from "./ground-physics";
import { DISTRICT_GROUND_Y, safePlayerSpawn } from "./ground";
import { Residents, ResidentCommands } from "./navigation/residents";
import { DeliveryVan } from "./delivery-van";
import { CompanyPhone, DistrictMap } from "./company-phone";
import { CAPACITY, PLACES, cargoCount, objective } from "./economy/simulation";
import { actorPosition, clearBusinessInput, saveBusiness, useBusinessStore } from "./economy/store";

function openInteraction() {
  const store = useBusinessStore.getState();
  useBusinessStore.setState({ phonePage: store.nearby ? "trade" : "route" });
  store.setPhone(true);
}
function toggleCamera() {
  useBusinessStore.setState(s => ({ cameraMode: s.cameraMode === "first-person" ? "third-person" : "first-person" }));
}
function GameLifecycle() {
  useEffect(() => {
    const spawn = safePlayerSpawn(useBusinessStore.getState().playerSpawn);
    usePlayerPositionStore.setState({ position: { x: spawn[0], y: spawn[1], z: spawn[2] } });
    const key = (event: KeyboardEvent) => {
      const store = useBusinessStore.getState();
      if (event.repeat) return;
      if (event.code === "Tab") { event.preventDefault(); store.setPhone(!store.phoneOpen); }
      else if (event.code === "Escape" && store.phoneOpen) store.setPhone(false);
      else if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
      else if (!store.phoneOpen && event.code === "KeyV") toggleCamera();
      else if (!store.phoneOpen && event.code === "KeyF") store.board();
      else if (!store.phoneOpen && event.code === "KeyE") openInteraction();
    };
    window.addEventListener("keydown", key, true);
    const clock = window.setInterval(() => {
      const store = useBusinessStore.getState();
      if (!document.hidden && !store.phoneOpen) {
        store.dispatch({ type: "tick" });
        if (!store.state.bakeryBroken && useBusinessStore.getState().state.bakeryBroken) {
          useBusinessStore.setState({ phonePage: "company" });
          store.setPhone(true);
        }
      }
    }, 1000);
    const autosave = window.setInterval(saveBusiness, 5000);
    const stop = () => { clearBusinessInput(); saveBusiness(); };
    window.addEventListener("pagehide", stop);
    window.addEventListener("blur", clearBusinessInput);
    return () => {
      window.removeEventListener("keydown", key, true); window.removeEventListener("pagehide", stop); window.removeEventListener("blur", clearBusinessInput);
      window.clearInterval(clock); window.clearInterval(autosave); stop();
      if (!useBusinessStore.getState().driving) useBusinessStore.setState({ playerSpawn: safePlayerSpawn(actorPosition()) });
      if (document.pointerLockElement) document.exitPointerLock();
    };
  }, []);
  return null;
}
function GameScene() {
  const phoneOpen = useBusinessStore(s => s.phoneOpen);
  const driving = useBusinessStore(s => s.driving);
  const cameraMode = useBusinessStore(s => s.cameraMode);
  const spawn = useBusinessStore(s => s.playerSpawn);
  const epoch = useBusinessStore(s => s.epoch);
  return <Physics gravity={[0, -9.81, 0]} paused={phoneOpen}>
    <District />
    <GroundReadyActors>
    <Residents />
    <DeliveryVan key={`van-${epoch}`} />
    {!driving && <CharacterController key={`player-${epoch}-${spawn.join(",")}`} startPosition={spawn} manageCamera={!phoneOpen}
      minimumGroundY={DISTRICT_GROUND_Y} cameraMode={cameraMode} moveSpeed={12} jumpForce={2} jumpStartDelay={0.55} movingJumpStartDelay={0}
      capsuleCollisionGroups={interactionGroups(0, [1, 2])} raycastFilterGroups={[1, 2]}
      renderCharacter={({ modelRef, controllerState }) => <group ref={modelRef} position={[0, -1.2, 0]} visible={cameraMode !== "first-person"}>
        <FarmerCharacter isMoving={controllerState.isMoving} isSprinting={controllerState.isSprinting} isGrounded={controllerState.isGrounded}
          isJumpPreparing={controllerState.isJumpPreparing} isMovingJump={controllerState.isMovingJump} verticalVelocity={controllerState.velocity.y} />
      </group>} />}
    </GroundReadyActors>
  </Physics>;
}
function GameHUD() {
  const store = useBusinessStore();
  const { state, nearby, nearVan, driving } = store;
  const mission = objective(state);
  return <>
    <div className="pointer-events-none absolute left-3 top-3 max-w-[290px] rounded-2xl border border-white/40 bg-[#f7f5e8]/95 p-4 text-[#294b39] shadow-lg sm:left-5 sm:top-5">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#869274]">{state.repaired ? "Рубіж пройдено" : "Історія твоєї компанії"}</p>
      <h2 className="mt-1 text-base font-bold">{mission.title}</h2><p className="mt-2 text-[11px] leading-relaxed">{mission.text}</p>
      <div className="mt-3 border-t border-[#d7dfc8] pt-3 text-[10px] text-[#758769]">{state.autoDriver ? "● Водій на автомаршруті" : driving ? "● За кермом фургона" : "● Пішки"} · День {Math.floor(state.seconds / 120) + 1}</div>
    </div>
    {state.bakeryBroken && <button onClick={() => { useBusinessStore.setState({ phonePage: "company" }); store.setPhone(true); }} className="absolute left-3 top-48 rounded-xl bg-[#a6533f] px-4 py-3 text-xs text-white shadow-lg sm:left-5">⚒ Піч зламана · викликати майстра</button>}
    <div className="absolute bottom-24 right-5 hidden w-[210px] rounded-2xl border border-white/50 bg-[#eef1e3]/95 p-2 shadow-lg md:block"><DistrictMap compact /></div>
    <div className="pointer-events-none absolute bottom-28 left-3 max-w-[330px] rounded-xl bg-[#1f4135]/95 px-4 py-3 text-[11px] leading-relaxed text-[#e5e9d1] sm:left-5" role="status">{state.messages[0]}</div>
    <div className="absolute bottom-4 left-3 right-3 flex flex-wrap items-end justify-between gap-3 sm:left-5 sm:right-5">
      <div className="flex flex-wrap gap-2">
        {(driving || nearVan) && <button onClick={store.board} className="rounded-xl bg-[#e7d196] px-4 py-3 text-xs font-bold text-[#264735] shadow-lg">{driving ? "F · Вийти з фургона" : "F · Сісти у фургон"}</button>}
        {nearby && <button onClick={openInteraction} className="rounded-xl bg-[#f6f3e4] px-4 py-3 text-xs font-bold text-[#264735] shadow-lg">E · {PLACES[nearby].name}</button>}
        <button onClick={() => store.setPhone(true)} className="rounded-xl bg-[#244b3c] px-4 py-3 text-xs text-white shadow-lg">Tab · Телефон</button>
      </div>
      <p className="pointer-events-none rounded-lg bg-[#244b3c]/90 px-3 py-2 text-[10px] text-white/80">{driving ? "W/S — газ / назад · A/D — кермо · Space — гальмо" : "WASD — рух · Shift — біг · Space — стрибок"} · V — камера</p>
    </div>
    <ResidentCommands />
    <div className="pointer-events-none absolute right-4 top-4 rounded-xl bg-[#244b3c]/90 px-3 py-2 text-xs text-[#e6d69e]">Вантаж {cargoCount(state)}/{CAPACITY}</div>
  </>;
}
export default function Init() {
  const state = useBusinessStore(s => s.state);
  const phoneOpen = useBusinessStore(s => s.phoneOpen);
  const cameraMode = useBusinessStore(s => s.cameraMode);
  const saveError = useBusinessStore(s => s.saveError);
  return <MainWrapperOffset isFullHeight className="flex min-h-0 flex-1 flex-col bg-[#173a30]">
    <GameLifecycle />
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#1b3d32] px-4 py-3 text-[#f2eed7] sm:px-6">
      <div><div className="flex items-center gap-3"><h1 className="text-sm font-bold tracking-[0.18em]">RTS FARMER</h1><span className="rounded-md border border-[#7a9271]/50 px-2 py-0.5 text-[9px] uppercase tracking-widest text-[#bdc9a5]">Перша компанія</span></div><p className="mt-1 text-[10px] text-[#b1c1a4]">Почни з доставки. Створи справу, потрібну місту.</p></div>
      <div className="flex items-center gap-3"><div className="text-right"><p className="text-lg font-bold text-[#e7d196]">{Math.round(state.money).toLocaleString("uk-UA")} <span className="text-xs font-normal">мон.</span></p><p className={`text-[9px] ${saveError ? "text-red-300" : "text-[#a2b59c]"}`}>{saveError ? "Помилка збереження" : "Автозбереження · локально"}</p></div>
      <button onClick={toggleCamera} className="rounded-xl border border-white/20 px-3 py-2 text-[11px] hover:bg-white/10">{cameraMode === "first-person" ? "Третя особа" : "Перша особа"} · V</button></div>
    </header>
    <div className="relative min-h-[440px] flex-1 overflow-hidden">
      {!phoneOpen && <InitKeyboardController isIgnorePause />}<ThreeLoader />
      <Canvas shadows camera={{ position: [-4, 5, -27], fov: 60, near: 0.05, far: 200 }} className="!absolute inset-0 touch-none" onPointerDown={event => {
        if (!useBusinessStore.getState().phoneOpen && event.pointerType === "mouse" && !document.pointerLockElement) void (event.target as HTMLCanvasElement).requestPointerLock()?.catch(() => {});
      }}>
        <color attach="background" args={["#dce6dc"]} /><fog attach="fog" args={["#dce6dc", 70, 155]} />
        <hemisphereLight args={["#fff5dc", "#718262", 2]} />
        <directionalLight position={[-25, 45, -30]} intensity={2.4} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-65} shadow-camera-right={65} shadow-camera-top={60} shadow-camera-bottom={-60} shadow-camera-far={150} shadow-normalBias={0.04} />
        <Suspense fallback={null}><GameScene /></Suspense>
      </Canvas>
      {!phoneOpen && <><GameHUD />{cameraMode === "first-person" && <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/70">·</div>}</>}
      {phoneOpen && <CompanyPhone />}
    </div>
  </MainWrapperOffset>;
}
