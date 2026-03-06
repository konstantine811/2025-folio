// CharacterKCC.tsx
import { useEffect, useRef, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import {
  RigidBody,
  CapsuleCollider,
  RapierRigidBody,
  useRapier,
} from "@react-three/rapier";
import type {
  Collider,
  KinematicCharacterController,
} from "@dimforge/rapier3d-compat";
import { Vector3, Group } from "three";
import { useControlStore } from "@components/common/game-controller/store/control-game-store";
import CharacterModel from "./character-model";
import { ActionName } from "../character-controller/config/character.config";
import { lerpAngle } from "@/utils/game.utils";

export default function CharacterKCC() {
  const { world, rapier } = useRapier();
  const rb = useRef<RapierRigidBody>(null!);
  const col = useRef<Collider>(null!);
  const modelRef = useRef<Group>(null!);

  const { controls } = useThree();
  const cameraControls = (controls as CameraControls) ?? null;

  const [animation, setAnimation] = useState(ActionName.Idle);
  const lastAnimRef = useRef(animation);

  const { forward, backward, leftward, rightward, run, jump, isCameraFlow } =
    useControlStore();

  const controllerRef = useRef<KinematicCharacterController | null>(null);

  // --- параметри руху
  const GRAVITY = -20;
  const JUMP_VELOCITY = 10;
  const SPEED_WALK = 4;
  const SPEED_RUN = 10;

  // анти-флікер параметри
  const COYOTE_TIME = 0.12;
  const MIN_AIR_TIME_FOR_FALL_ANIM = 0.14;

  // 🧭 поворот (повільніше, fps-незалежно)
  const TURN_SPEED_GROUNDED = 15.0; // менше = повільніше
  const TURN_SPEED_AIR = 2.0; // ще повільніше у повітрі

  // 🌬️ інерція по XZ (floaty у повітрі)
  const GROUND_ACCEL = 30.0; // наскільки швидко підганяємо швидкість під ціль на землі
  const AIR_ACCEL = 1.8; // слабке керування у повітрі
  const AIR_DRAG = 0.15; // низький опір у повітрі

  // 🔺 капсула: на землі — вища/вужча, у повітрі — нижча/ширша
  const GROUND_CAPSULE: [number, number] = [0.62, 0.3]; // [halfHeight, radius]
  const AIR_CAPSULE: [number, number] = [0.4, 0.5];
  const MODEL_OFFSET = -0.93;
  const [colliderArgs, setColliderArgs] =
    useState<[number, number]>(GROUND_CAPSULE);

  // стан
  const vy = useRef(0);
  const lastGroundedAt = useRef(-1e9);
  const airTime = useRef(0);
  const isJumpingRef = useRef(false);

  // edge-trigger + lockout
  const wasJumpHeld = useRef(false);
  const jumpRearmAt = useRef(0);
  const prevGroundedRef = useRef(false);

  // напрям і швидкість по XZ
  const moveDir = useRef(new Vector3());
  const camFwd = useRef(new Vector3());
  const camRight = useRef(new Vector3());
  const velXZ = useRef(new Vector3());

  // повороти
  const lastRotationTarget = useRef(0);

  useEffect(() => {
    const kcc = world.createCharacterController(0.001);
    kcc.setUp({ x: 0, y: 1, z: 0 });
    kcc.setMaxSlopeClimbAngle((45 * Math.PI) / 180);
    kcc.setMinSlopeSlideAngle((30 * Math.PI) / 180);
    kcc.enableAutostep(0.5, 0.2, true);
    kcc.enableSnapToGround(1.5);
    kcc.setApplyImpulsesToDynamicBodies(true);
    controllerRef.current = kcc;

    return () => {
      if (controllerRef.current)
        world.removeCharacterController(controllerRef.current);
      controllerRef.current = null;
    };
  }, [world, rapier]);

  useFrame((state, dt) => {
    if (!rb.current || !col.current || !controllerRef.current) return;

    const now = state.clock.getElapsedTime();

    // 1) напрямок відносно камери
    camFwd.current.copy(state.camera.getWorldDirection(new Vector3()));
    camFwd.current.y = 0;
    camFwd.current.normalize();
    camRight.current.crossVectors(camFwd.current, state.camera.up).normalize();

    // 2) інпути -> напрямок
    moveDir.current.set(0, 0, 0);
    if (forward) moveDir.current.add(camFwd.current);
    if (backward) moveDir.current.sub(camFwd.current);
    if (leftward) moveDir.current.sub(camRight.current);
    if (rightward) moveDir.current.add(camRight.current);

    const inputActive = moveDir.current.lengthSq() > 0;
    if (inputActive) moveDir.current.normalize();
    const targetSpeed = inputActive ? (run ? SPEED_RUN : SPEED_WALK) : 0;

    // 3) grounded із debouncing (coyote + airTime)
    const groundedRaw = controllerRef.current.computedGrounded?.() ?? false;
    if (groundedRaw) {
      lastGroundedAt.current = now;
      airTime.current = 0;
    } else {
      airTime.current += dt;
    }
    const consideredGrounded =
      groundedRaw || now - lastGroundedAt.current < COYOTE_TIME;

    // 4) гравітація/стрибок
    const justPressedJump = jump && !wasJumpHeld.current;
    const lockoutOk = now >= jumpRearmAt.current;
    const canStartJump =
      consideredGrounded && vy.current <= 0.05 && justPressedJump && lockoutOk;

    if (canStartJump) {
      vy.current = JUMP_VELOCITY;
      isJumpingRef.current = true;
      // одразу зробити «повітряну» капсулу — нижчу та ширшу
      setColliderArgs(AIR_CAPSULE);
    } else {
      vy.current += GRAVITY * dt;
      vy.current = Math.max(vy.current, -30);
    }

    // 5) горизонтальна швидкість з інерцією
    const targetVel = new Vector3(
      moveDir.current.x * targetSpeed,
      0,
      moveDir.current.z * targetSpeed
    );

    if (consideredGrounded) {
      const a = 1 - Math.exp(-GROUND_ACCEL * dt);
      velXZ.current.lerp(targetVel, a);
    } else {
      const a = 1 - Math.exp(-AIR_ACCEL * dt);
      velXZ.current.lerp(targetVel, a);
      const drag = Math.exp(-AIR_DRAG * dt);
      velXZ.current.multiplyScalar(drag);
    }

    // 6) бажаний Δрух
    const desired = {
      x: velXZ.current.x * dt,
      y: vy.current * dt,
      z: velXZ.current.z * dt,
    };

    // 7) рух через KCC
    controllerRef.current.computeColliderMovement(
      col.current,
      desired,
      rapier.QueryFilterFlags.EXCLUDE_SENSORS,
      undefined,
      (c) => c !== col.current
    );

    const corr = controllerRef.current.computedMovement();

    // 8) застосувати рух
    const t = rb.current.translation();
    rb.current.setNextKinematicTranslation({
      x: t.x + corr.x,
      y: t.y + corr.y,
      z: t.z + corr.z,
    });

    // 9) оновити стани після руху
    const groundedNow = controllerRef.current.computedGrounded();

    if (groundedNow && vy.current < 0) {
      vy.current = 0;
      isJumpingRef.current = false;
      // повертаємо «земну» капсулу — вищу/вужчу
      setColliderArgs(GROUND_CAPSULE);
    }

    // якщо щойно відлетіли від землі (скотились/зійшли зі сходинки) — теж перейти на повітряну капсулу
    if (!groundedNow && prevGroundedRef.current) {
      setColliderArgs(AIR_CAPSULE);
    }

    // 10) поворот моделі (повільніше на землі й особливо у повітрі)
    const speedXZ = velXZ.current.lengthSq();
    if (speedXZ > 1e-6) {
      lastRotationTarget.current = Math.atan2(velXZ.current.x, velXZ.current.z);
    }
    if (modelRef.current) {
      const turnRate = groundedNow ? TURN_SPEED_GROUNDED : TURN_SPEED_AIR;
      const alphaTurn = 1 - Math.exp(-turnRate * dt);
      modelRef.current.rotation.y = lerpAngle(
        modelRef.current.rotation.y,
        lastRotationTarget.current,
        alphaTurn
      );
    }

    // 11) Анімації
    let nextAnim = ActionName.Idle;
    const longFall =
      airTime.current > MIN_AIR_TIME_FOR_FALL_ANIM && !consideredGrounded;
    if (isJumpingRef.current || longFall) {
      nextAnim = ActionName.Jump;
    } else if (inputActive) {
      nextAnim = run ? ActionName.Run : ActionName.Walk;
    } else {
      nextAnim = ActionName.Idle;
    }

    if (nextAnim !== lastAnimRef.current) {
      lastAnimRef.current = nextAnim;
      setAnimation(nextAnim);
    }

    // 12) камера (опційно)
    if (isCameraFlow && cameraControls) {
      cameraControls.moveTo(t.x + corr.x, t.y + corr.y, t.z + corr.z, true);
      cameraControls.update(dt);
    }

    // фінал
    prevGroundedRef.current = groundedNow;
    wasJumpHeld.current = jump;
  });

  return (
    <RigidBody
      ref={rb}
      type="kinematicPosition"
      colliders={false}
      position={[0, 1.2, 0]}
      enabledRotations={[false, false, false]}
    >
      {/* важливо: key для перевмонтування при зміні розмірів */}
      <CapsuleCollider
        ref={col}
        args={colliderArgs}
        key={colliderArgs.join("-")}
      />
      <group ref={modelRef}>
        <CharacterModel
          path={"/3d-models/characters/constantine_character.glb"}
          position={[0, MODEL_OFFSET, 0]}
          animation={animation}
        />
      </group>
    </RigidBody>
  );
}
