import { useEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { useScrollStore } from "../store/useScrollStore";
import { CameraControlsImpl } from "@react-three/drei";

type Props = {
  scrolledControl: boolean;
  isGameStarted: boolean;
  cameraControlRef: React.RefObject<CameraControlsImpl | null>;
  curveLine: Vector3[];
  curveLineLookAt: Vector3[];
};

const useScrollFlyCamera = ({
  scrolledControl,
  isGameStarted,
  cameraControlRef,
  curveLine,
  curveLineLookAt,
}: Props) => {
  // ❌ НЕ читаємо progress через хук (щоб не ререндерити компонент)
  // const scrollProgress = useScrollStore((s) => s.progress);

  const progressRef = useRef(0);
  // первинне значення
  useEffect(() => {
    progressRef.current = useScrollStore.getState().progress;
    const unsub = useScrollStore.subscribe((s) => {
      progressRef.current = s.progress;
    });
    return unsub;
  }, []);

  const pos = useMemo(() => new Vector3(), []);
  const look = useMemo(() => new Vector3(), []);

  const curve = useMemo(
    () => new CatmullRomCurve3(curveLine, false, "catmullrom", 0.5),
    [curveLine]
  );
  const curveLookAt = useMemo(
    () => new CatmullRomCurve3(curveLineLookAt, false, "catmullrom", 0.5),
    [curveLineLookAt]
  );

  // (Опційно) теж перевести ці прапорці у ref, якщо вони часто змінюються
  const scrolledRef = useRef(scrolledControl);
  const startedRef = useRef(isGameStarted);
  useEffect(() => {
    scrolledRef.current = scrolledControl;
  }, [scrolledControl]);
  useEffect(() => {
    startedRef.current = isGameStarted;
  }, [isGameStarted]);

  useFrame(() => {
    if (!scrolledRef.current) return;
    if (!startedRef.current && cameraControlRef.current) {
      const p = progressRef.current; // свіже значення без ререндерів
      const controls = cameraControlRef.current;
      curve.getPoint(p, pos);
      curveLookAt.getPoint(p, look);
      controls.setPosition(pos.x, pos.y, pos.z, true);
      controls.setLookAt(pos.x, pos.y, pos.z, look.x, look.y, look.z, true);
    }
  });
};

export default useScrollFlyCamera;
