import useFollowCamera from "@/components/common/hooks/camera/useFollowCamera";
import { useControlStore } from "@/components/common/game-controller/store/control-game-store";
import { CuboidCollider, RapierRigidBody, RigidBody, useBeforePhysicsStep } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import { MathUtils, Quaternion, Euler, Vector3, type Object3D } from "three";
import {
  type WheelInfo,
  useVehicleController,
} from "./use-vehicle-controller";

type StylizedCarControllerProps = {
  focusRef: MutableRefObject<Vector3>;
  startPosition?: [number, number, number];
  startRotationY?: number;
  accelerateForce?: number;
  brakeForce?: number;
  steerAngle?: number;
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
const WHEEL_Y = -BODY.height / 2 + 0.02;
const CHASSIS_MASS = 10;
const DEFAULT_ACCELERATE_FORCE = 2;
const DEFAULT_BRAKE_FORCE = 0.05;
const REAR_BRAKE_RATIO = 0.88;
const FRONT_BRAKE_RATIO = 0.38;
const DEFAULT_STEER_ANGLE = Math.PI / 24;
const CHASSIS_COLLIDER_HALF_HEIGHT = 0.1;
const CHASSIS_COLLIDER_Y = 0.06;
const PIVOT_HEIGHT = 0.55;
const CAMERA_SMOOTHING = 10;
const DEFAULT_START_Y = 0.55;
const BRAKE_PITCH_SPEED = 0.5;
const BRAKE_PITCH_FROM_SPEED = 0.035;
const MAX_BRAKE_PITCH = 0.09;
const PITCH_RECOVERY_SMOOTHING = 10;

const WHEEL_INFO_BASE: Omit<WheelInfo, "position"> = {
  axleCs: new Vector3(-1, 0, 0),
  suspensionRestLength: 0.18,
  suspensionStiffness: 30,
  suspensionCompression: 4.4,
  suspensionRelaxation: 4.5,
  maxSuspensionForce: 6000,
  maxSuspensionTravel: 0.22,
  sideFrictionStiffness: 3,
  frictionSlip: 1.5,
  radius: WHEEL_RADIUS,
};

const WHEELS: (WheelInfo & { axle: "front" | "rear" })[] = [
  {
    position: new Vector3(-0.5, WHEEL_Y, -0.7),
    axle: "front",
    ...WHEEL_INFO_BASE,
  },
  {
    position: new Vector3(0.5, WHEEL_Y, -0.7),
    axle: "front",
    ...WHEEL_INFO_BASE,
  },
  {
    position: new Vector3(-0.5, WHEEL_Y, 0.7),
    axle: "rear",
    ...WHEEL_INFO_BASE,
  },
  {
    position: new Vector3(0.5, WHEEL_Y, 0.7),
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
}: StylizedCarControllerProps) {
  const chassisRef = useRef<RapierRigidBody>(null);
  const wheelRefs = useRef<(Object3D | null)[]>([]);
  const driveStateRef = useRef({ isBraking: false, delta: 1 / 60 });

  const wheelsInfo = useMemo(() => WHEELS, []);
  const { vehicleController } = useVehicleController(
    chassisRef,
    wheelRefs,
    wheelsInfo,
    { indexForwardAxis: 2 },
  );

  const forward = useControlStore((s) => s.forward);
  const backward = useControlStore((s) => s.backward);
  const leftward = useControlStore((s) => s.leftward);
  const rightward = useControlStore((s) => s.rightward);
  const jump = useControlStore((s) => s.jump);

  const pivotPosition = useMemo(() => new Vector3(), []);
  const followCamPosition = useMemo(() => new Vector3(), []);
  const chassisPosition = useMemo(() => new Vector3(), []);
  const chassisQuat = useMemo(() => new Quaternion(), []);
  const chassisEuler = useMemo(() => new Euler(0, 0, 0, "YXZ"), []);
  const uprightEuler = useMemo(() => new Euler(0, 0, 0, "YXZ"), []);
  const uprightQuat = useMemo(() => new Quaternion(), []);

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

  useBeforePhysicsStep(() => {
    const chassis = chassisRef.current;
    if (!chassis) return;

    const { isBraking, delta } = driveStateRef.current;
    const linvel = chassis.linvel();
    const speed = Math.hypot(linvel.x, linvel.z);
    const rotation = chassis.rotation();

    chassisQuat.set(rotation.x, rotation.y, rotation.z, rotation.w);
    chassisEuler.setFromQuaternion(chassisQuat, "YXZ");

    const yaw = chassisEuler.y;
    let targetPitch = 0;
    if (isBraking && speed > BRAKE_PITCH_SPEED) {
      targetPitch = -Math.min(speed * BRAKE_PITCH_FROM_SPEED, MAX_BRAKE_PITCH);
    }

    const pitchFactor = 1 - Math.exp(-PITCH_RECOVERY_SMOOTHING * delta);
    const pitch = MathUtils.lerp(chassisEuler.x, targetPitch, pitchFactor);

    uprightEuler.set(pitch, yaw, 0);
    uprightQuat.setFromEuler(uprightEuler);
    chassis.setRotation(uprightQuat, true);

    const angvel = chassis.angvel();
    chassis.setAngvel({ x: 0, y: angvel.y, z: 0 }, true);
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
        { x: chassisTranslation.x, y: DEFAULT_START_Y, z: chassisTranslation.z },
        true,
      );
      chassis.setLinvel({ x: 0, y: 0, z: 0 }, true);
      chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    // Hood faces -Z; Rapier forward axis is +Z — reverse sign vs sketch W/S.
    const isBraking = jump;
    driveStateRef.current = { isBraking, delta };
    const engineForce = isBraking
      ? 0
      : Number(backward) * accelerateForce - Number(forward) * accelerateForce;

    WHEELS.forEach(({ axle }, index) => {
      controller.setWheelEngineForce(index, axle === "front" ? engineForce : 0);
    });

    WHEELS.forEach(({ axle }, index) => {
      if (!isBraking) {
        controller.setWheelBrake(index, 0);
        return;
      }
      controller.setWheelBrake(
        index,
        brakeForce *
          (axle === "rear" ? REAR_BRAKE_RATIO : FRONT_BRAKE_RATIO),
      );
    });

    const currentSteering = controller.wheelSteering(0) ?? 0;
    const steerDirection = Number(leftward) - Number(rightward);
    const steering = MathUtils.lerp(
      currentSteering,
      steerAngle * steerDirection,
      0.5,
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
    <RigidBody
      ref={chassisRef}
      colliders={false}
      mass={CHASSIS_MASS}
      position={startPosition}
      rotation={[0, startRotationY, 0]}
      enabledRotations={[false, true, false]}
      friction={0.8}
      linearDamping={0.08}
      angularDamping={0.25}
      canSleep={false}
    >
      <CuboidCollider
        args={[
          BODY.width / 2,
          CHASSIS_COLLIDER_HALF_HEIGHT,
          BODY.length / 2,
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
  );
}
