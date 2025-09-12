import { useFrame, useThree } from "@react-three/fiber";
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  Object3D,
  Object3DEventMap,
  Quaternion,
  Vector3,
} from "three";
import { useEditModeStore } from "../../../../store/useEditModeStore";
import { Key } from "@/config/key";

type Props = {
  selected: number | null;
  meshRef: RefObject<InstancedMesh>;
  editDummy: Object3D<Object3DEventMap>;
  // новий колбек — сюди віддаємо оновлену матрицю конкретного індексу
  onMatrixChange?: (index: number, next: Matrix4) => void;
  updateOutline: (idx: number | null) => void;
};

const lift = 0.01;

const EditKeyModelInstance = ({
  selected,
  meshRef,
  editDummy,
  onMatrixChange,
  updateOutline,
}: Props) => {
  const { camera, pointer, raycaster } = useThree();
  const [grabbing, setGrabbing] = useState(false);
  const savedBeforeGrab = useRef<Matrix4 | null>(null);
  const targets = useEditModeStore((s) => s.targets);
  const previewRef = useRef<Object3D>(null!);
  const painterMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        color: 0xff0055,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }),
    []
  );
  // --- Scale mode (S)
  const [scaling, setScaling] = useState(false);
  const scaleStartDist = useRef(0); // стартова відстань курсора від центру (в NDC)
  const scaleStart = useRef(new Vector3(1, 1, 1)); // початковий scale інстанса на момент старту
  const scaleMin = 0.1; // clamp
  const scaleMax = 50.0; // clamp
  const scaleSensitivity = 1.5; // чутливість (множник)

  // --- Rotate mode (R)
  const [rotating, setRotating] = useState(false);
  const rotateStartPointer = useRef({ x: 0, y: 0 });
  const rotateStartQuat = useRef(new Quaternion()); // початковий поворот (твіст буде навколо upWorld)
  const savedBeforeRotate = useRef<Matrix4 | null>(null); // для ESC-відкату
  const rotSensitivity = Math.PI * 2; // 1.0 NDC по X = 2π рад (підкрути за смаком)
  const localUpAxis = useMemo(() => new Vector3(0, 1, 0), []); // якщо твоя трава Z-up, тут (0,0,1)

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.code;
      // ==== SCALE (S) ====
      if (key === Key.S && selected !== null) {
        if (!scaling) {
          savedBeforeGrab.current = editDummy.matrix.clone();
          // фіксуємо стартовий масштаб і стартову відстань курсора
          meshRef.current.getMatrixAt(selected, editDummy.matrix);
          editDummy.matrix.decompose(
            editDummy.position,
            editDummy.quaternion,
            editDummy.scale
          );
          scaleStart.current.copy(editDummy.scale);
          scaleStartDist.current = Math.hypot(pointer.x, pointer.y); // 0..~1.4
          setGrabbing(false);
          setRotating(false);
          setScaling(true);
        } else {
          // підтвердження скейлу
          setScaling(false);
        }
        return;
      }

      // ==== ROTATE (R) ====
      if (key === Key.R && selected !== null && !rotating) {
        // збережемо матрицю для відкату
        meshRef.current.getMatrixAt(selected, editDummy.matrix);
        savedBeforeRotate.current = editDummy.matrix.clone();

        // зафіксуємо стартову орієнтацію (кватерніон інстанса)
        editDummy.matrix.decompose(
          editDummy.position,
          editDummy.quaternion,
          editDummy.scale
        );
        rotateStartQuat.current.copy(editDummy.quaternion);

        // стартова позиція курсора в NDC
        rotateStartPointer.current.x = pointer.x;
        rotateStartPointer.current.y = pointer.y;
        setGrabbing(false);
        setScaling(false);
        setRotating(true);
        return;
      }

      // ESC: скасувати активний режим (спершу scale, потім grab)
      if (key === Key.ESC && selected !== null) {
        setGrabbing(false);
        setRotating(false);
        setScaling(false);
        setTimeout(() => {
          if (savedBeforeGrab && savedBeforeGrab.current) {
            meshRef.current.setMatrixAt(selected, savedBeforeGrab.current);
            meshRef.current.instanceMatrix.needsUpdate = true;
            updateOutline(selected);
            onMatrixChange?.(selected, editDummy.matrix.clone());
          }
        }, 100);
        return;
      }

      // ==== GRAB (G) ==== (як було)
      if (key === Key.G && selected !== null) {
        if (!grabbing) {
          meshRef.current.getMatrixAt(selected, editDummy.matrix);
          savedBeforeGrab.current = editDummy.matrix.clone();
          setRotating(false);
          setScaling(false);
          setGrabbing(true);
        } else {
          setGrabbing(false);
          savedBeforeGrab.current = null;
        }
        return;
      }

      if ((key === "enter" || key === " ") && grabbing) {
        setGrabbing(false);
        setRotating(false);
        setScaling(false);
        savedBeforeGrab.current = null;
      }
    },
    [
      selected,
      grabbing,
      scaling,
      pointer,
      editDummy,
      onMatrixChange,
      updateOutline,
      savedBeforeRotate,
      rotateStartQuat,
      rotateStartPointer,
      rotating,
      setRotating,
      meshRef,
    ]
  );

  const onResetHundle = useCallback(() => {
    setGrabbing(false);
    setRotating(false);
    setScaling(false);
    savedBeforeGrab.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown, { passive: true });
    window.addEventListener("mousedown", onResetHundle, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onResetHundle);
    };
  }, [onKeyDown, onResetHundle]);

  useEffect(() => {
    onResetHundle();
  }, [selected, onResetHundle]);

  useFrame((_, dt) => {
    // ==== ROTATE MODE ====
    if (rotating && selected !== null) {
      // кут відносно зсуву курсора по X від старту (NDC): [-1..1]
      const dx = pointer.x - rotateStartPointer.current.x;
      const angle = dx * rotSensitivity; // рад

      // дістаємо поточну матрицю, позицію та масштаб збережемо
      meshRef.current.getMatrixAt(selected, editDummy.matrix);
      editDummy.matrix.decompose(
        editDummy.position,
        editDummy.quaternion,
        editDummy.scale
      );

      // вісь обертання = upWorld (локальна вісь вгору в світовій системі)
      const upWorld = localUpAxis
        .clone()
        .applyQuaternion(rotateStartQuat.current)
        .normalize();

      // твіст навколо нормалі
      const qTwist = new Quaternion().setFromAxisAngle(upWorld, angle);

      // новий поворот = twist ∘ початковий
      const qNew = qTwist.multiply(rotateStartQuat.current);
      editDummy.matrix.compose(editDummy.position, qNew, editDummy.scale);

      meshRef.current.setMatrixAt(selected, editDummy.matrix);
      previewRef.current.setRotationFromQuaternion(qNew);
      meshRef.current.instanceMatrix.needsUpdate = true;
      updateOutline(selected);
      onMatrixChange?.(selected, editDummy.matrix.clone());
    }
    // ==== SCALE MODE ====
    if (scaling && selected !== null) {
      // 1) коефіцієнт відносно старту: >1 далі від центру, <1 ближче
      const dist = Math.hypot(pointer.x, pointer.y); // 0..~1.4
      // стабільний мультиплікатор: ratio^sensitivity
      const ratio = dist / Math.max(1e-6, scaleStartDist.current);
      const k = Math.pow(ratio, scaleSensitivity);

      // 2) читаємо матрицю, міняємо ТІЛЬКИ scale
      meshRef.current.getMatrixAt(selected, editDummy.matrix);
      editDummy.matrix.decompose(
        editDummy.position,
        editDummy.quaternion,
        editDummy.scale
      );

      // рівномірний масштаб (якщо треба неізотропний — розведи по осях)
      const next = scaleStart.current.clone().multiplyScalar(k);
      // clamp
      next.x = Math.min(scaleMax, Math.max(scaleMin, next.x));
      next.y = Math.min(scaleMax, Math.max(scaleMin, next.y));
      next.z = Math.min(scaleMax, Math.max(scaleMin, next.z));

      editDummy.scale.copy(next);
      editDummy.matrix.compose(
        editDummy.position,
        editDummy.quaternion,
        editDummy.scale
      );
      meshRef.current.setMatrixAt(selected, editDummy.matrix);
      meshRef.current.instanceMatrix.needsUpdate = true;

      updateOutline(selected);
      onMatrixChange?.(selected, editDummy.matrix.clone());

      // (опційно) масштабуй превʼю-радіус пропорційно XZ
      const r = Math.max(editDummy.scale.x, editDummy.scale.z) / 5;
      if (previewRef.current) {
        previewRef.current.scale.set(r, r, r);
      }
    }

    // GRABBING

    if (grabbing && previewRef.current && selected !== null) {
      raycaster.setFromCamera(pointer, camera);
      const list = Array.isArray(targets) ? targets : [targets];
      const hit = raycaster.intersectObjects(list, true)[0];
      if (!hit) return;

      const normal = hit.face
        ? hit.face.normal
            .clone()
            .transformDirection(hit.object.matrixWorld)
            .normalize()
        : new Vector3(0, 1, 0);

      const target = hit.point.clone().add(normal.clone().multiplyScalar(lift));

      // варіант А: мʼяке згладжування
      const alpha = 1 - Math.pow(0.0001, dt); // ~експоненційне згладжування
      previewRef.current.position.lerp(target, alpha);

      meshRef.current.getMatrixAt(selected, editDummy.matrix);
      editDummy.matrix.decompose(
        editDummy.position,
        editDummy.quaternion,
        editDummy.scale
      );

      const q = new Quaternion().setFromUnitVectors(
        new Vector3(0, 0, 1),
        normal
      );
      previewRef.current.quaternion.slerp(q, alpha);
      // 🔵 радіус превʼю відносно радіуса інстанса
      const r = Math.max(editDummy.scale.x, editDummy.scale.z) / 5;
      previewRef.current.scale.set(r, r, r);

      // 2) позиція — як і було
      editDummy.position.copy(target).add(normal.clone().multiplyScalar(lift));

      // 3) SWING: вирівняти "вгору" моделі під нормаль, ЗБЕРІГШИ ТВІСТ
      // локальна "вісь-вгору" твоєї моделі (поміняй на (0,1,0), якщо трава Y-up)
      const localUp = new Vector3(0, 1, 0);

      // "вгору" у світових координатах з урахуванням поточного повороту інстанса
      const upWorld = localUp
        .clone()
        .applyQuaternion(editDummy.quaternion)
        .normalize();
      const n = normal.clone().normalize();

      // надійний qAlign з обробкою майже протилежних векторів
      const qAlign = new Quaternion();
      const dot = upWorld.dot(n);
      if (dot < -0.9999) {
        // розворот на PI навколо осі ⟂ upWorld
        const ortho =
          Math.abs(upWorld.x) < 0.9
            ? new Vector3(1, 0, 0)
            : new Vector3(0, 1, 0);
        const axis = ortho.clone().cross(upWorld).normalize();
        qAlign.setFromAxisAngle(axis, Math.PI);
      } else if (dot > 0.9999) {
        qAlign.identity(); // вже співпадає
      } else {
        qAlign.setFromUnitVectors(upWorld, n);
      }

      // бажаний поворот: ЗАЛИШАЄ ТВІСТ
      const desired = qAlign.multiply(editDummy.quaternion);

      // (опціонально) мʼяко підвести поточний _q до desired:
      editDummy.quaternion.slerp(desired, alpha);

      // 4) зібрати назад
      editDummy.matrix.compose(
        editDummy.position,
        editDummy.quaternion,
        editDummy.scale
      );
      meshRef.current.setMatrixAt(selected, editDummy.matrix);
      meshRef.current.instanceMatrix.needsUpdate = true;

      updateOutline(selected);
      onMatrixChange?.(selected, editDummy.matrix.clone());
    }
  });

  return (
    <>
      {(grabbing || scaling || rotating) && (
        <group
          ref={previewRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={editDummy.position}
        >
          <mesh material={painterMaterial}>
            {rotating ? (
              <boxGeometry args={[0.5, 0.5, 0.5]} />
            ) : (
              <circleGeometry args={[1, 32]} />
            )}
          </mesh>
        </group>
      )}
    </>
  );
};

export default EditKeyModelInstance;
