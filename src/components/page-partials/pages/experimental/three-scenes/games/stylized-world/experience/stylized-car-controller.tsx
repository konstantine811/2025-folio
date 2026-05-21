import useFollowCamera from "@/components/common/hooks/camera/useFollowCamera";
import { useControlStore } from "@/components/common/game-controller/store/control-game-store";
import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
  useAfterPhysicsStep,
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
  engineForceMin?: number;
  engineForceMax?: number;
  engineForceStep?: number;
  brakeForceMax?: number;
  brakeForceStep?: number;
  maxSteerDeg?: number;
  steerLerp?: number;
  topSpeed?: number;
};

/**
 * Rapier vehicle setup aligned with the official three.js example:
 * https://threejs.org/examples/physics_rapier_vehicle_controller.html
 *
 * Chassis length runs along local Z, front wheels at -Z.
 * With `startRotationY = Math.PI` the hood (-Z) faces world +Z (camera).
 */
const BODY = { width: 1.2, height: 0.45, length: 2 };
const WHEEL_RADIUS = 0.22;
const WHEEL_WIDTH = 0.14;
const WHEEL_Y = -BODY.height / 2 + 0.02;
const SUSPENSION_REST_LENGTH = 0.28;
const CHASSIS_MASS = 10;
const ENGINE_FORCE_MIN = -15;
const ENGINE_FORCE_MAX = 15;
const ENGINE_FORCE_STEP = 0.5;
const BRAKE_FORCE_MAX = 1;
const BRAKE_FORCE_STEP = 0.05;
const STEER_LERP = 0.25;
const FRICTION_SLIP = 1000;
const SUSPENSION_STIFFNESS = 24;
const SUSPENSION_COMPRESSION = 0.4;
const SUSPENSION_RELAXATION = 2.5;
const PHYSICS_DT = 1 / 60;
const TOP_SPEED = 7;
const MAX_VERTICAL_SPEED = 1.2;
const CHASSIS_COLLIDER_HALF_HEIGHT = 0.1;
const CHASSIS_COLLIDER_Y = 0.06;
const PIVOT_HEIGHT = 0.55;
const CAMERA_SMOOTHING = 5;
const DEFAULT_START_Y =
  WHEEL_RADIUS - WHEEL_Y + SUSPENSION_REST_LENGTH;

const WHEELS: { position: Vector3; axle: "front" | "rear" }[] = [
  { position: new Vector3(-0.5, WHEEL_Y, -0.7), axle: "front" },
  { position: new Vector3(0.5, WHEEL_Y, -0.7), axle: "front" },
  { position: new Vector3(-0.5, WHEEL_Y, 0.7), axle: "rear" },
  { position: new Vector3(0.5, WHEEL_Y, 0.7), axle: "rear" },
];

type VehicleController = NonNullable<
  ReturnType<typeof createVehicleForChassis>["vehicle"]
>;

function createVehicleForChassis(
  world: ReturnType<typeof useRapier>["world"],
  chassis: RapierRigidBody,
) {
  const vehicle = world.createVehicleController(chassis);
  // Rapier 0.15 defaults to +X forward; our chassis length is along Z (like three.js example).
  vehicle.indexUpAxis = 1;
  // Rapier typings name this setter `setIndexForwardAxis` (not `indexForwardAxis`).
  (vehicle as { setIndexForwardAxis: number }).setIndexForwardAxis = 2;

  const wheelDirection = { x: 0, y: -1, z: 0 };
  const wheelAxle = { x: -1, y: 0, z: 0 };

  WHEELS.forEach(({ position }, index) => {
    vehicle.addWheel(
      { x: position.x, y: position.y, z: position.z },
      wheelDirection,
      wheelAxle,
      SUSPENSION_REST_LENGTH,
      WHEEL_RADIUS,
    );
    vehicle.setWheelSuspensionStiffness(index, SUSPENSION_STIFFNESS);
    vehicle.setWheelSuspensionCompression(index, SUSPENSION_COMPRESSION);
    vehicle.setWheelSuspensionRelaxation(index, SUSPENSION_RELAXATION);
    vehicle.setWheelFrictionSlip(index, FRICTION_SLIP);
  });

  return { vehicle };
}

