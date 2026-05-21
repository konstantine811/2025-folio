import type { DynamicRayCastVehicleController } from "@dimforge/rapier3d-compat";
import {
  type RapierRigidBody,
  useAfterPhysicsStep,
  useRapier,
} from "@react-three/rapier";
import { type RefObject, useEffect, useRef } from "react";
import { Quaternion, Vector3, MathUtils, type Object3D } from "three";

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
  /** Max local Y for wheel hub — stops mesh clipping into chassis. */
  maxHubY?: number;
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
  const hubYRefs = useRef<number[]>([]);

  useEffect(() => {
    const chassis = chassisRef.current;
    if (!chassis) return;

    const vehicle = world.createVehicleController(chassis);
    vehicle.indexUpAxis = 1;
    (vehicle as { setIndexForwardAxis: number }).setIndexForwardAxis =
      indexForwardAxis;

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
    hubYRefs.current = [];

    return () => {
      vehicleController.current = null;
      world.removeVehicleController(vehicle);
    };
  }, [chassisRef, indexForwardAxis, wheelsInfo, world]);

  useAfterPhysicsStep((rapierWorld) => {
    const controller = vehicleController.current;
    const wheels = wheelsRef.current;
    if (!controller || !wheels) return;

    controller.updateVehicle(rapierWorld.timestep);

    wheels.forEach((wheel, index) => {
      if (!wheel) return;

      const wheelInfo = wheelsInfo[index];
      const wheelAxleCs = controller.wheelAxleCs(index);
      if (!wheelAxleCs) return;

      const connection = controller.wheelChassisConnectionPointCs(index)?.y ?? 0;
      const suspension = controller.wheelSuspensionLength(index) ?? 0;
      const steering = controller.wheelSteering(index) ?? 0;
      const rotationRad = controller.wheelRotation(index) ?? 0;

      // Suspension length is ray-to-ground; hub sits one radius above contact.
      let targetHubY = connection - suspension + wheelInfo.radius;
      if (wheelInfo.maxHubY !== undefined) {
        targetHubY = Math.min(targetHubY, wheelInfo.maxHubY);
      }

      const minHubY =
        connection - wheelInfo.suspensionRestLength + wheelInfo.radius;
      targetHubY = Math.max(targetHubY, minHubY);

      const previousHubY = hubYRefs.current[index] ?? targetHubY;
      const isRecovering = targetHubY > previousHubY;
      const smoothFactor = isRecovering ? 0.62 : 0.38;
      const hubY = MathUtils.lerp(previousHubY, targetHubY, smoothFactor);
      hubYRefs.current[index] = hubY;
      wheel.position.y = hubY;

      wheelSteeringQuat.setFromAxisAngle(up, steering);
      wheelRotationQuat.setFromAxisAngle(wheelAxleCs, rotationRad);
      wheel.quaternion.multiplyQuaternions(
        wheelSteeringQuat,
        wheelRotationQuat,
      );
    });
  });

  return { vehicleController };
}
