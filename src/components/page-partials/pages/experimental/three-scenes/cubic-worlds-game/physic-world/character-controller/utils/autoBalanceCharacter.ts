import { quat, RapierRigidBody } from "@react-three/rapier";
import { Euler, Mesh, Object3D, Object3DEventMap, Vector3 } from "three";

export const autoBalanceCharacter = (
  character: RapierRigidBody | null,
  bodyFacingVec: Vector3,
  bodyBalanceVec: Vector3,
  bodyBalanceVecOnX: Vector3,
  bodyFacingVecOnY: Vector3,
  bodyBalanceVecOnZ: Vector3,
  isModeCameraBased: boolean,
  slopeRayOrigin: Mesh | null,
  modelEuler: Euler,
  pivot: Object3D<Object3DEventMap>,
  modelFacingVec: Vector3,
  slopeRayOriginUpdatePosition: Vector3,
  movingDirection: Vector3,
  camBasedMoveCrossVecOnY: Vector3,
  slopeRayOriginOffest: number,
  characterModelIndicator: Object3D,
  crossVecOnX: Vector3,
  crossVecOnY: Vector3,
  crossVecOnZ: Vector3,
  vectorY: Vector3,
  dragAngForce: Vector3,
  autoBalanceSpringK: number,
  autoBalanceDampingC: number,
  autoBalanceSpringOnY: number,
  autoBalanceDampingOnY: number
) => {
  if (!character) return;
  // Match body component to character model rotation on Y
  bodyFacingVec.set(0, 0, 1).applyQuaternion(quat(character.rotation()));
  bodyBalanceVec.set(0, 1, 0).applyQuaternion(quat(character.rotation()));

  bodyBalanceVecOnX.set(0, bodyBalanceVec.y, bodyBalanceVec.z);
  bodyFacingVecOnY.set(bodyFacingVec.x, 0, bodyFacingVec.z);
  bodyBalanceVecOnZ.set(bodyBalanceVec.x, bodyBalanceVec.y, 0);

  // Check if is camera based movement
  if (isModeCameraBased && slopeRayOrigin) {
    modelEuler.y = pivot.rotation.y;
    pivot.getWorldDirection(modelFacingVec);
    // Update slopeRayOrigin to new positon
    slopeRayOriginUpdatePosition.set(movingDirection.x, 0, movingDirection.z);
    camBasedMoveCrossVecOnY
      .copy(slopeRayOriginUpdatePosition)
      .cross(modelFacingVec);
    slopeRayOrigin.position.x =
      slopeRayOriginOffest *
      Math.sin(
        slopeRayOriginUpdatePosition.angleTo(modelFacingVec) *
          (camBasedMoveCrossVecOnY.y < 0 ? 1 : -1)
      );
    slopeRayOrigin.position.z =
      slopeRayOriginOffest *
      Math.cos(
        slopeRayOriginUpdatePosition.angleTo(modelFacingVec) *
          (camBasedMoveCrossVecOnY.y < 0 ? 1 : -1)
      );
  } else {
    characterModelIndicator.getWorldDirection(modelFacingVec);
  }
  crossVecOnX.copy(vectorY).cross(bodyBalanceVecOnX);
  crossVecOnY.copy(modelFacingVec).cross(bodyFacingVecOnY);
  crossVecOnZ.copy(vectorY).cross(bodyBalanceVecOnZ);

  dragAngForce.set(
    (crossVecOnX.x < 0 ? 1 : -1) *
      autoBalanceSpringK *
      bodyBalanceVecOnX.angleTo(vectorY) -
      character.angvel().x * autoBalanceDampingC,
    (crossVecOnY.y < 0 ? 1 : -1) *
      autoBalanceSpringOnY *
      modelFacingVec.angleTo(bodyFacingVecOnY) -
      character.angvel().y * autoBalanceDampingOnY,
    (crossVecOnZ.z < 0 ? 1 : -1) *
      autoBalanceSpringK *
      bodyBalanceVecOnZ.angleTo(vectorY) -
      character.angvel().z * autoBalanceDampingC
  );

  // Apply balance torque impulse
  character.applyTorqueImpulse(dragAngForce, true);
};
