import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import { Physics, RigidBody, interactionGroups } from "@react-three/rapier";
import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import InitKeyboardController from "@/components/common/game-controller/init-keyboard";
import { useControlStore } from "@/components/common/game-controller/store/control-game-store";
import ThreeLoader from "../../common/three-loader";
import { CharacterController } from "../../character-controller/controller/character-controller";
import { CodeworldsCharacter } from "./character";

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
  useEffect(() => () => {
    if (document.pointerLockElement) document.exitPointerLock();
    useControlStore.setState({ forward: false, backward: false, leftward: false, rightward: false, run: false, jump: false });
  }, []);

  return <MainWrapperOffset isFullHeight className="flex min-h-0 flex-1 flex-col">
    <div className="relative min-h-0 flex-1">
      <InitKeyboardController isIgnorePause />
      <ThreeLoader />
      <Canvas shadows camera={{ position: [0, 4, -6], fov: 55, near: 0.1, far: 150 }}
        className="!absolute inset-0 touch-none"
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" && !document.pointerLockElement) {
            void (event.target as HTMLCanvasElement).requestPointerLock()?.catch(() => {});
          }
        }}>
        <color attach="background" args={["#c9dce5"]} />
        <fog attach="fog" args={["#c9dce5", 35, 95]} />
        <hemisphereLight args={["#e5f4ff", "#657455", 2]} />
        <directionalLight position={[12, 18, -10]} intensity={3} castShadow
          shadow-mapSize={[2048, 2048]} shadow-camera-left={-25} shadow-camera-right={25}
          shadow-camera-top={25} shadow-camera-bottom={-25} shadow-normalBias={0.03} />
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <CharacterController startPosition={[0, 1.25, 0]} jumpStartDelay={0.55} movingJumpStartDelay={0} jumpForce={2}
              capsuleCollisionGroups={interactionGroups(0, [1])} raycastFilterGroups={[1]}
              renderCharacter={({ modelRef, controllerState }) => (
                <group ref={modelRef} position={[0, -1.2, 0]}>
                  <CodeworldsCharacter isMoving={controllerState.isMoving} isSprinting={controllerState.isSprinting}
                    isGrounded={controllerState.isGrounded} isJumpPreparing={controllerState.isJumpPreparing} isMovingJump={controllerState.isMovingJump} verticalVelocity={controllerState.velocity.y} />
                </group>
              )} />
            <Block position={[0, -0.5, 0]} size={[48, 1, 48]} color="#829b83" />
            <Block position={[-24, 1, 0]} size={[1, 2, 48]} color="#526e70" />
            <Block position={[24, 1, 0]} size={[1, 2, 48]} color="#526e70" />
            <Block position={[0, 1, -24]} size={[48, 2, 1]} color="#526e70" />
            <Block position={[0, 1, 24]} size={[48, 2, 1]} color="#526e70" />
            <Block position={[5, 0.5, 5]} size={[3, 1, 3]} color="#d3ae70" />
            <Block position={[-5, 1, 8]} size={[3, 2, 3]} color="#6b949e" />
          </Physics>
          <Grid position={[0, 0.01, 0]} args={[48, 48]} cellSize={1} sectionSize={4}
            cellColor="#78927c" sectionColor="#afc6b0" fadeDistance={50} />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-white/20 bg-slate-950/75 px-5 py-4 text-white backdrop-blur">
        <h1 className="text-xl font-semibold">Codeworlds</h1>
        <p className="mt-1 text-xs text-white/65">Початкова сцена · Персонаж 01</p>
        <p className="mt-3 hidden text-xs text-white/80 md:block">WASD / стрілки — рух · Shift — біг · Space — стрибок</p>
        <p className="mt-1 hidden text-xs text-white/60 md:block">Клік на сцену — огляд мишею · Esc — звільнити курсор</p>
      </div>
    </div>
  </MainWrapperOffset>;
}
