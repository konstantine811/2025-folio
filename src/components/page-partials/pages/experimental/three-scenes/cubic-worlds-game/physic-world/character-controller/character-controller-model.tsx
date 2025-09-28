import { Mesh, Object3D } from "three";
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { useGameDataStore } from "./stores/game-data-store";
import { SkeletonUtils } from "three/examples/jsm/Addons.js";

type NodesMap = Record<string, Object3D>;

// Будуємо мапу вузлів за іменами з урахуванням дублікатів
function buildNodesMap(root: Object3D): NodesMap {
  const map: NodesMap = {};
  root.traverse((o) => {
    if (!o.name) return;
    let key = o.name;
    if (map[key]) {
      // якщо дубль — додамо індекс
      let i = 2;
      while (map[`${key}_${i}`]) i++;
      key = `${key}_${i}`;
    }
    map[key] = o;
  });
  return map;
}

const CharacterControllerModel = ({
  path,
  position,
  scale = 1,
}: {
  path: string;
  position?: [number, number, number];
  scale?: number;
}) => {
  // glTF з drei: nodes/materials тут від оригінальної сцени
  const { scene } = useGLTF(path);
  const charRef = useRef<Object3D>(null);

  const setCharacterNodes = useGameDataStore((s) => s.setCharacterNodes);

  // Клонуємо сцену зі збереженням скіллетів/skin
  const clone = useMemo<Object3D>(() => SkeletonUtils.clone(scene), [scene]);

  // Налаштовуємо тіні на клоні (а не на оригіналі)
  useEffect(() => {
    clone.traverse((ch) => {
      if (ch instanceof Mesh) ch.castShadow = true;
    });
  }, [clone]);

  // Створюємо nodes для КЛОНА й кладемо в стор
  const clonedNodes = useMemo(() => buildNodesMap(clone), [clone]);

  useEffect(() => {
    setCharacterNodes(clonedNodes);
  }, [clonedNodes, setCharacterNodes]);

  // (не обов’язково, але ок) — прелоад наступних звернень
  useEffect(() => {
    useGLTF.preload(path);
  }, [path]);

  return (
    <primitive object={clone} position={position} scale={scale} ref={charRef} />
  );
};

export default CharacterControllerModel;
