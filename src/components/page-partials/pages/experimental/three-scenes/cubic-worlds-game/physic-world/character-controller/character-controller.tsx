import {
  ComponentProps,
  forwardRef,
  PropsWithChildren,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  RigidBody,
  CapsuleCollider,
  CylinderCollider,
  useRapier,
  interactionGroups,
} from "@react-three/rapier";
import type { RapierRigidBody } from "@react-three/rapier";
import {
  DirectionalLight,
  Euler,
  Group,
  Mesh,
  Object3D,
  Quaternion,
  Vector2,
  Vector3,
} from "three";
import {
  RayColliderHit,
  Vector,
  type Collider,
} from "@dimforge/rapier3d-compat";
import { useFrame, useThree } from "@react-three/fiber";
import useFollowCamera from "./hooks/useFollowCamera";
import { useControlStore } from "./stores/control-game-store";
import { getPivotMovingDirection } from "@/utils/game.utils";
import {
  rayGroundDetection,
  rayHitMoveDetection,
} from "./utils/rayHitDetection";
import { slopeDetection } from "./utils/slopeDetection";
import { applyDragForce, applyFloatingForce } from "./utils/applyForce";
import { applyJumpImpulse } from "./utils/applyImpulse";
import { autoBalanceCharacter } from "./utils/autoBalanceCharacter";
import { moveCharacter, MoveCharacterProps } from "./utils/moveCharacter";
import { detectFallingState } from "./utils/detectFalling";
import { useGameStore } from "./stores/game-store";
import { pointToMove, PointToMoveProps } from "./utils/pointMove";
import { SceneObjectName } from "./config/character.config";
import { useGameDataStore } from "./stores/game-data-store";
import { CollisionWorldType } from "../../../config/collision";
import useCharacterCreateTexture from "./hooks/useCharacterCreateTexture";

export type camListenerTargetType = "document" | "domElement";

// Усі пропси RigidBody як у компонента
type RigidBodyLikeProps = ComponentProps<typeof RigidBody>;

// Що НЕ даємо перезаписувати зовні (бо фіксуємо всередині)
type PassThroughRigidBodyProps = Omit<
  RigidBodyLikeProps,
  "ref" | "colliders" | "onContactForce" | "onCollisionExit"
>;

export interface userDataType {
  canJump?: boolean;
  slopeAngle?: number | null;
  characterRotated?: boolean;
  isOnMovingObject?: boolean;
  excludeEcctrlRay?: boolean;
}

// ---- твої власні пропси
interface OwnProps {
  debug?: boolean;
  capsuleHalfHeight?: number;
  capsuleRadius?: number;
  floatHeight?: number;
  characterInitDir?: number;
  followLight?: boolean;
  disableControl?: boolean;
  disableFollowCam?: boolean;
  disableFollowCamPos?: Vector3 | null;
  disableFollowCamTarget?: Vector3 | null;
  // camera
  camInitDis?: number;
  camMaxDis?: number;
  camMinDis?: number;
  camUpLimit?: number;
  camLowLimit?: number;
  camInitDir?: Vector2;
  camTargetPos?: Vector3;
  camMoveSpeed?: number;
  camZoomSpeed?: number;
  camCollision?: boolean;
  camCollisionOffset?: number;
  camCollisionSpeedMult?: number;
  fixedCamRotMult?: number;
  camListenerTarget?: "document" | "domElement";

  // light
  followLightPos?: Vector3;

  // базові рухи
  maxVelLimit?: number;
  turnVelMultiplier?: number;
  turnSpeed?: number;
  sprintMult?: number;
  jumpVel?: number;
  jumpForceToGroundMult?: number;
  slopJumpMult?: number;
  sprintJumpMult?: number;
  airDragMultiplier?: number;
  dragDampingC?: number;
  accDeltaTime?: number;
  rejectVelMult?: number;
  moveImpulsePointY?: number;
  camFollowMult?: number;
  camLerpMult?: number;
  fallingGravityScale?: number;
  fallingMaxVel?: number;
  wakeUpDelay?: number;

  // floating ray
  rayOriginOffest?: Vector3;
  rayHitForgiveness?: number;
  rayLength?: number;
  rayDir?: Vector3;
  floatingDis?: number;
  springK?: number;
  dampingC?: number;