export function StylizedCarController({
  focusRef,
  startPosition = [0, DEFAULT_START_Y, 0],
  startRotationY = Math.PI,
  engineForceMin = ENGINE_FORCE_MIN,
  engineForceMax = ENGINE_FORCE_MAX,
  engineForceStep = ENGINE_FORCE_STEP,
  brakeForceMax = BRAKE_FORCE_MAX,
  brakeForceStep = BRAKE_FORCE_STEP,
  maxSteerDeg = 40,
  steerLerp = STEER_LERP,
  topSpeed = TOP_SPEED,
}: StylizedCarControllerProps) {
  const chassisRef = useRef<RapierRigidBody>(null);
  const vehicleRef = useRef<VehicleController | null>(null);
  const wheelRefs = useRef<(Object3D | null)[]>([]);
  const engineForceRef = useRef(0);
  const brakeForceRef = useRef(0);
  const wheelBrakeRef = useRef(0);
  const wheelEngineForceRef = useRef(0);
  const steerAngleRef = useRef(0);

  const { world } = useRapier();
  const forward = useControlStore((s) => s.forward);
  const backward = useControlStore((s) => s.backward);
  const leftward = useControlStore((s) => s.leftward);
  const rightward = useControlStore((s) => s.rightward);
  const jump = useControlStore((s) => s.jump);

  const wheelSteeringQuat = useMemo(() => new Quaternion(), []);
  const wheelRotationQuat = useMemo(() => new Quaternion(), []);
  const wheelQuat = useMemo(() => new Quaternion(), []);
  const up = useMemo(() => new Vector3(0, 1, 0), []);
  const pivotPosition = useMemo(() => new Vector3(), []);
  const followCamPosition = useMemo(() => new Vector3(), []);
  const chassisPosition = useMemo(() => new Vector3(), []);

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

    WHEELS.forEach(({ axle }, index) => {
      vehicle.setWheelEngineForce(
        index,
        axle === "front" ? wheelEngineForceRef.current : 0,
      );
      vehicle.setWheelBrake(index, wheelBrakeRef.current);

      if (axle === "front") {
        vehicle.setWheelSteering(index, steerAngleRef.current);
      }
    });

    vehicle.updateVehicle(PHYSICS_DT);

    const linvel = chassis.linvel();
    if (Math.abs(linvel.y) > MAX_VERTICAL_SPEED) {
      chassis.setLinvel(
        {
          x: linvel.x,
          y: Math.sign(linvel.y) * MAX_VERTICAL_SPEED,
          z: linvel.z,
        },
        true,
      );
    }
  });

  useFrame(() => {
    const vehicle = vehicleRef.current;
    const chassis = chassisRef.current;
    if (!vehicle || !chassis) return;

    const forwardInput = forward ? -1 : backward ? 1 : 0;
    const steerDirection = leftward ? 1 : rightward ? -1 : 0;
    const brakeInput = jump ? 1 : 0;

    let engineForce = 0;
    if (forwardInput < 0) {
      engineForce = engineForceRef.current - engineForceStep;
      if (engineForce < engineForceMin) engineForce = engineForceMin;
    } else if (forwardInput > 0) {
      engineForce = engineForceRef.current + engineForceStep;
      if (engineForce > engineForceMax) engineForce = engineForceMax;
    } else if (chassis.isSleeping()) {
      chassis.wakeUp();
    }
    engineForceRef.current = engineForce;

    let brakeForce = 0;
    if (brakeInput > 0) {
      brakeForce = brakeForceRef.current + brakeForceStep;
      if (brakeForce > brakeForceMax) brakeForce = brakeForceMax;
    }
    brakeForceRef.current = brakeForce;
    wheelBrakeRef.current = brakeInput * brakeForce;

    const vehicleSpeed = vehicle.currentVehicleSpeed();
    let wheelEngineForce = engineForce;
    if (vehicleSpeed <= -topSpeed && wheelEngineForce < 0) {
      wheelEngineForce = 0;
    }
    if (vehicleSpeed >= topSpeed && wheelEngineForce > 0) {
      wheelEngineForce = 0;
    }
    wheelEngineForceRef.current = wheelEngineForce;

    const currentSteering = vehicle.wheelSteering(0) ?? 0;
    steerAngleRef.current = MathUtils.lerp(
      currentSteering,
      maxSteerRad * steerDirection,
      steerLerp,
    );
  }, -1);

  useAfterPhysicsStep(() => {
    const vehicle = vehicleRef.current;
    const chassis = chassisRef.current;
    if (!vehicle || !chassis) return;

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
  });

  useFrame(({ camera }, delta) => {
    if (delta > 1) delta %= 1;

    const chassis = chassisRef.current;
    if (!chassis) return;

    const chassisTranslation = chassis.translation();
    if (chassisTranslation.y < -8) {
      chassis.setTranslation(
        { x: chassisTranslation.x, y: DEFAULT_START_Y, z: chassisTranslation.z },
        true,
      );
      chassis.setLinvel({ x: 0, y: 0, z: 0 }, true);
      chassis.setAngvel({ x: 0, y: 0, z: 0 }, true);
      engineForceRef.current = 0;
      brakeForceRef.current = 0;
      wheelBrakeRef.current = 0;
      wheelEngineForceRef.current = 0;
    }

    const translation = chassis.translation();
    chassisPosition.set(translation.x, translation.y, translation.z);
    focusRef.current.set(translation.x, translation.y, translation.z);

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
      linearDamping={0.02}
      angularDamping={0.35}
      canSleep
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
