import type { DynamicRayCastVehicleController } from "@dimforge/rapier3d-compat";
import {
  type RapierRigidBody,
  useAfterPhysicsStep,
  useBeforePhysicsStep,
  useRapier,
} from "@react-three/rapier";
import { type RefObject, useEffect, useRef } from "react";
import { Quaternion, Vector3, type Object3D } from "three";

const up = new Vector3(0, 1, 0);
const wheelSteeringQuat = new Quaternion();
const wheelRotationQuat = new Quaternion();
const tmpTargetWheelPos = new Vector3();
const tmpWheelWorld = new Vector3();
const tmpContactNormal = new Vector3();

const WHEEL_VISUAL_SMOOTH_DOWN = 0.42;
const WHEEL_VISUAL_SMOOTH_UP = 0.24;
const SLOPE_WHEEL_VISUAL_SMOOTH = 0.34;
const AIRBORNE_WHEEL_VISUAL_SMOOTH = 0.55;

const FLAT_GROUND_NORMAL_Y = 0.97;

export function isVehicleOnFlatGround(
  controller: DynamicRayCastVehicleController,
): boolean {
  const wheelCount = controller.numWheels();

  for (let index = 0; index < wheelCount; index += 1) {
    if (!controller.wheelIsInContact(index)) return false;

    const normal = controller.wheelContactNormal(index);
    if (!normal || normal.y < FLAT_GROUND_NORMAL_Y) return false;
  }

  return wheelCount > 0;
}

function isWheelOnFlatGround(
  controller: DynamicRayCastVehicleController,
  index: number,
): boolean {
  if (!controller.wheelIsInContact(index)) return false;

  const normal = controller.wheelContactNormal(index);
  return Boolean(normal && normal.y >= FLAT_GROUND_NORMAL_Y);
}

function setSuspensionWheelTarget(
  target: Vector3,
  connection: Vector3,
  direction: Vector3,
  suspension: number,
) {
  target.set(
    connection.x + direction.x * suspension,
    connection.y + direction.y * suspension,
    connection.z + direction.z * suspension,
  );
}

function setContactWheelTarget(
  target: Vector3,
  controller: DynamicRayCastVehicleController,
  index: number,
  radius: number,
  chassisRoot: Object3D,
): boolean {
  const contact = controller.wheelContactPoint(index);
  const normal = controller.wheelContactNormal(index);

  if (!contact || !normal) return false;

  tmpContactNormal.set(normal.x, normal.y, normal.z);
  tmpWheelWorld
    .set(contact.x, contact.y, contact.z)
    .addScaledVector(tmpContactNormal, radius);
  chassisRoot.worldToLocal(tmpWheelWorld);
  target.copy(tmpWheelWorld);
  return true;
}

export type WheelInfo = {
  axleCs: Vector3;
  suspensionRestLength: number;
  suspensionStiffness: number;
  suspensionCompression: number;
  suspensionRelaxation: number;
  maxSuspensionForce: number;
  maxSuspensionTravel: number;
  frictionSlip: number;
  sideFrictionStiffness: number;
  position: Vector3;
  radius: number;
};

type UseVehicleControllerOptions = {
  indexForwardAxis?: number;
};

