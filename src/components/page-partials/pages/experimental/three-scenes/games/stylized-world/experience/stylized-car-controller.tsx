import useFollowCamera from "@/components/common/hooks/camera/useFollowCamera";
import { useControlStore } from "@/components/common/game-controller/store/control-game-store";
import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
  useBeforePhysicsStep,
  useRapier,
} from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import {
  MathUtils,
  Quaternion,
  Vector3,
  type Object3D,
} from "three";

type StylizedCarControllerProps = {
  focusRef: MutableRefObject<Vector3>;
  startPosition?: [number, number, number];
  startRotationY?: number;
  accelerationForce?: number;
  breakForce?: number;
  topSpeed?: number;
  boostForceMult?: number;
  boostTopSpeedMult?: number;
  maxSteerDeg?: number;
  steerSmoothing?: number;
};

/**
 * Rapier 0.15 vehicle forward axis is local +X (cannot be changed).
 * Body length runs along X. With `startRotationY = -π/2` the hood (+X) faces the camera (+Z);
 * drive impulse uses local +X so W moves in the hood direction (+Z toward camera).
 */
const BODY = { width: 1.2, height: 0.45, length: 2 };
const WHEEL_RADIUS = 0.22;
const WHEEL_WIDTH = 0.14;
const WHEEL_Y = -BODY.height / 2 + 0.02;
const SUSPENSION_REST_LENGTH = 0.16;
const CHASSIS_MASS = 120;
const CHASSIS_FORWARD = new Vector3(1, 0, 0);
const DRIVE_IMPULSE_SCALE = 0.22;
const DEFAULT_BOOST_FORCE_MULT = 1.65;
const DEFAULT_BOOST_TOP_SPEED_MULT = 1.5;
const HANDBRAKE_FORCE_MULT = 0.18;
const HANDBRAKE_FRICTION_SLIP = 55;
const HANDBRAKE_SIDE_FRICTION = 0.35;
const NORMAL_FRICTION_SLIP = 180;
const NORMAL_SIDE_FRICTION = 0.9;
const CHASSIS_COLLIDER_HALF_HEIGHT = 0.12;
const CHASSIS_COLLIDER_Y = 0.15;
const PIVOT_HEIGHT = 0.55;
const CAMERA_SMOOTHING = 8;
/** Chassis center Y so wheels rest on ground (y = 0) with suspension at rest length. */
const DEFAULT_START_Y =
  WHEEL_RADIUS - WHEEL_Y + SUSPENSION_REST_LENGTH;

const WHEELS: { position: Vector3; axle: "front" | "rear" }[] = [
  { position: new Vector3(0.7, WHEEL_Y, -0.5), axle: "front" },
  { position: new Vector3(0.7, WHEEL_Y, 0.5), axle: "front" },
  { position: new Vector3(-0.7, WHEEL_Y, -0.5), axle: "rear" },
  { position: new Vector3(-0.7, WHEEL_Y, 0.5), axle: "rear" },
];

type VehicleController = NonNullable<
  ReturnType<typeof createVehicleForChassis>["vehicle"]
>;

function createVehicleForChassis(
  world: ReturnType<typeof useRapier>["world"],
  chassis: RapierRigidBody,
) {
  const vehicle = world.createVehicleController(chassis);
  const wheelDirection = { x: 0, y: -1, z: 0 };
  const wheelAxle = { x: 0, y: 0, z: 1 };

  WHEELS.forEach(({ position }, index) => {
    vehicle.addWheel(
      { x: position.x, y: position.y, z: position.z },
      wheelDirection,
      wheelAxle,
      SUSPENSION_REST_LENGTH,
      WHEEL_RADIUS,
    );
    vehicle.setWheelSuspensionCompression(index, 0.4);
    vehicle.setWheelSuspensionRelaxation(index, 2.8);
    vehicle.setWheelSuspensionStiffness(index, 24);
    vehicle.setWheelMaxSuspensionForce(index, 4000);
    vehicle.setWheelMaxSuspensionTravel(index, 0.18);
    vehicle.setWheelSideFrictionStiffness(index, 0.9);
    vehicle.setWheelFrictionSlip(index, 180);
  });

  return { vehicle };
}

