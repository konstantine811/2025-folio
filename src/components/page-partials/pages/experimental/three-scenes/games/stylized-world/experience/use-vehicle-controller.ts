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

    return () => {
      vehicleController.current = null;
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

      const wheelAxleCs = controller.wheelAxleCs(index);
      if (!wheelAxleCs) return;

      const connection = controller.wheelChassisConnectionPointCs(index)?.y ?? 0;
      const suspension = controller.wheelSuspensionLength(index) ?? 0;
      const steering = controller.wheelSteering(index) ?? 0;
      const rotationRad = controller.wheelRotation(index) ?? 0;

      // Rapier suspension length = distance from chassis connection to wheel center.
      wheel.position.y = connection - suspension;

      wheelSteeringQuat.setFromAxisAngle(up, steering);
      wheelRotationQuat.setFromAxisAngle(wheelAxleCs, rotationRad);
      wheel.quaternion
        .copy(wheelSteeringQuat)
        .multiply(wheelRotationQuat);
    });
  });

  return { vehicleController };
}
