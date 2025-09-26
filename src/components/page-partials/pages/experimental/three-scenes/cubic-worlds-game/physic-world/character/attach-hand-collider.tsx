import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  RigidBody,
  BallCollider,
  RapierRigidBody,
  IntersectionEnterHandler,
  interactionGroups,
  RapierCollider,
} from "@react-three/rapier";
import { Quaternion, Vector3 } from "three";
import { useGameDataStore } from "../character-controller/stores/game-data-store";
import { useGameStore } from "../character-controller/stores/game-store";
import { animationSet } from "../character-controller/config/character.config";
import { CollisionWorldType } from "../../../config/collision";
import { punchSound } from "@/config/sounds";
import { useWorldStore } from "../../store/useWorldStore";

export default function AttachHandCollider({
  radius = 0.09,
  localOffset = new Vector3(0, 0, 0),
  hitOnSpeed = 1.0, // м/с: поріг «озброєння» при русі ВПЕРЕД
  hitOffSpeed = 0.3, // м/с: поріг «роззброєння» (гістерезис)
  cooldownMs = 120, // антиспам на випадок тремтіння
}) {
  const nodes = useGameDataStore((s) => s.characterNodes);
  const curAnim = useGameStore((s) => s.curAnimation);
  const isAction1 = curAnim === animationSet.action1;

  const rbRef = useRef<RapierRigidBody>(null);
  const colRef = useRef<RapierCollider>(null);

  // тимчасові вектори
  const tmpPos = useMemo(() => new Vector3(), []);
  const tmpPrev = useMemo(() => new Vector3(), []);
  const tmpQuat = useMemo(() => new Quaternion(), []);
  const tmpScale = useMemo(() => new Vector3(), []);
  const offLocal = useMemo(() => localOffset.clone(), [localOffset]);
  const offWorld = useMemo(() => new Vector3(), []);
  const velVec = useMemo(() => new Vector3(), []);
  const fwdWorld = useMemo(() => new Vector3(), []);
  const boxTakeDamage = useWorldStore((s) => s.boxTakeDamage);
  // стан «озброєності» та «перший хіт вже зроблено»
  const armedRef = useRef(false);
  const firstHitDoneRef = useRef(false);
  const lastHitTimeRef = useRef(0);

  // групи для вмик/вимик сенсора (щоб подій не було поза action1)
  const groupsOn = useMemo(
    () =>
      interactionGroups(CollisionWorldType.mainCharacter, [
        CollisionWorldType.boxes,
      ]),
    []
  );
  const groupsOff = useMemo(
    () => interactionGroups(CollisionWorldType.mainCharacter, 0),
    []
  );

  // при вході в action1 — скидаємо стан і знову робимо сенсор видимим
  useEffect(() => {
    if (!colRef.current) return;
    colRef.current.setSensor(true); // сенсор завжди true -> лише події, без фізики
    if (isAction1) {
      firstHitDoneRef.current = false;
      armedRef.current = false;
      colRef.current.setCollisionGroups(groupsOn);
    } else {
      colRef.current.setCollisionGroups(groupsOff);
    }
  }, [isAction1, groupsOn, groupsOff]);

  const handleIntersectionEnter: IntersectionEnterHandler = (e) => {
    if (!isAction1) return; // 1) лише під час action1
    if (!armedRef.current) return; // 2) лише коли рух ВПЕРЕД достатній
    const now = performance.now();
    if (now - lastHitTimeRef.current < cooldownMs) return;

    if (firstHitDoneRef.current) return; // 3) лише перший хіт у цьому замасі

    lastHitTimeRef.current = now;
    firstHitDoneRef.current = true;

    // (опційно) повністю вимикаємо сенсор до кінця замаху
    colRef.current?.setCollisionGroups(groupsOff);

    // твоя логіка: звук/ефекти/урон
    const userData = e.other?.rigidBody?.userData as {
      breakable?: boolean;
      name?: string;
    };
    punchSound.play("first");
    console.log("HIT", userData);
    if (userData && userData.breakable && userData.name) {
      boxTakeDamage(userData.name, 100);
    }
  };

  useFrame((_, dt) => {
    const hand = nodes?.Ctrl_Hand_IK_Right;
    const rb = rbRef.current;
    if (!hand || !rb) return;

    // світовий трансформ руки
    hand.updateWorldMatrix(true, false);
    hand.matrixWorld.decompose(tmpPos, tmpQuat, tmpScale);

    // локальний офсет → світ
    offWorld.copy(offLocal).applyQuaternion(tmpQuat);
    const curr = tmpPos.clone().add(offWorld);

    // швидкість руки
    velVec.copy(curr).sub(tmpPrev);
    if (dt > 0) velVec.multiplyScalar(1 / dt);

    // проєкція швидкості на «forward» руки (вважаємо -Z локально — напрямок удару)
    fwdWorld.set(1, 0, 1).applyQuaternion(tmpQuat).normalize();
    const forwardSpeed = velVec.dot(fwdWorld); // >0 — рух вперед, <0 — назад

    // гістерезис озброєння
    if (!armedRef.current) {
      if (forwardSpeed > hitOnSpeed) armedRef.current = true;
    } else {
      if (forwardSpeed < hitOffSpeed) armedRef.current = false;
    }

    // оновлення поза сенсора (кінематично)
    rb.setNextKinematicTranslation({ x: curr.x, y: curr.y, z: curr.z });
    rb.setNextKinematicRotation({
      x: tmpQuat.x,
      y: tmpQuat.y,
      z: tmpQuat.z,
      w: tmpQuat.w,
    });

    tmpPrev.copy(curr);
  });

  return (
    <RigidBody
      ref={rbRef}
      type="kinematicPosition"
      colliders={false}
      gravityScale={0}
      collisionGroups={interactionGroups(
        CollisionWorldType.characterHandCollider
      )} // за замовчуванням вимкн </>
      ccd
    >
      <BallCollider
        ref={colRef}
        args={[radius]}
        position={[0, 0.06, 0]}
        sensor
        onIntersectionEnter={handleIntersectionEnter}
      />
    </RigidBody>
  );
}