export function StylizedCarController({
  focusRef,
  startPosition = [0, DEFAULT_START_Y, 0],
  startRotationY = -Math.PI / 2,
  accelerationForce = 1.8,
  breakForce = 1.2,
  topSpeed = 12,
  boostForceMult = DEFAULT_BOOST_FORCE_MULT,
  boostTopSpeedMult = DEFAULT_BOOST_TOP_SPEED_MULT,
  maxSteerDeg = 32,
  steerSmoothing = 0.35,
}: StylizedCarControllerProps) {
  const chassisRef = useRef<RapierRigidBody>(null);
  const vehicleRef = useRef<VehicleController | null>(null);
  const wheelRefs = useRef<(Object3D | null)[]>([]);

  const { world } = useRapier();
  const { forward, backward, leftward, rightward, jump, run } = useControlStore();

  const currSteerSmooth = useRef(0);
  const wheelSteeringQuat = useMemo(() => new Quaternion(), []);
  const wheelRotationQuat = useMemo(() => new Quaternion(), []);
  const wheelQuat = useMemo(() => new Quaternion(), []);
  const up = useMemo(() => new Vector3(0, 1, 0), []);
  const pivotPosition = useMemo(() => new Vector3(), []);
  const followCamPosition = useMemo(() => new Vector3(), []);
  const chassisPosition = useMemo(() => new Vector3(), []);
  const worldForward = useMemo(() => new Vector3(), []);
  const velocity = useMemo(() => new Vector3(), []);
  const driveImpulse = useMemo(() => new Vector3(), []);

  const chassisQuat = useMemo(() => new Quaternion(), []);

  const maxSteerRad = useMemo(
    () => MathUtils.degToRad(maxSteerDeg),
    [maxSteerDeg],
  );

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

  useEffect(
    () => () => {
      if (vehicleRef.current) {
        world.removeVehicleController(vehicleRef.current);
        vehicleRef.current = null;
      }
    },
    [world],
  );

  useBeforePhysicsStep((rapierWorld) => {
    const chassis = chassisRef.current;
    if (!chassis) return;

    if (!vehicleRef.current) {
      vehicleRef.current = createVehicleForChassis(rapierWorld, chassis).vehicle;
    }

    const vehicle = vehicleRef.current;
    const dt = rapierWorld.timestep;

    const rot = chassis.rotation();
    chassisQuat.set(rot.x, rot.y, rot.z, rot.w);
    worldForward.copy(CHASSIS_FORWARD).applyQuaternion(chassisQuat);

    const linvel = chassis.linvel();
    velocity.set(linvel.x, linvel.y, linvel.z);
    const speed = velocity.length();
    const forwardSpeed = velocity.dot(worldForward);

    const currAcc = forward ? 1 : backward ? -1 : 0;
    const steerInput = leftward ? 1 : rightward ? -1 : 0;
    const isBoosting = run && forward && !jump;
    const effectiveTopSpeed = topSpeed * (isBoosting ? boostTopSpeedMult : 1);
    const hasInput = currAcc !== 0 || steerInput !== 0 || jump || run;

    if (hasInput && chassis.isSleeping()) {
      chassis.wakeUp();
    }

    currSteerSmooth.current = MathUtils.lerp(
      currSteerSmooth.current,
      steerInput,
      MathUtils.clamp(dt / Math.max(0.0001, steerSmoothing), 0, 1),
    );

    const isHandbraking = jump && speed > 0.4;
    const isReverseBraking =
      !jump && currAcc < 0 && speed > 0.15 && forwardSpeed > 0.05;
    const isAccelerating =
      currAcc !== 0 && !isReverseBraking && speed < effectiveTopSpeed;

    const speedFactor = MathUtils.clamp(
      1 - Math.abs(forwardSpeed) / effectiveTopSpeed,
      0.25,
      1,
    );
    const boostMult =
      isBoosting && currAcc > 0 ? boostForceMult : 1;
    const reverseBrake = isReverseBraking ? breakForce * 0.4 : 0;
    const handbrake = isHandbraking ? breakForce * HANDBRAKE_FORCE_MULT : 0;
    const steerRad =
      currSteerSmooth.current *
      maxSteerRad *
      (isHandbraking ? 1.4 : 1);

    WHEELS.forEach(({ axle }, index) => {
      vehicle.setWheelEngineForce(index, 0);

      if (isHandbraking && axle === "rear") {
        vehicle.setWheelBrake(index, handbrake);
        vehicle.setWheelFrictionSlip(index, HANDBRAKE_FRICTION_SLIP);
        vehicle.setWheelSideFrictionStiffness(index, HANDBRAKE_SIDE_FRICTION);
      } else {
        vehicle.setWheelBrake(index, reverseBrake);
        vehicle.setWheelFrictionSlip(index, NORMAL_FRICTION_SLIP);
        vehicle.setWheelSideFrictionStiffness(index, NORMAL_SIDE_FRICTION);
      }

      if (axle === "front") {
        vehicle.setWheelSteering(index, steerRad);
      }
    });

    vehicle.updateVehicle(dt);

    if (isAccelerating) {
      driveImpulse
        .copy(worldForward)
        .multiplyScalar(
          currAcc * accelerationForce * DRIVE_IMPULSE_SCALE * speedFactor * boostMult,
        );
      driveImpulse.y = 0;
      chassis.applyImpulse(driveImpulse, true);
    }
  });

  useFrame(({ camera }, delta) => {
    if (delta > 1) delta %= 1;

    const vehicle = vehicleRef.current;
    const chassis = chassisRef.current;
    if (!vehicle || !chassis) return;

    const chassisTranslation = chassis.translation();
    if (chassisTranslation.y < -8) {
      chassis.setTranslation(
        { x: chassisTranslation.x, y: DEFAULT_START_Y, z: chassisTranslation.z },
        true,
      );
      chassis.setLinvel({ x: 0, y: 0, z: 0 }, true);
      chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }

    for (let index = 0; index < 4; index++) {
      const wheel = wheelRefs.current[index];
      if (!wheel) continue;

      const wheelAxleCs = vehicle.wheelAxleCs(index);
      if (!wheelAxleCs) continue;

      const connection =
        vehicle.wheelChassisConnectionPointCs(index)?.y ?? 0;
      const suspension = vehicle.wheelSuspensionLength(index) ?? 0;
      const steering = vehicle.wheelSteering(index) ?? 0;
      const rotationRad = vehicle.wheelRotation(index) ?? 0;

      wheel.position.y = connection - suspension;

      wheelSteeringQuat.setFromAxisAngle(up, steering);
      wheelRotationQuat.setFromAxisAngle(wheelAxleCs, rotationRad);
      wheelQuat.copy(wheelSteeringQuat).multiply(wheelRotationQuat);
      wheel.quaternion.copy(wheelQuat);
    }

    const translation = chassis.translation();
    chassisPosition.set(translation.x, translation.y, translation.z);
    focusRef.current.copy(chassisPosition);

    pivotPosition.set(chassisPosition.x, PIVOT_HEIGHT, chassisPosition.z);
    pivot.position.lerp(pivotPosition, 1 - Math.exp(-CAMERA_SMOOTHING * delta));

    followCam.getWorldPosition(followCamPosition);
    camera.position.lerp(
      followCamPosition,
      1 - Math.exp(-CAMERA_SMOOTHING * delta),
    );
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
      friction={1}
      linearDamping={0.15}
      angularDamping={0.85}
      canSleep
    >
      <CuboidCollider
        args={[
          BODY.length / 2,
          CHASSIS_COLLIDER_HALF_HEIGHT,
          BODY.width / 2,
        ]}
        position={[0, CHASSIS_COLLIDER_Y, 0]}
        restitution={0.01}
        friction={0.4}
      />

      <mesh castShadow>
        <boxGeometry args={[BODY.length, BODY.height, BODY.width]} />
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
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
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
