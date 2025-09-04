// GrassPainter.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GrassTile } from "./3d-grass";

type TileKey = string;
type TileRec = {
  x: number; // tileX
  z: number; // tileZ
  seed: number;
  density: number;
};

type GrassPainterProps = {
  /** GLTF із лезом/пучком */
  modelUrl: string;
  meshName?: string;

  /** параметри тайлів */
  tileSize?: number; // розмір тайла у метрах
  baseDensity?: number; // лез/м^2 для тайлів за замовчанням
  yAt?: (x: number, z: number) => number; // висота рельєфу

  /** кисть */
  initialRadiusTiles?: number; // радіус у тайлах
  fixedSeed?: number | null; // якщо null — seed рандомиться на кожен тайл
  materialProps?: Partial<JSX.IntrinsicElements["grassGradientMaterial"]>;
};

function key(x: number, z: number): TileKey {
  return `${x}_${z}`;
}
function worldToTile(x: number, z: number, tileSize: number) {
  return {
    tx: Math.floor(x / tileSize),
    tz: Math.floor(z / tileSize),
  };
}

export function GrassPainter({
  modelUrl,
  meshName,
  tileSize = 6,
  baseDensity = 18,
  yAt,
  initialRadiusTiles = 2,
  fixedSeed = null,
  materialProps,
}: GrassPainterProps) {
  const { camera } = useThree();

  // --- стан кисті/малюнка ---
  const [radius, setRadius] = useState(initialRadiusTiles);
  const [tiles, setTiles] = useState<Map<TileKey, TileRec>>(() => new Map());
  const [isPainting, setIsPainting] = useState(false);
  const [eraseMode, setEraseMode] = useState(false);
  const [cursor, setCursor] = useState<THREE.Vector3 | null>(null);

  // площина для хіт-тесту (величезна)
  const planeRef = useRef<THREE.Mesh>(null);

  // допомога для seed
  const rnd = useRef((Math.random() * 1e9) | 0);

  // --- керування з клавіатури ---
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "[" || e.key === "{") setRadius((r) => Math.max(1, r - 1));
      if (e.key === "]" || e.key === "}") setRadius((r) => Math.min(20, r + 1));
      if (e.key.toLowerCase() === "r") rnd.current = (Math.random() * 1e9) | 0;
      if (e.key === "Alt") setEraseMode(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") setEraseMode(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  // --- малювання/стирка в точці ---
  const paintAt = (x: number, z: number) => {
    setTiles((prev) => {
      const next = new Map(prev);
      const { tx, tz } = worldToTile(x, z, tileSize);
      for (let dz = -radius; dz <= radius; dz++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const gx = tx + dx;
          const gz = tz + dz;
          // кругла кисть
          if (dx * dx + dz * dz > radius * radius) continue;
          const k = key(gx, gz);
          if (eraseMode) {
            if (next.has(k)) next.delete(k);
          } else {
            if (!next.has(k)) {
              const seed =
                fixedSeed ?? // якщо фіксований — один і той самий
                ((gx * 73856093) ^ (gz * 19349663) ^ rnd.current) >>> 0;
              next.set(k, {
                x: gx,
                z: gz,
                seed,
                density: baseDensity,
              });
            }
          }
        }
      }
      return next;
    });
  };

  // --- pointer events ---
  const onPointerMove = (e: any) => {
    e.stopPropagation();
    if (!planeRef.current) return;
    const p = e.point as THREE.Vector3;
    setCursor(p.clone());
    if (isPainting) paintAt(p.x, p.z);
  };
  const onPointerDown = (e: any) => {
    e.stopPropagation();
    setIsPainting(true);
    paintAt(e.point.x, e.point.z);
  };
  const onPointerUp = (e: any) => {
    e.stopPropagation();
    setIsPainting(false);
  };
  // ПКМ теж стирає
  useEffect(() => {
    const onContext = (ev: MouseEvent) => {
      // щоб ПКМ не відкривав контекстне меню
      ev.preventDefault();
      setEraseMode(true);
      setIsPainting(true);
      // знімемо через кадр
      requestAnimationFrame(() => {
        setIsPainting(false);
        setEraseMode(false);
      });
    };
    window.addEventListener("contextmenu", onContext);
    return () => window.removeEventListener("contextmenu", onContext);
  }, []);

  // gizmo кола кисті
  const brushRing = useMemo(() => {
    const g = new THREE.RingGeometry(
      radius * tileSize - 0.02,
      radius * tileSize + 0.02,
      64
    );
    const m = new THREE.MeshBasicMaterial({
      color: eraseMode ? 0xff5555 : 0x55ff88,
      transparent: true,
      opacity: 0.9,
      depthTest: false,
    });
    return new THREE.Mesh(g, m);
  }, [radius, tileSize, eraseMode]);

  // зручні хелпери
  const clearAll = () => setTiles(new Map());
  const randomizeSeeds = () =>
    setTiles((prev) => {
      const next = new Map(prev);
      const bump = (Math.random() * 1e9) | 0;
      for (const v of next.values()) v.seed ^= bump;
      return next;
    });

  // ---- РЕНДЕР ----
  return (
    <group>
      {/* площина для малювання (невидима) */}
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <planeGeometry args={[5000, 5000]} />
        <meshBasicMaterial transparent opacity={0.0} />
      </mesh>

      {/* gizmo кисті */}
      {cursor && (
        <primitive
          object={brushRing}
          position={[
            cursor.x,
            (yAt?.(cursor.x, cursor.z) ?? 0) + 0.02,
            cursor.z,
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      )}

      {/* намальовані тайли */}
      {Array.from(tiles.values()).map(({ x, z, seed, density }) => (
        <GrassTile
          key={key(x, z)}
          tileX={x}
          tileZ={z}
          tileSize={tileSize}
          // count = density * м^2
          count={Math.max(1, Math.floor(tileSize * tileSize * density))}
          seed={seed}
          modelUrl={modelUrl}
          meshName={meshName}
          yAt={yAt}
          materialProps={{
            _fallbackEdgeWidth: 10.5, // 0..0.5
            _fallbackEdgeDark: 2.01, // мін. яскравість краю
            uWindAmp: 0.2,
            uWindFreq: 1.2,
            uWindDir: new THREE.Vector2(10.85, 10.2).normalize(),
            windDirNoiseScale: 1.05, // масштаб шуму напряму
            windStrNoiseScale: 1.25, // масштаб шуму сили
            gustStrength: 1.25, // поривчастість (shape)
            noiseScrollDir: 1.05, // “дрейф” карти вітру
          }}
        />
      ))}

      {/* невеликий дев-хелп поверх сцени (опційно) */}
      {/* <Html center>{`Tiles: ${tiles.size}  Radius: ${radius}`}</Html> */}
    </group>
  );
}