  // slope ray
  showSlopeRayOrigin?: boolean;
  slopeMaxAngle?: number;
  slopeRayOriginOffest?: number;
  slopeRayLength?: number;
  slopeRayDir?: Vector3;
  slopeUpExtraForce?: number;
  slopeDownExtraForce?: number;

  // auto-balance
  autoBalance?: boolean;
  autoBalanceSpringK?: number;
  autoBalanceDampingC?: number;
  autoBalanceSpringOnY?: number;
  autoBalanceDampingOnY?: number;

  // інше
  animated?: boolean;
  mode?: string | null;

  // point-to-move
  bodySensorSize?: [number, number];
  bodySensorPosition?: Vector3;
}

// Фінальні пропси компонента
export type Props = PropsWithChildren<OwnProps & PassThroughRigidBodyProps>;

export type ComplexControllerHandle = {
  /** RigidBody персонажа (може бути null до mount) */
  readonly group: RapierRigidBody | null;
  /** Повернути камеру */
  rotateCamera: (x: number, y: number) => void;
  /** Повернути персонажа навколо Y */
  rotateCharacterOnY: (rad: number) => void;
};

const ComplexController = forwardRef<ComplexControllerHandle, Props>(
  (
    {
      children,
      capsuleHalfHeight = 0.35,
      capsuleRadius = 0.3,
      floatHeight = -0.02,
      characterInitDir = 0, // in rad
      followLight = false,
      disableFollowCam = false,
      disableFollowCamPos = null,
      disableFollowCamTarget = null,
      disableControl = false,
      // Follow camera setups
      camInitDis = -5,
      camMaxDis = -7,
      camMinDis = -0.7,
      camUpLimit = 1.5, // in rad
      camLowLimit = -1.3, // in rad
      camInitDir = { x: 0, y: 0 }, // in rad
      camTargetPos = { x: 0, y: 0, z: 0 },
      camMoveSpeed = 1,
      camZoomSpeed = 1,
      camCollision = true,
      camCollisionOffset = 0.7,
      camCollisionSpeedMult = 4,
      fixedCamRotMult = 1,
      camListenerTarget = "domElement", // document or domElement
      // Follow light setups
      followLightPos = { x: 20, y: 30, z: 10 },
      // Base control setups
      maxVelLimit = 2.5,
      turnVelMultiplier = 0.2,
      turnSpeed = 15,
      sprintMult = 2,
      jumpVel = 4,
      jumpForceToGroundMult = 5,
      slopJumpMult = 0.25,
      sprintJumpMult = 1.2,
      airDragMultiplier = 0.2,
      dragDampingC = 0.15,
      accDeltaTime = 8,
      rejectVelMult = 4,
      moveImpulsePointY = 0.5,
      camFollowMult = 11,
      camLerpMult = 25,
      fallingGravityScale = 2.5,
      fallingMaxVel = -20,
      wakeUpDelay = 200,
      // Floating Ray setups
      rayOriginOffest = { x: 0, y: -capsuleHalfHeight, z: 0 },
      rayHitForgiveness = 0.1,
      rayLength = capsuleRadius + 2,
      rayDir = { x: 0, y: -1, z: 0 },
      floatingDis = capsuleRadius + floatHeight,
      springK = 1.2,
      dampingC = 0.08,
      // Slope Ray setups
      showSlopeRayOrigin = false,
      slopeMaxAngle = 1, // in rad
      slopeRayOriginOffest = capsuleRadius - 0.03,
      slopeRayLength = capsuleRadius + 3,
      slopeRayDir = { x: 0, y: -1, z: 0 },
      slopeUpExtraForce = 0.1,
      slopeDownExtraForce = 0.2,
      // AutoBalance Force setups
      autoBalance = true,
      autoBalanceSpringK = 0.3,
      autoBalanceDampingC = 0.03,
      autoBalanceSpringOnY = 0.5,
      autoBalanceDampingOnY = 0.015,
      // Animation temporary setups
      // Mode setups
      mode = null,
      // Point-to-move setups
      bodySensorSize = [capsuleHalfHeight / 2, capsuleRadius],
      bodySensorPosition = { x: 0, y: 0, z: capsuleRadius / 2 },
      animated = false,
      // Other rigibody props from parent
      ...props
    },
    ref
  ) => {
    const characterRef = useRef<RapierRigidBody | null>(null);
    const characterModelRef = useRef<Group | null>(null);
    const characterModelIndicator: Object3D = useMemo(() => new Object3D(), []);
    const { forward, backward, rightward, leftward, run, jump } =
      useControlStore();
    const setCharacterRigidBody = useGameDataStore(
      (state) => state.setCharacterRigidBody
    );

    const {
      idle: idleAnimation,
      run: runAnimation,
      jump: jumpAnimation,
      walk: walkAnimation,
      fall: fallAnimation,
      jumpIdle: jumpIdleAnimation,
    } = useGameStore();
    const moveToPoint = useGameStore((s) => s.moveToPoint);
    const setOnGround = useGameStore((s) => s.setOnGround);
    const setMoveToPoint = useGameStore((s) => s.setMoveToPoint);
    const { rapier, world } = useRapier();
    const { scene } = useThree();

    let isModePointToMove: boolean = false;
    let functionKeyDown: boolean = false;
    let isModeFixedCamera: boolean = false;
    let isModeCameraBased: boolean = false;
    const findMode = (mode: string, modes: string) =>
      modes.split(" ").some((m) => m === mode);
    if (mode) {
      if (findMode("PointToMove", mode)) isModePointToMove = true;
      if (findMode("FixedCamera", mode)) isModeFixedCamera = true;
      if (findMode("CameraBasedMovement", mode)) isModeCameraBased = true;
    }

    // light

    const characterLight = scene.getObjectByName(
      SceneObjectName.characterLight
    ) as DirectionalLight;

    /**
     * Body collider setup
     */
    const modelFacingVec: Vector3 = useMemo(() => new Vector3(), []);
    const bodyFacingVec: Vector3 = useMemo(() => new Vector3(), []);
    const bodyBalanceVec: Vector3 = useMemo(() => new Vector3(), []);
    const bodyBalanceVecOnX: Vector3 = useMemo(() => new Vector3(), []);
    const bodyFacingVecOnY: Vector3 = useMemo(() => new Vector3(), []);
    const bodyBalanceVecOnZ: Vector3 = useMemo(() => new Vector3(), []);
    const vectorY: Vector3 = useMemo(() => new Vector3(0, 1, 0), []);
    const vectorZ: Vector3 = useMemo(() => new Vector3(0, 0, 1), []);
    const crossVecOnX: Vector3 = useMemo(() => new Vector3(), []);
    const crossVecOnY: Vector3 = useMemo(() => new Vector3(), []);
    const crossVecOnZ: Vector3 = useMemo(() => new Vector3(), []);
    const bodyContactForce: Vector3 = useMemo(() => new Vector3(), []);
    const slopeRayOriginUpdatePosition: Vector3 = useMemo(
      () => new Vector3(),
      []
    );
    const camBasedMoveCrossVecOnY: Vector3 = useMemo(() => new Vector3(), []);

    // Load camera pivot and character move preset
    /**
     * Load camera pivot and character move preset
     */
    const cameraSetups = {
      disableFollowCam,
      disableFollowCamPos,
      disableFollowCamTarget,
      camInitDis,
      camMaxDis,
      camMinDis,
      camUpLimit,
      camLowLimit,
      camInitDir,
      camMoveSpeed: isModeFixedCamera ? 0 : camMoveSpeed, // Disable camera move in fixed camera mode
      camZoomSpeed: isModeFixedCamera ? 0 : camZoomSpeed, // Disable camera zoom in fixed camera mode
      camCollisionOffset,
      camCollisionSpeedMult,
      camListenerTarget,
    };
    const { pivot, followCam, cameraCollisionDetect } =
      useFollowCamera(cameraSetups);

    const pivotPosition: Vector3 = useMemo(() => new Vector3(), []);
    const pivotXAxis: Vector3 = useMemo(() => new Vector3(1, 0, 0), []);
    const pivotYAxis: Vector3 = useMemo(() => new Vector3(0, 1, 0), []);
    const pivotZAxis: Vector3 = useMemo(() => new Vector3(0, 0, 1), []);
    const followCamPosition: Vector3 = useMemo(() => new Vector3(), []);
    const modelEuler: Euler = useMemo(() => new Euler(), []);
    const modelQuat: Quaternion = useMemo(() => new Quaternion(), []);
    const moveImpulse: Vector3 = useMemo(() => new Vector3(), []);
    const movingDirection: Vector3 = useMemo(() => new Vector3(), []);
    const moveAccNeeded: Vector3 = useMemo(() => new Vector3(), []);
    const jumpVelocityVec: Vector3 = useMemo(() => new Vector3(), []);
    const jumpDirection: Vector3 = useMemo(() => new Vector3(), []);
    const currentVel: Vector3 = useMemo(() => new Vector3(), []);
    const currentPos: Vector3 = useMemo(() => new Vector3(), []);
    const dragAngForce: Vector3 = useMemo(() => new Vector3(), []);
    const wantToMoveVel: Vector3 = useMemo(() => new Vector3(), []);
    const rejectVel: Vector3 = useMemo(() => new Vector3(), []);

    /**
     * Rotate camera function
     */
    const rotateCamera = useCallback(
      (x: number, y: number) => {
        pivot.rotation.y += y;
        followCam.rotation.x = Math.min(
          Math.max(followCam.rotation.x + x, camLowLimit),
          camUpLimit
        );
      },
      [pivot, followCam, camLowLimit, camUpLimit]
    );

    /**
     * Rotate character on Y function
     */
    const rotateCharacterOnY = useCallback(
      (rad: number) => {
        modelEuler.y += rad;
      },
      [modelEuler]
    );

    useImperativeHandle(
      ref,
      () => ({
        get group() {
          return characterRef.current;
        },
        rotateCamera,
        rotateCharacterOnY,
      }),
      [rotateCamera, rotateCharacterOnY]
    );

    /**
     * Floating Ray setup
     */
    const floatingForce = null;
    const springDirVec: Vector3 = useMemo(() => new Vector3(), []);
    const characterMassForce: Vector3 = useMemo(() => new Vector3(), []);
    const rayOrigin: Vector3 = useMemo(() => new Vector3(), []);
    const rayCast = new rapier.Ray(rayOrigin, rayDir);
    const rayHit: RayColliderHit | null = null;

    // can jump setup
    let canJump: boolean = false;
    let isFalling: boolean = false;
    const initialGravityScale: number = useMemo(
      () => props.gravityScale ?? 1,
      [props.gravityScale]
    );

    useCharacterCreateTexture({
      characterRigidBody: characterRef.current,
      onGround: !canJump,
    });
    // Slope detection ray setup
    const slopeAngle: number = 0;
    const actualSlopeAngle: number = 0;
    const actualSlopeNormal: Vector | null = null;
    const slopeRayOriginRef = useRef<Mesh | null>(null);
    const actualSlopeNormalVec: Vector3 = useMemo(() => new Vector3(), []);
    let slopeRayHit: RayColliderHit | null = null;
    const floorNormal: Vector3 = useMemo(() => new Vector3(0, 1, 0), []);
    const slopeRayorigin: Vector3 = useMemo(() => new Vector3(), []);
    const slopeRayCast = new rapier.Ray(slopeRayorigin, slopeRayDir);

    //  Point move setup
    const bodySensorRef = useRef<Collider | null>(null);
    let isBodyHitWall = false;
    const isPointMoving = false;
    const crossVector: Vector3 = useMemo(() => new Vector3(), []);
    const pointToPoint: Vector3 = useMemo(() => new Vector3(), []);
    const handleOnIntersectionEnter = () => {
      isBodyHitWall = true;
    };
    const handleOnIntersectionExit = () => {
      isBodyHitWall = false;
    };

    // on moving object state
    let massRatio: number = 1;
    let isOnMovingObject: boolean = false;
    const standingForcePoint: Vector3 = useMemo(() => new Vector3(), []);
    const movingObjectDragForce: Vector3 = useMemo(() => new Vector3(), []);
    const movingObjectVelocity: Vector3 = useMemo(() => new Vector3(), []);
    const movingObjectVelocityInCharacterDir: Vector3 = useMemo(
      () => new Vector3(),
      []
    );
    const distanceFromCharacterToObject: Vector3 = useMemo(
      () => new Vector3(),
      []
    );
    const objectAngvelToLinvel: Vector3 = useMemo(() => new Vector3(), []);
    const velocityDiff: Vector3 = useMemo(() => new Vector3(), []);

    // character moving function
    const characterRotated: boolean = true;

    /**
     * Character auto balance function
     */

    /**
     * Character sleep function
     */
    const sleepCharacter = useCallback(() => {
      if (!characterRef.current) return;
      if (document.visibilityState === "hidden") {
        characterRef.current.sleep();
      } else {
        setTimeout(() => {
          if (characterRef.current) characterRef.current.wakeUp();
        }, wakeUpDelay);
      }
    }, [wakeUpDelay]);

    useEffect(() => {
      // Initialize character facing direction
      modelEuler.y = characterInitDir;

      window.addEventListener("visibilitychange", sleepCharacter);

      return () => {
        window.removeEventListener("visibilitychange", sleepCharacter);
      };
    }, [sleepCharacter, characterInitDir, modelEuler]);

    useEffect(() => {
      if (characterRef.current) {
        setCharacterRigidBody(characterRef.current);
      }
    }, [setCharacterRigidBody]);

    useFrame(({ camera }, delta) => {
      if (delta > 1) delta %= 1;
      // Character current position/velocity

      if (!characterRef.current) return;
      if (disableControl) {
        characterRef.current.lockRotations(true, false);
        return;
      } else {
        characterRef.current.lockRotations(false, true);
      }
      currentPos.copy(characterRef.current.translation() as Vector3);
      currentVel.copy(characterRef.current.linvel() as Vector3);
      // Assign userDate properties
      const userData = characterRef.current.userData as userDataType;
      userData.canJump = canJump;
      userData.slopeAngle = slopeAngle;
      userData.characterRotated = characterRotated;
      userData.isOnMovingObject = isOnMovingObject;

      /**
       * Camera movement
       */
      pivotXAxis.set(1, 0, 0);
      pivotXAxis.applyQuaternion(pivot.quaternion);
      pivotZAxis.set(0, 0, 1);
      pivotZAxis.applyQuaternion(pivot.quaternion);
      pivotPosition
        .copy(currentPos)
        .addScaledVector(pivotXAxis, camTargetPos.x)
        .addScaledVector(
          pivotYAxis,
          camTargetPos.y + (capsuleHalfHeight + capsuleRadius / 2)
        )
        .addScaledVector(pivotZAxis, camTargetPos.z);
      pivot.position.lerp(pivotPosition, 1 - Math.exp(-camFollowMult));

      followCam.getWorldPosition(followCamPosition);
      camera.position.lerp(followCamPosition, 1 - Math.exp(-camLerpMult));
      camera.lookAt(pivot.position);
      if (followLight && characterLight && characterModelRef.current) {
        characterLight.position.x = currentPos.x + followLightPos.x;
        characterLight.position.y = currentPos.y + followLightPos.y;
        characterLight.position.z = currentPos.z + followLightPos.z;
        characterLight.target = characterModelRef.current;
      }

      /**
       * Camera collision detect
       */
      if (camCollision) {
        cameraCollisionDetect(delta);
      }

      // Getting moving directions (IIFE)
      modelEuler.y = ((movingDirection) =>
        movingDirection === null ? modelEuler.y : movingDirection)(
        getPivotMovingDirection(forward, backward, leftward, rightward, pivot)
      );

      // Rotate character Indicator
      modelQuat.setFromEuler(modelEuler);
      characterModelIndicator.quaternion.rotateTowards(
        modelQuat,
        delta * turnSpeed
      );

      // If autobalance is off, rotate character model itself
      if (!autoBalance && characterModelRef.current) {
        if (isModeCameraBased) {
          characterModelRef.current.quaternion.copy(pivot.quaternion);
        } else {
          characterModelRef.current.quaternion.copy(
            characterModelIndicator.quaternion
          );
        }
      }

      const { slopeRayHit: slopeRayHitN } = slopeDetection({
        slopeRayOrigin: slopeRayOriginRef.current,
        slopeRayorigin,
        slopeRayHit,
        rayOrigin,
        world,
        slopeRayCast,
        slopeRayLength,
        character: characterRef.current,
        actualSlopeNormal,
        actualSlopeNormalVec,
        actualSlopeAngle,
        floorNormal,
        rayHit,
        floatingDis,
        canJump,
        slopeAngle,
        slopeRayOriginOffest,
      });

      slopeRayHit = slopeRayHitN;

      /**
       * Ray casting detect if on ground
       */
      canJump = rayGroundDetection(
        rayOrigin,
        currentPos,
        rayOriginOffest as Vector3,
        rayLength,
        world,
        characterRef.current,
        rayHit,
        rayCast,
        floatingDis,
        rayHitForgiveness,
        slopeRayHit,
        actualSlopeAngle,
        slopeMaxAngle,
        canJump
      );
      setOnGround(canJump);

      if (forward || backward || leftward || rightward) {
        const moveCharacterProps: MoveCharacterProps = {
          run,
          slopeAngle,
          movingObjectVelocity,
          character: characterRef.current,
          actualSlopeAngle,
          slopeMaxAngle,
          movingDirection,
          characterModelIndicator,
          movingObjectVelocityInCharacterDir,
          currentVel,
          wantToMoveVel,
          rejectVel,
          moveAccNeeded,
          maxVelLimit,
          sprintMult,
          isOnMovingObject,
          rejectVelMult,
          accDeltaTime,
          characterRotated,
          modelEuler,
          moveImpulse,
          turnVelMultiplier,
          canJump,
          airDragMultiplier,
          slopeUpExtraForce,
          slopeDownExtraForce,
          currentPos,
          moveImpulsePointY,
        };
        moveCharacter(moveCharacterProps);
      }

      const { massRatio: massRatioN, isOnMovingObject: isOnMovingObjectN } =
        rayHitMoveDetection(
          rayHit,
          canJump,
          standingForcePoint,
          rayOrigin,
          massRatio,
          characterRef.current,
          isOnMovingObject,
          distanceFromCharacterToObject,
          currentPos,
          movingObjectVelocity,
          objectAngvelToLinvel,
          velocityDiff,
          currentVel,
          movingObjectDragForce,
          bodyContactForce,
          moveImpulse,
          delta,
          forward,
          backward,
          leftward,
          rightward,
          isPointMoving
        );
      isOnMovingObject = isOnMovingObjectN;
      massRatio = massRatioN;

      // Jump impulse
      applyJumpImpulse(
        jump,
        canJump,
        jumpVelocityVec,
        characterRef.current,
        currentVel,
        run,
        sprintJumpMult,
        jumpVel,
        slopJumpMult,
        rayHit,
        standingForcePoint,
        characterMassForce,
        jumpDirection,
        actualSlopeNormalVec,
        jumpForceToGroundMult
      );

      applyFloatingForce(
        rayHit,
        canJump,
        floatingForce,
        springK,
        floatingDis,
        dampingC,
        characterRef.current,
        springDirVec,
        characterMassForce,
        standingForcePoint
      );

      applyDragForce(
        forward,
        backward,
        leftward,
        rightward,
        canJump,
        isPointMoving,
        isOnMovingObject,
        currentVel,
        dragDampingC,
        movingObjectVelocity,
        characterRef.current,
        movingObjectDragForce
      );

      isFalling = detectFallingState(
        isFalling,
        currentVel,
        canJump,
        characterRef.current,
        fallingMaxVel,
        initialGravityScale,
        fallingGravityScale
      );

      if (autoBalance && characterRef.current) {
        autoBalanceCharacter(
          characterRef.current,
          bodyFacingVec,
          bodyBalanceVec,
          bodyBalanceVecOnX,
          bodyFacingVecOnY,
          bodyBalanceVecOnZ,
          isModeCameraBased,
          slopeRayOriginRef.current,
          modelEuler,
          pivot,
          modelFacingVec,
          slopeRayOriginUpdatePosition,
          movingDirection,
          camBasedMoveCrossVecOnY,
          slopeRayOriginOffest,
          characterModelIndicator,
          crossVecOnX,
          crossVecOnY,
          crossVecOnZ,
          vectorY,
          dragAngForce,
          autoBalanceSpringK,
          autoBalanceDampingC,
          autoBalanceSpringOnY,
          autoBalanceDampingOnY
        );
      }
      if (isModePointToMove) {
        functionKeyDown = forward || backward || leftward || rightward || jump;
        const pointToMoveProps: PointToMoveProps = {
          slopeAngle,
          movingObjectVelocity,
          functionKeyDown,
          pointToPoint,
          currentPos,
          crossVector,
          vectorZ,
          modelEuler,
          isModeFixedCamera,
          pivot,
          fixedCamRotMult,
          delta,
          character: characterRef.current,
          actualSlopeAngle,
          slopeMaxAngle,
          movingDirection,
          characterModelIndicator,
          movingObjectVelocityInCharacterDir,
          currentVel,
          wantToMoveVel,
          rejectVel,
          moveAccNeeded,
          maxVelLimit,
          sprintMult,
          isOnMovingObject,
          rejectVelMult,
          accDeltaTime,
          characterRotated,
          moveImpulse,
          turnVelMultiplier,
          canJump,
          airDragMultiplier,
          slopeUpExtraForce,
          slopeDownExtraForce,
          moveImpulsePointY,
          isPointMoving,
          setMoveToPoint,
          moveToPoint,
          isBodyHitWall,
          run,
        };
        pointToMove(pointToMoveProps);
      }

      /**
       * Apply all the animations
       */

      if (animated) {
        if (
          !forward &&
          !backward &&
          !leftward &&
          !rightward &&
          !jump &&
          !isPointMoving &&
          canJump
        ) {
          idleAnimation();
        } else if (jump && canJump) {
          jumpAnimation();
        } else if (
          canJump &&
          (forward || backward || leftward || rightward || isPointMoving)
        ) {
          if (run) {
            runAnimation();
          } else {
            walkAnimation();
          }
        } else if (!canJump) {
          jumpIdleAnimation();
        }
        // On high sky, play falling animation
        if (rayHit == null && isFalling) {
          fallAnimation();
        }
      }
    });
    return (
      <RigidBody
        ccd
        softCcdPrediction={0.4}
        contactSkin={0.02}
        colliders={false}
        ref={characterRef}
        position={props.position || [0, 5, 0]}
        friction={props.friction || -0.5}
        collisionGroups={interactionGroups(CollisionWorldType.mainCharacter)}
        onContactForce={(e) =>
          bodyContactForce.set(e.totalForce.x, e.totalForce.y, e.totalForce.z)
        }
        onCollisionExit={() => bodyContactForce.set(0, 0, 0)}
        userData={{ canJump: false }}
        {...props}
      >
        <CapsuleCollider
          name="character-capsule-collider"
          args={[capsuleHalfHeight, capsuleRadius]}
        />
        {/* Body collide sensor (only for point to move mode) */}
        {isModePointToMove && (
          <CylinderCollider
            ref={bodySensorRef}
            sensor
            mass={0}
            args={[bodySensorSize[0], bodySensorSize[1]]}
            position={[
              bodySensorPosition.x,
              bodySensorPosition.y,
              bodySensorPosition.z,
            ]}
            onIntersectionEnter={handleOnIntersectionEnter}
            onIntersectionExit={handleOnIntersectionExit}
          />
        )}
        <group ref={characterModelRef} userData={{ camExcludeCollision: true }}>
          {/* This mesh is used for positioning the slope ray origin */}
          <mesh
            position={[
              rayOriginOffest.x,
              rayOriginOffest.y,
              rayOriginOffest.z + slopeRayOriginOffest,
            ]}
            ref={slopeRayOriginRef}
            visible={showSlopeRayOrigin}
            userData={{ camExcludeCollision: true }} // this won't be collide by camera ray
          >
            <boxGeometry args={[0.15, 0.15, 0.15]} />
          </mesh>
          {/* Character model */}
          {children}
        </group>
      </RigidBody>
    );
  }
);

export default ComplexController;
