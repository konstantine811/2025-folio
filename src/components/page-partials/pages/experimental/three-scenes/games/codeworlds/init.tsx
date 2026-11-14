import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { DirectionalLight, Group, Object3D } from "three";
import type { RefObject } from "react";
import { Grid } from "@react-three/drei";
import { Physics, RigidBody, interactionGroups } from "@react-three/rapier";
import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import InitKeyboardController from "@/components/common/game-controller/init-keyboard";
import { useControlStore } from "@/components/common/game-controller/store/control-game-store";
import ThreeLoader from "../../common/three-loader";
import { CharacterController } from "../../character-controller/controller/character-controller";
import { CodeworldsCharacter } from "./character";
import { CodePanel } from "./code/code-panel";
import { EXAMPLES } from "./code/examples";
import { runWorldCode } from "./code/runtime";
import { CodeWorld, SOURCE_LIMIT } from "./code/world-model";
import { useWorldCode } from "./code/use-world-code";
import { RespawnOnFall, WorldObjects } from "./code/world-objects";

const STORAGE_KEY = "codeworlds.world-code.v1";
const STARTER_WORLD = runWorldCode(EXAMPLES[0].code).world;
function clearInput() {
  useControlStore.setState({ forward: false, backward: false, leftward: false, rightward: false, run: false, jump: false, primaryClick: false });
}

function PlayerFollowingLight({ playerRef }: { playerRef: RefObject<Group | null> }) {
  const lightRef = useRef<DirectionalLight>(null);
  const [target] = useState(() => new Object3D());

  useFrame(() => {
    if (!playerRef.current || !lightRef.current) return;
    // Move the whole shadow volume with the player, keeping the sun direction fixed.
    playerRef.current.getWorldPosition(target.position);
    target.updateMatrixWorld();
    lightRef.current.position.copy(target.position);
    lightRef.current.position.x += 12;
    lightRef.current.position.y += 18;
    lightRef.current.position.z -= 10;
    lightRef.current.updateMatrixWorld();
  });

  return <>
    <primitive object={target} />
    <directionalLight ref={lightRef} target={target} position={[12, 18, -10]} intensity={3} castShadow
      shadow-mapSize={[2048, 2048]} shadow-camera-left={-25} shadow-camera-right={25}
      shadow-camera-top={25} shadow-camera-bottom={-25} shadow-normalBias={0.03} />
  </>;
}

function Block({ position, size, color }: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return <RigidBody type="fixed" position={position} collisionGroups={interactionGroups(1, [0])}>
    <mesh receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  </RigidBody>;
}

