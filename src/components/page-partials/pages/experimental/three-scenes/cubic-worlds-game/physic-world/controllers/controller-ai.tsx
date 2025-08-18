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
import { useControlStore } from "./control-game-store";
import CharacterModel from "./character-model";
import { ActionName } from "./character.config";
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

  // вертикальна швидкість + параметри
  const vy = useRef(0);
  const GRAVITY = -10;
  const JUMP_VELOCITY = 7;
  const SPEED_WALK = 5;
  const SPEED_RUN = 11;

  // напрям руху відносно камери
  const moveDir = useRef(new Vector3());
  const camFwd = useRef(new Vector3());
  const camRight = useRef(new Vector3());

  // повороти «як у твоєму коді»
  const lastRotationTarget = useRef(0); // Math.atan2(vx, vz)

  useEffect(() => {
    const kcc = world.createCharacterController(0.01);
    kcc.setUp({ x: 0, y: 1, z: 0 });
    kcc.setMaxSlopeClimbAngle((50 * Math.PI) / 180);
    kcc.setMinSlopeSlideAngle((60 * Math.PI) / 180);
    kcc.enableAutostep(0.45, 0.2, true);
    kcc.enableSnapToGround(0.5);
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

    // 1) напрямок відносно камери
    camFwd.current.copy(state.camera.getWorldDirection(new Vector3()));
    camFwd.current.y = 0;
    camFwd.current.normalize();
    camRight.current.crossVectors(camFwd.current, state.camera.up).normalize();

    // 2) інпути -> вектор руху
    moveDir.current.set(0, 0, 0);
    if (forward) moveDir.current.add(camFwd.current);
    if (backward) moveDir.current.sub(camFwd.current);
    if (leftward) moveDir.current.sub(camRight.current);
    if (rightward) moveDir.current.add(camRight.current);

    const isMoving = moveDir.current.lengthSq() > 0;
    if (isMoving) {
      moveDir.current.normalize().multiplyScalar(run ? SPEED_RUN : SPEED_WALK);
    }

    // 3) гравітація/стрибок
    const groundedBefore = controllerRef.current.computedGrounded?.() ?? false;
    if (jump && groundedBefore) {
      vy.current = JUMP_VELOCITY;
    } else {
      vy.current += GRAVITY * dt;
      vy.current = Math.max(vy.current, -30);
    }

    // 4) бажаний Δрух
    const desired = {
      x: moveDir.current.x * dt,
      y: vy.current * dt,
      z: moveDir.current.z * dt,
    };

    // 5) рух через KCC (з ковзанням/сходами/снепом)
    controllerRef.current.computeColliderMovement(
      col.current,
      desired,
      rapier.QueryFilterFlags.EXCLUDE_SENSORS,
      undefined,
      (c) => c !== col.current
    );

    const corr = controllerRef.current.computedMovement();
    const t = rb.current.translation();
    rb.current.setNextKinematicTranslation({
      x: t.x + corr.x,
      y: t.y + corr.y,
      z: t.z + corr.z,
    });

    const groundedNow = controllerRef.current.computedGrounded();
    if (groundedNow && vy.current < 0) vy.current = 0;

    // 6) ПОВОРОТ «як у тебе»:
    //    - цільовий кут беремо з вектора швидкості у площині XZ
    //    - оновлюємо lastRotationTarget тільки коли рухаємось
    //    - lerp із різними коефіцієнтами на землі/в повітрі
    if (isMoving) {
      lastRotationTarget.current = Math.atan2(
        moveDir.current.x,
        moveDir.current.z
      );
    }
    if (modelRef.current) {
      modelRef.current.rotation.y = lerpAngle(
        modelRef.current.rotation.y,
        lastRotationTarget.current,
        groundedNow ? 0.77 : 0.3
      );
    }

    // 7) Анімації
    let nextAnim = ActionName.Idle;
    if (!groundedNow) {
      nextAnim = ActionName.Jump;
    } else if (isMoving) nextAnim = run ? ActionName.Run : ActionName.Walk;
    if (nextAnim !== lastAnimRef.current) {
      lastAnimRef.current = nextAnim;
      setAnimation(nextAnim);
    }

    // 8) Камера (опційно)
    if (isCameraFlow && cameraControls) {
      cameraControls.moveTo(t.x + corr.x, t.y + corr.y, t.z + corr.z, true);
      cameraControls.update(dt);
    }
  });

  return (
    <RigidBody
      ref={rb}
      type="kinematicPosition"
      colliders={false}
      position={[0, 1.2, 0]}
      enabledRotations={[false, false, false]}
    >
      {/* Колайдер, який рухає KCC */}
      <CapsuleCollider ref={col} args={[0.7, 0.3]} />
      {/* Модель персонажа */}
      <group ref={modelRef}>
        <CharacterModel
          path={"/3d-models/characters/constantine_character.glb"}
          position={[0, -0.99, 0]}
          animation={animation}
        />
      </group>
    </RigidBody>
  );
}