export function useVehicleController(
  chassisRef: RefObject<RapierRigidBody | null>,
  wheelsRef: RefObject<(Object3D | null)[]>,
  wheelsInfo: WheelInfo[],
  { indexForwardAxis = 2 }: UseVehicleControllerOptions = {},
) {
  const { world } = useRapier();
  const vehicleController = useRef<DynamicRayCastVehicleController | null>(null);
  const smoothedWheelPosRef = useRef<(Vector3 | undefined)[]>([]);

  useEffect(() => {
    const chassis = chassisRef.current;
    if (!chassis) return;

    const vehicle = world.createVehicleController(chassis);
    vehicle.indexUpAxis = 1;
    vehicle.setIndexForwardAxis = indexForwardAxis;

    const suspensionDirection = new Vector3(0, -1, 0);

    wheelsInfo.forEach((wheel, index) => {
      vehicle.addWheel(
        wheel.position,
        suspensionDirection,
        wheel.axleCs,
        wheel.suspensionRestLength,
        wheel.radius,
      );
      vehicle.setWheelSuspensionStiffness(index, wheel.suspensionStiffness);
      vehicle.setWheelSuspensionCompression(index, wheel.suspensionCompression);
      vehicle.setWheelSuspensionRelaxation(index, wheel.suspensionRelaxation);
      vehicle.setWheelMaxSuspensionForce(index, wheel.maxSuspensionForce);
      vehicle.setWheelMaxSuspensionTravel(index, wheel.maxSuspensionTravel);
      vehicle.setWheelFrictionSlip(index, wheel.frictionSlip);
      vehicle.setWheelSideFrictionStiffness(index, wheel.sideFrictionStiffness);
    });

    vehicleController.current = vehicle;
    smoothedWheelPosRef.current = [];

    return () => {
      vehicleController.current = null;
      smoothedWheelPosRef.current = [];
      world.removeVehicleController(vehicle);
    };
  }, [chassisRef, indexForwardAxis, wheelsInfo, world]);

  useBeforePhysicsStep(() => {
    const controller = vehicleController.current;
    if (!controller) return;

    controller.updateVehicle(1 / 60);
  });

  useAfterPhysicsStep(() => {
    const controller = vehicleController.current;
    const wheels = wheelsRef.current;
    if (!controller || !wheels) return;

    wheels.forEach((wheel, index) => {
      if (!wheel) return;

      const wheelInfo = wheelsInfo[index];
      const wheelAxleCs = controller.wheelAxleCs(index);
      if (!wheelAxleCs) return;

      const connection = controller.wheelChassisConnectionPointCs(index);
      const direction = controller.wheelDirectionCs(index);
      const suspension = controller.wheelSuspensionLength(index) ?? 0;
      const steering = controller.wheelSteering(index) ?? 0;
      const rotationRad = controller.wheelRotation(index) ?? 0;
      const chassisRoot = wheel.parent;
      const inContact = controller.wheelIsInContact(index);
      const onFlatWheel = isWheelOnFlatGround(controller, index);

      if (
        inContact &&
        chassisRoot &&
        setContactWheelTarget(
          tmpTargetWheelPos,
          controller,
          index,
          wheelInfo.radius,
          chassisRoot,
        )
      ) {
        // Contact + radius keeps wheels glued to the surface on slopes/roll.
      } else if (connection && direction) {
        setSuspensionWheelTarget(
          tmpTargetWheelPos,
          connection,
          direction,
          suspension,
        );
      } else if (connection) {
        tmpTargetWheelPos.set(
          wheel.position.x,
          connection.y - suspension,
          wheel.position.z,
        );
      } else {
        tmpTargetWheelPos.copy(wheel.position);
      }

      let smoothedPos = smoothedWheelPosRef.current[index];
      if (!smoothedPos) {
        smoothedPos = wheel.position.clone();
        smoothedWheelPosRef.current[index] = smoothedPos;
      }

      let smoothFactor = SLOPE_WHEEL_VISUAL_SMOOTH;
      if (!inContact) {
        smoothFactor = AIRBORNE_WHEEL_VISUAL_SMOOTH;
      } else if (onFlatWheel) {
        const isDropping = tmpTargetWheelPos.y < smoothedPos.y;
        smoothFactor = isDropping
          ? WHEEL_VISUAL_SMOOTH_DOWN
          : WHEEL_VISUAL_SMOOTH_UP;
      }

      smoothedPos.lerp(tmpTargetWheelPos, smoothFactor);
      wheel.position.copy(smoothedPos);

      wheelSteeringQuat.setFromAxisAngle(up, steering);
      wheelRotationQuat.setFromAxisAngle(wheelAxleCs, rotationRad);
      wheel.quaternion
        .copy(wheelSteeringQuat)
        .multiply(wheelRotationQuat);
    });
  });

  return { vehicleController };
}