export default function Init() {
  const playerVisualRef = useRef<Group>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [playerRevision, setPlayerRevision] = useState(0);
  const [playerSpawn, setPlayerSpawn] = useState(STARTER_WORLD.spawn);
  const [world, setWorld] = useState<CodeWorld>(STARTER_WORLD);
  const [revision, setRevision] = useState(0);
  const [source, setSource] = useState<string>(() => {
    try { const saved = localStorage.getItem(STORAGE_KEY); return saved && saved.length <= SOURCE_LIMIT ? saved : EXAMPLES[0].code; }
    catch { return EXAMPLES[0].code; }
  });
  const [saved, setSaved] = useState("");
  const applyWorld = useCallback((next: CodeWorld) => { setWorld(next); setRevision(n => n + 1); }, []);
  const runtime = useWorldCode(applyWorld);
  const { run } = runtime;
  const initialSource = useRef(source);
  useEffect(() => { run(initialSource.current); }, [run]);
  const openEditor = useCallback(() => {
    clearInput();
    if (document.pointerLockElement) document.exitPointerLock();
    setEditorOpen(true);
  }, []);
  const closeEditor = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setEditorOpen(false);
  }, []);
  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { closeEditor(); return; }
      if (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable='true']")) return;
      if (event.code === "KeyE" && !event.repeat) {
        event.preventDefault();
        if (editorOpen) closeEditor(); else openEditor();
      }
    };
    window.addEventListener("keydown", keyDown);
    const unsubscribe = useControlStore.subscribe(controls => {
      if (editorOpen && (controls.forward || controls.backward || controls.leftward || controls.rightward || controls.jump)) closeEditor();
    });
    return () => { window.removeEventListener("keydown", keyDown); unsubscribe(); };
  }, [editorOpen, closeEditor, openEditor]);
  const save = () => {
    try { localStorage.setItem(STORAGE_KEY, source); setSaved("Код збережено в цьому браузері."); }
    catch { setSaved("Не вдалося зберегти код у браузері."); }
  };
  const exportCode = () => {
    const url = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
    const link = document.createElement("a"); link.href = url; link.download = "codeworld.js"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  useEffect(() => () => {
    if (document.pointerLockElement) document.exitPointerLock();
    clearInput();
  }, []);

  return <MainWrapperOffset isFullHeight className="flex min-h-0 flex-1 flex-col">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#111b23] px-4 py-3 text-white">
      <div><h1 className="text-sm font-bold tracking-[0.15em]">CODEWORLD<span className="ml-2 text-[10px] font-normal text-emerald-300">ALPHA</span></h1><p className="mt-1 text-[10px] text-slate-400">Build. Code. Play.</p></div>
      <button aria-pressed={editorOpen} onClick={editorOpen ? closeEditor : openEditor} className="rounded-lg bg-emerald-300 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-200">{editorOpen ? "Закрити редактор · Esc" : "Відкрити редактор · E"}</button>
      <button onClick={exportCode} className="text-xs text-slate-400 hover:text-white">Експорт .js ↗</button>
    </header>
    <div className="flex min-h-0 flex-1 flex-col overflow-auto lg:flex-row lg:overflow-hidden">
    <div className="relative min-h-[340px] flex-1">
      <InitKeyboardController isIgnorePause />
      <ThreeLoader />
      <Canvas shadows camera={{ position: [0, 4, -6], fov: 55, near: 0.1, far: 150 }}
        className="!absolute inset-0 touch-none"
        onPointerDown={(event) => {
          if (!editorOpen && event.pointerType === "mouse" && !document.pointerLockElement) {
            void (event.target as HTMLCanvasElement).requestPointerLock()?.catch(() => {});
          }
        }}>
        <color attach="background" args={["#c9dce5"]} />
        <fog attach="fog" args={["#c9dce5", 35, 95]} />
        <hemisphereLight args={["#e5f4ff", "#657455", 2]} />
        <PlayerFollowingLight playerRef={playerVisualRef} />
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <CharacterController key={playerRevision} manageCamera={!editorOpen} startPosition={[playerSpawn[0], playerSpawn[1] + 1.25, playerSpawn[2]]} jumpStartDelay={0.55} movingJumpStartDelay={0} jumpForce={2}
              capsuleCollisionGroups={interactionGroups(0, [1])} raycastFilterGroups={[1]}
              renderCharacter={({ modelRef, controllerState }) => (
                <group ref={modelRef} position={[0, -1.2, 0]}>
                  <group ref={playerVisualRef}>
                  <CodeworldsCharacter isMoving={controllerState.isMoving} isSprinting={controllerState.isSprinting}
                    isGrounded={controllerState.isGrounded} isJumpPreparing={controllerState.isJumpPreparing} isMovingJump={controllerState.isMovingJump} verticalVelocity={controllerState.velocity.y} />
                  </group>
                </group>
              )} />
            <Block position={[0, -0.5, 0]} size={[48, 1, 48]} color={world.ground} />
            <Block position={[-24, 1, 0]} size={[1, 2, 48]} color="#526e70" />
            <Block position={[24, 1, 0]} size={[1, 2, 48]} color="#526e70" />
            <Block position={[0, 1, -24]} size={[48, 2, 1]} color="#526e70" />
            <Block position={[0, 1, 24]} size={[48, 2, 1]} color="#526e70" />
            <WorldObjects key={revision} world={world} />
            <RespawnOnFall spawn={world.spawn} />
          </Physics>
          <Grid position={[0, 0.01, 0]} args={[48, 48]} cellSize={1} sectionSize={4}
            cellColor="#78927c" sectionColor="#afc6b0" fadeDistance={50} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-white/20 bg-slate-950/75 px-4 py-3 text-white backdrop-blur">
        <h2 className="text-sm font-semibold">{world.name}</h2>
        <p className="mt-1 text-xs text-white/60">{world.entities.length} / 200 об’єктів · 48 × 48</p>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
        <p className="pointer-events-none rounded-lg bg-slate-950/75 px-3 py-2 text-[11px] text-white/75">{editorOpen ? "Пиши код у редакторі · Esc — закрити · WASD поза редактором — іти" : "WASD — рух · Shift — біг · Space — стрибок · E — редактор"}</p>
        {!editorOpen && <button onClick={() => { clearInput(); setPlayerSpawn(world.spawn); setPlayerRevision(n => n + 1); }} className="shrink-0 rounded-lg bg-slate-950/75 px-3 py-2 text-xs text-white">До старту</button>}
      </div>
    </div>
    {editorOpen && <CodePanel source={source} onChange={value => { setSource(value); setSaved(""); }}
      onRun={() => runtime.run(source)} onSave={save} onCancel={runtime.cancel}
      busy={runtime.busy} messages={runtime.messages} failed={runtime.failed} saved={saved} />}
    </div>
  </MainWrapperOffset>;
}
