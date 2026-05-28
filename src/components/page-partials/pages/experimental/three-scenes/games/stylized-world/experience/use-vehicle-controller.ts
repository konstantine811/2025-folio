import type { DynamicRayCastVehicleController } from "@dimforge/rapier3d-compat";
import {
  type RapierRigidBody,
  useAfterPhysicsStep,
  useBeforePhysicsStep,
  useRapier,
} from "@react-three/rapier";
import { type RefObject, useEffect, useRef } from "react";
import { Quaternion, Vector3, type Object3D } from "three";
import {
  recordWheelContactPoint,
  type WheelContactHistoryEntry,
} from "./wheel-contact-history";
import { areWheelTracksEnabled, TRACK_SIMPLE_MODE } from "./track-simple-mode";

const up = new Vector3(0, 1, 0);
const wheelSteeringQuat = new Quaternion();
const wheelRotationQuat = new Quaternion();
const tmpTargetWheelPos = new Vector3();
const tmpWheelWorld = new Vector3();
const tmpContactNormal = new Vector3();
const tmpWheelAxle = new Vector3();

const WHEEL_VISUAL_SMOOTH_DOWN = 0.42;
const WHEEL_VISUAL_SMOOTH_UP = 0.24;
const SLOPE_WHEEL_VISUAL_SMOOTH = 0.34;
const AIRBORNE_WHEEL_VISUAL_SMOOTH = 0.55;

const FLAT_GROUND_NORMAL_Y = 0.97;
const WHEEL_CONTACT_RAY_START_OFFSET = 0.12;
const WHEEL_CONTACT_RAY_EXTRA_LENGTH = 0.32;
const WHEEL_CONTACT_XZ_SMOOTH = 0.38;

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

export function isVehicleTouchingGround(
  controller: DynamicRayCastVehicleController,
): boolean {
  const wheelCount = controller.numWheels();

  for (let index = 0; index < wheelCount; index += 1) {
    if (controller.wheelIsInContact(index)) return true;
  }

  return false;
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
  connection: { x: number; y: number; z: number },
  direction: { x: number; y: number; z: number },
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
  contactHistoriesRef?: RefObject<WheelContactHistoryEntry[]>;
};

export function useVehicleController(
  chassisRef: RefObject<RapierRigidBody | null>,
  wheelsRef: RefObject<(Object3D | null)[]>,
  wheelsInfo: WheelInfo[],
  {
    indexForwardAxis = 2,
    contactHistoriesRef,
  }: UseVehicleControllerOptions = {},
) {
  const { world, rapier } = useRapier();
  const vehicleController = useRef<DynamicRayCastVehicleController | null>(null);
  const smoothedWheelPosRef = useRef<(Vector3 | undefined)[]>([]);
  const smoothedContactRef = useRef<(Vector3 | undefined)[]>([]);

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
    smoothedContactRef.current = [];

    return () => {
      vehicleController.current = null;
      smoothedWheelPosRef.current = [];
      smoothedContactRef.current = [];
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
    if (!controller) return;

    const histories = contactHistoriesRef?.current;
    const wheelCount = controller.numWheels();

    if (areWheelTracksEnabled() && histories?.length) {
      for (let index = 0; index < wheelCount; index += 1) {
        const history = histories[index];
        const wheelInfo = wheelsInfo[index];
        const wheel = wheels?.[index] ?? null;

        if (!history || !wheelInfo) continue;

        if (TRACK_SIMPLE_MODE.rawWheelContactsOnly) {
          const inContact = controller.wheelIsInContact(index);
          const contact = controller.wheelContactPoint(index);

          if (inContact && contact) {
            recordWheelContactPoint(
              history,
              contact.x,
              contact.y,
              contact.z,
              true,
            );
          } else if (wheel && isVehicleTouchingGround(controller)) {
            wheel.getWorldPosition(tmpWheelWorld);
            recordWheelContactPoint(
              history,
              tmpWheelWorld.x,
              tmpWheelWorld.y - wheelInfo.radius,
              tmpWheelWorld.z,
              true,
            );
          } else {
            const d = history.data;
            recordWheelContactPoint(history, d[0], d[1], d[2], false);
          }
          continue;
        }

        const recordContact = (
          x: number,
          y: number,
          z: number,
          active: boolean,
        ) => {
          if (!active) {
            recordWheelContactPoint(history, x, y, z, false);
            return;
          }

          let smoothed = smoothedContactRef.current[index];
          if (!smoothed) {
            smoothed = new Vector3(x, y, z);
            smoothedContactRef.current[index] = smoothed;
          } else {
            smoothed.x += (x - smoothed.x) * WHEEL_CONTACT_XZ_SMOOTH;
            smoothed.z += (z - smoothed.z) * WHEEL_CONTACT_XZ_SMOOTH;
            smoothed.y = y;
          }

          recordWheelContactPoint(
            history,
            smoothed.x,
            smoothed.y,
            smoothed.z,
            true,
          );
        };

        const inContact = controller.wheelIsInContact(index);
        const contact = controller.wheelContactPoint(index);

        if (inContact && contact) {
          recordContact(contact.x, contact.y, contact.z, true);
        } else {
          const hardPoint = controller.wheelHardPoint(index);
          const rayOrigin = hardPoint
            ? {
                x: hardPoint.x,
                y: hardPoint.y + WHEEL_CONTACT_RAY_START_OFFSET,
                z: hardPoint.z,
              }
            : { x: 0, y: 0, z: 0 };
          const rayDir = { x: 0, y: -1, z: 0 };
          const maxToi =
            wheelInfo.suspensionRestLength +
            wheelInfo.radius +
            WHEEL_CONTACT_RAY_START_OFFSET +
            WHEEL_CONTACT_RAY_EXTRA_LENGTH;
          const rayHit = hardPoint
            ? world.castRay(
                new rapier.Ray(rayOrigin, rayDir),
                maxToi,
                true,
                undefined,
                undefined,
                undefined,
                chassisRef.current ?? undefined,
              )
            : null;

          if (rayHit) {
            recordContact(
              rayOrigin.x,
              rayOrigin.y + rayDir.y * rayHit.timeOfImpact,
              rayOrigin.z,
              true,
            );
          } else if (hardPoint) {
            const suspension = controller.wheelSuspensionLength(index) ?? 0;
            recordContact(
              hardPoint.x,
              hardPoint.y - suspension - wheelInfo.radius,
              hardPoint.z,
              false,
            );
          } else {
            recordContact(0, 0, 0, false);
          }
        }
      }
    }

    if (!wheels) {
      return;
    }

    wheels.forEach((wheel, index) => {
      if (!wheel) {
        return;
      }

      const wheelInfo = wheelsInfo[index];
      if (wheelCount === 0) {
        const history = histories?.[index];
        if (history && wheelInfo) {
          wheel.getWorldPosition(tmpWheelWorld);
          recordWheelContactPoint(
            history,
            tmpWheelWorld.x,
            tmpWheelWorld.y - wheelInfo.radius,
            tmpWheelWorld.z,
            true,
          );
        }
      }

      const wheelAxleCs = controller.wheelAxleCs(index);
      if (!wheelAxleCs) {
        return;
      }

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
      tmpWheelAxle.set(wheelAxleCs.x, wheelAxleCs.y, wheelAxleCs.z);
      wheelRotationQuat.setFromAxisAngle(tmpWheelAxle, rotationRad);
      wheel.quaternion
        .copy(wheelSteeringQuat)
        .multiply(wheelRotationQuat);
    });
  });

  return { vehicleController };
}
