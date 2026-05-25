import useFollowCamera from "@/components/common/hooks/camera/useFollowCamera";
import { useControlStore } from "@/components/common/game-controller/store/control-game-store";
import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
  useBeforePhysicsStep,
} from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { MathUtils, Quaternion, Euler, Vector3, type Object3D } from "three";
import {
  type WheelInfo,
  isVehicleOnFlatGround,
  useVehicleController,
} from "./use-vehicle-controller";
import { useWheelContactHistory } from "./use-wheel-contact-history";
import { WheelContactHistoryDebugRack } from "./wheel-contact-history-debug";

type StylizedCarControllerProps = {
  focusRef: MutableRefObject<Vector3>;
  startPosition?: [number, number, number];
  startRotationY?: number;
  accelerateForce?: number;
  brakeForce?: number;
  steerAngle?: number;
  showWheelTrackDebug?: boolean;
};

/**
 * Vehicle pattern from isaac-mason/sketches rapier dynamic-raycast-vehicle-controller:
 * https://github.com/isaac-mason/sketches/tree/main/sketches/rapier/dynamic-raycast-vehicle-controller
 *
 * Chassis length along Z, front at -Z. startRotationY = PI faces hood toward +Z.
 */
const BODY = { width: 1.2, height: 0.45, length: 2 };
const WHEEL_RADIUS = 0.22;
const WHEEL_WIDTH = 0.14;
const WHEEL_Y = -BODY.height / 2;
const MAX_SUSPENSION_TRAVEL = 0.16;
const SUSPENSION_REST_LENGTH = BODY.height / 2;
const FRONT_WHEEL_X = 0.58;
const REAR_WHEEL_X = 0.52;
const CHASSIS_MASS = 18;
const DEFAULT_ACCELERATE_FORCE = 3.5;
const MAX_FORWARD_SPEED = 12;
const BOOST_FORCE_MULT = 1.7;
const BOOST_MAX_FORWARD_SPEED = 18;
const REVERSE_FORCE_MULT = 0.45;
const REVERSE_MAX_SPEED = 3.5;
const FORWARD_SPEED_BRAKE_THRESHOLD = 0.45;
const MAX_REVERSE_PITCH = 0.045;
const DEFAULT_BRAKE_FORCE = 0.08;
const FRONT_BRAKE_RATIO = 1;
const REAR_BRAKE_RATIO = 0.55;
const HANDBRAKE_REAR_RATIO = 1.25;
const HANDBRAKE_FRONT_RATIO = 0.1;
const DEFAULT_STEER_ANGLE = Math.PI / 13;
const STEER_SPEED_REFERENCE = 12;
const STEER_MIN_FACTOR = 0.25;
const STEER_LERP = 12;
const CHASSIS_COLLIDER_HALF_HEIGHT = BODY.height / 2 - 0.04;
const CHASSIS_COLLIDER_Y = 0;
const CHASSIS_COLLIDER_LENGTH_SCALE = 1;
const PIVOT_HEIGHT = 0.55;
const CAMERA_SMOOTHING = 10;
const DEFAULT_START_Y = WHEEL_RADIUS + SUSPENSION_REST_LENGTH + 0.05;
const BRAKE_PITCH_SPEED = 0.5;
const BRAKE_PITCH_FROM_SPEED = 0.035;
const MAX_BRAKE_PITCH = 0.06;
const MAX_ABS_PITCH = 0.2;
const PITCH_RECOVERY_SMOOTHING = 10;
const HOP_IMPULSE = 4.5;
const RECOVER_DROP_HEIGHT = 1.7;

const WHEEL_INFO_BASE: Omit<WheelInfo, "position"> = {
  axleCs: new Vector3(-1, 0, 0),
  suspensionRestLength: SUSPENSION_REST_LENGTH,
  suspensionStiffness: 32,
  suspensionCompression: 5.5,
  suspensionRelaxation: 7.5,
  maxSuspensionForce: 6000,
  maxSuspensionTravel: MAX_SUSPENSION_TRAVEL,
  sideFrictionStiffness: 4.5,
  frictionSlip: 2.6,
  radius: WHEEL_RADIUS,
};

const WHEELS: (WheelInfo & { axle: "front" | "rear" })[] = [
  {
    position: new Vector3(-FRONT_WHEEL_X, WHEEL_Y, -0.7),
    axle: "front",
    ...WHEEL_INFO_BASE,
  },
  {
    position: new Vector3(FRONT_WHEEL_X, WHEEL_Y, -0.7),
    axle: "front",
    ...WHEEL_INFO_BASE,
  },
  {
    position: new Vector3(-REAR_WHEEL_X, WHEEL_Y, 0.7),
    axle: "rear",
    ...WHEEL_INFO_BASE,
  },
  {
    position: new Vector3(REAR_WHEEL_X, WHEEL_Y, 0.7),
    axle: "rear",
    ...WHEEL_INFO_BASE,
  },
];

export function StylizedCarController({
  focusRef,
  startPosition = [0, DEFAULT_START_Y, 0],
  startRotationY = Math.PI,
  accelerateForce = DEFAULT_ACCELERATE_FORCE,
  brakeForce = DEFAULT_BRAKE_FORCE,
  steerAngle = DEFAULT_STEER_ANGLE,
  showWheelTrackDebug = false,
}: StylizedCarControllerProps) {
  const chassisRef = useRef<RapierRigidBody>(null);
  const wheelRefs = useRef<(Object3D | null)[]>([]);
  const driveStateRef = useRef({
    isFootBraking: false,
    isHandbrake: false,
    isReversing: false,
    delta: 1 / 60,
  });

  const wheelsInfo = useMemo(() => WHEELS, []);
  const { historiesRef } = useWheelContactHistory(wheelsInfo.length);
  const { vehicleController } = useVehicleController(
    chassisRef,
    wheelRefs,
    wheelsInfo,
    { indexForwardAxis: 2, contactHistoriesRef: historiesRef },
  );

  const forward = useControlStore((s) => s.forward);
  const backward = useControlStore((s) => s.backward);
  const leftward = useControlStore((s) => s.leftward);
  const rightward = useControlStore((s) => s.rightward);
  const jump = useControlStore((s) => s.jump);
  const run = useControlStore((s) => s.run);

  const pivotPosition = useMemo(() => new Vector3(), []);
  const followCamPosition = useMemo(() => new Vector3(), []);
  const chassisPosition = useMemo(() => new Vector3(), []);
  const chassisQuat = useMemo(() => new Quaternion(), []);
  const chassisEuler = useMemo(() => new Euler(0, 0, 0, "YXZ"), []);
  const uprightEuler = useMemo(() => new Euler(0, 0, 0, "YXZ"), []);
  const uprightQuat = useMemo(() => new Quaternion(), []);
  const worldForward = useMemo(() => new Vector3(), []);
  const worldVelocity = useMemo(() => new Vector3(), []);

  const { followCam, pivot } = useFollowCamera({
    disableFollowCam: false,
    camInitDis: -7,
    camMaxDis: -11,
    camMinDis: -4,
    camUpLimit: 1.1,
    camLowLimit: -0.35,
    camInitDir: { x: 0.35, y: 0 },
    camMoveSpeed: 1,
    camZoomSpeed: 1,
    camCollisionOffset: 0.7,
    camCollisionSpeedMult: 4,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;

      const chassis = chassisRef.current;
      const controller = vehicleController.current;

      if (event.code === "KeyR") {
        if (!chassis || !controller || !isVehicleOnFlatGround(controller)) {
          return;
        }

        chassis.wakeUp();
        chassis.applyImpulse({ x: 0, y: HOP_IMPULSE, z: 0 }, true);
        return;
      }

      if (event.code === "KeyY" && chassis) {
        const translation = chassis.translation();
        const rotation = chassis.rotation();

        chassisQuat.set(rotation.x, rotation.y, rotation.z, rotation.w);
        chassisEuler.setFromQuaternion(chassisQuat, "YXZ");
        uprightEuler.set(0, chassisEuler.y, 0);
        uprightQuat.setFromEuler(uprightEuler);

        chassis.setTranslation(
          {
            x: translation.x,
            y: translation.y + RECOVER_DROP_HEIGHT,
            z: translation.z,
          },
          true,
        );
        chassis.setRotation(uprightQuat, true);
        chassis.setLinvel({ x: 0, y: 0, z: 0 }, true);
        chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
        chassis.wakeUp();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [chassisEuler, chassisQuat, uprightEuler, uprightQuat, vehicleController]);

  useBeforePhysicsStep(() => {
    const chassis = chassisRef.current;
    const controller = vehicleController.current;
    if (!chassis) return;

    const onFlatGround = controller ? isVehicleOnFlatGround(controller) : false;
    const { isFootBraking, isHandbrake, isReversing, delta } =
      driveStateRef.current;
    const isBraking = isFootBraking || isHandbrake;
    const linvel = chassis.linvel();
    const speed = Math.hypot(linvel.x, linvel.z);
    const rotation = chassis.rotation();
    const angvel = chassis.angvel();

    chassisQuat.set(rotation.x, rotation.y, rotation.z, rotation.w);
    chassisEuler.setFromQuaternion(chassisQuat, "YXZ");

    const yaw = chassisEuler.y;
    const roll = chassisEuler.z;
    let pitch = chassisEuler.x;
    let changed = false;

    if (onFlatGround) {
      let targetPitch = 0;

      if (isBraking && speed > BRAKE_PITCH_SPEED) {
        targetPitch = -Math.min(
          speed * BRAKE_PITCH_FROM_SPEED,
          MAX_BRAKE_PITCH,
        );
      } else if (isReversing) {
        targetPitch = MAX_REVERSE_PITCH;
      }

      if (Math.abs(pitch - targetPitch) > 0.012) {
        const pitchFactor = 1 - Math.exp(-PITCH_RECOVERY_SMOOTHING * delta);
        pitch = MathUtils.lerp(pitch, targetPitch, pitchFactor);
        changed = true;
      }

      if (Math.abs(pitch) > MAX_ABS_PITCH) {
        pitch = MathUtils.clamp(pitch, -MAX_ABS_PITCH, MAX_ABS_PITCH);
        changed = true;
      }

      if (changed) {
        uprightEuler.set(pitch, yaw, roll);
        uprightQuat.setFromEuler(uprightEuler);
        chassis.setRotation(uprightQuat, true);
      }

      if (isReversing && angvel.x > 0.05) {
        chassis.setAngvel(
          { x: angvel.x * 0.55, y: angvel.y, z: angvel.z },
          true,
        );
      } else if (!isBraking && Math.abs(angvel.x) > 0.08) {
        chassis.setAngvel(
          { x: angvel.x * 0.72, y: angvel.y, z: angvel.z },
          true,
        );
      } else if (Math.abs(angvel.z) > 0.06) {
        chassis.setAngvel(
          { x: angvel.x, y: angvel.y, z: angvel.z * 0.82 },
          true,
        );
      }
    }
  });

  useFrame(({ camera }, delta) => {
    if (delta > 1) delta %= 1;

    const controller = vehicleController.current;
    const chassis = chassisRef.current;
    if (!controller || !chassis) return;

    if (chassis.isSleeping()) {
      chassis.wakeUp();
    }

    const chassisTranslation = chassis.translation();
    if (chassisTranslation.y < -8) {
      chassis.setTranslation(
        {
          x: chassisTranslation.x,
          y: DEFAULT_START_Y,
          z: chassisTranslation.z,
        },
        true,
      );
      chassis.setLinvel({ x: 0, y: 0, z: 0 }, true);
      chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    // Hood faces -Z; Rapier forward axis is +Z — negative force drives forward.
    const wantsForward = Boolean(forward) && !backward;
    const wantsBackward = Boolean(backward) && !forward;
    const wantsHandbrake = Boolean(jump);

    const linvel = chassis.linvel();
    worldVelocity.set(linvel.x, 0, linvel.z);
    chassisQuat.set(
      chassis.rotation().x,
      chassis.rotation().y,
      chassis.rotation().z,
      chassis.rotation().w,
    );
    worldForward.set(0, 0, 1).applyQuaternion(chassisQuat);
    const forwardSpeed = worldForward.dot(worldVelocity);
    const speed = worldVelocity.length();

    const isMovingForward = forwardSpeed < -FORWARD_SPEED_BRAKE_THRESHOLD;
    const isFootBraking = wantsBackward && isMovingForward;
    const isReversing = wantsBackward && !isMovingForward;

    driveStateRef.current = {
      isFootBraking,
      isHandbrake: wantsHandbrake,
      isReversing,
      delta,
    };

    let frontEngineForce = 0;
    let rearEngineForce = 0;
    const isBoosting = wantsForward && run && !wantsHandbrake && !isFootBraking;
    const maxForwardSpeed = isBoosting
      ? BOOST_MAX_FORWARD_SPEED
      : MAX_FORWARD_SPEED;
    const boostForceMult = isBoosting ? BOOST_FORCE_MULT : 1;

    if (!wantsHandbrake && !isFootBraking) {
      if (wantsForward) {
        const forwardSpeedAbs = Math.max(0, -forwardSpeed);
        const engineFactor = MathUtils.clamp(
          1 - forwardSpeedAbs / maxForwardSpeed,
          0,
          1,
        );
        frontEngineForce = -accelerateForce * boostForceMult * engineFactor;
      }

      if (isReversing) {
        const reverseSpeed = Math.max(0, forwardSpeed);
        const reverseFactor = MathUtils.clamp(
          1 - reverseSpeed / REVERSE_MAX_SPEED,
          0.2,
          1,
        );
        rearEngineForce = accelerateForce * REVERSE_FORCE_MULT * reverseFactor;
      }
    }

    WHEELS.forEach(({ axle }, index) => {
      const force = axle === "front" ? frontEngineForce : rearEngineForce;
      controller.setWheelEngineForce(index, force);
    });

    WHEELS.forEach(({ axle }, index) => {
      let brake = 0;

      if (isFootBraking) {
        brake = Math.max(
          brake,
          brakeForce *
            (axle === "front" ? FRONT_BRAKE_RATIO : REAR_BRAKE_RATIO),
        );
      }

      if (wantsHandbrake) {
        brake = Math.max(
          brake,
          brakeForce *
            (axle === "rear" ? HANDBRAKE_REAR_RATIO : HANDBRAKE_FRONT_RATIO),
        );
      }

      controller.setWheelBrake(index, brake);
    });

    const currentSteering = controller.wheelSteering(0) ?? 0;
    const steerDirection = Number(leftward) - Number(rightward);
    const steerSpeedReference = isBoosting
      ? BOOST_MAX_FORWARD_SPEED
      : STEER_SPEED_REFERENCE;
    const speedSteerFactor = MathUtils.clamp(
      1 - speed / steerSpeedReference,
      STEER_MIN_FACTOR,
      1,
    );
    const targetSteering = steerAngle * steerDirection * speedSteerFactor;
    const steering = MathUtils.lerp(
      currentSteering,
      targetSteering,
      1 - Math.exp(-STEER_LERP * delta),
    );
    controller.setWheelSteering(0, steering);
    controller.setWheelSteering(1, steering);

    chassisPosition.set(
      chassisTranslation.x,
      chassisTranslation.y,
      chassisTranslation.z,
    );
    focusRef.current.copy(chassisPosition);

    pivotPosition.set(chassisPosition.x, PIVOT_HEIGHT, chassisPosition.z);
    pivot.position.lerp(pivotPosition, 1 - Math.exp(-CAMERA_SMOOTHING * delta));

    followCam.getWorldPosition(followCamPosition);
    camera.position.copy(followCamPosition);
    camera.lookAt(pivot.position);
  });

  return (
    <>
      <RigidBody
        ref={chassisRef}
        colliders={false}
        mass={CHASSIS_MASS}
        position={startPosition}
        rotation={[0, startRotationY, 0]}
        enabledRotations={[true, true, true]}
        friction={0.8}
        linearDamping={0.08}
        angularDamping={0.35}
        canSleep={false}
      >
        <CuboidCollider
          args={[
            BODY.width / 2,
            CHASSIS_COLLIDER_HALF_HEIGHT,
            (BODY.length / 2) * CHASSIS_COLLIDER_LENGTH_SCALE,
          ]}
          position={[0, CHASSIS_COLLIDER_Y, 0]}
          restitution={0.01}
          friction={0}
        />

        <mesh castShadow>
          <boxGeometry args={[BODY.width, BODY.height, BODY.length]} />
          <meshBasicMaterial color="#f5f5f5" wireframe />
        </mesh>

        {WHEELS.map(({ position, axle }, index) => (
          <group
            key={index}
            position={position}
            ref={(node) => {
              wheelRefs.current[index] = node;
            }}
          >
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry
                args={[WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_WIDTH, 12, 1]}
              />
              <meshStandardMaterial
                color={
                  axle === "front"
                    ? index === 0
                      ? "#d48bb8"
                      : "#e8a0c4"
                    : index === 2
                      ? "#8fd4e8"
                      : "#a6dce8"
                }
                roughness={0.55}
              />
            </mesh>
          </group>
        ))}
      </RigidBody>

      {showWheelTrackDebug && (
        <WheelContactHistoryDebugRack historiesRef={historiesRef} />
      )}
    </>
  );
}
