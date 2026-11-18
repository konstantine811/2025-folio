import { useFrame } from "@react-three/fiber";
import { RefObject, useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending, CanvasTexture, Color, DoubleSide, Group, LineBasicMaterial,
  MeshBasicMaterial, MeshStandardMaterial, SRGBColorSpace, Vector3,
} from "three";
import { usePauseStore } from "@/components/common/game-controller/store/usePauseMode";
import { usePlayerPositionStore } from "../../../character-controller/physics-world/usePlayerPositionStore";
import { getSciFiControllerSpawnFromScroll } from "../character/sci-fi.config";
import { isSkillStationNearby, skillStations } from "./skill-stations.config";
import { SkillSymbol } from "./skill-symbol";

type Station = typeof skillStations[number];

function createLabel(station: Station) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Hologram labels require a 2D canvas");
  ctx.fillStyle = "rgba(4, 13, 26, 0.72)";
  ctx.fillRect(0, 0, 512, 256);
  ctx.strokeStyle = station.color;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(18, 230); ctx.lineTo(8, 230); ctx.lineTo(8, 16); ctx.lineTo(40, 16); ctx.stroke();
  ctx.fillStyle = "#d8edff";
  ctx.font = "600 26px monospace";
  ctx.fillText(`${station.id}  ${station.title}`, 30, 52);
  ctx.fillStyle = station.color;
  ctx.font = "21px monospace";
  station.skills.forEach((skill, i) => ctx.fillText(skill, 30, 103 + i * 35));
  ctx.fillStyle = "#87bfc9";
  ctx.font = "14px monospace";
  ctx.fillText("●  SKILL MODULE / ONLINE", 30, 228);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function SkillStation({ station, actor, enabled, baseMaterial }: {
  station: Station;
  actor: RefObject<Vector3>;
  enabled: boolean;
  baseMaterial: MeshStandardMaterial;
}) {
  const visual = useRef<Group>(null);
  const symbol = useRef<Group>(null);
  const label = useRef<Group>(null);
  const activation = useRef(0);
  const nearby = useRef(false);
  const resources = useMemo(() => {
    const color = new Color(station.color).multiplyScalar(1.6);
    const texture = createLabel(station);
    const common = { color, transparent: true, depthWrite: false, toneMapped: false, blending: AdditiveBlending };
    return {
      texture,
      wire: new MeshBasicMaterial({ ...common, wireframe: true, side: DoubleSide, opacity: 0 }),
      line: new LineBasicMaterial({ ...common, opacity: 0 }),
      rim: new MeshBasicMaterial({ ...common, opacity: 0.12, side: DoubleSide }),
      text: new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: DoubleSide, opacity: 0 }),
    };
  }, [station]);
  useEffect(() => () => {
    resources.texture.dispose(); resources.wire.dispose(); resources.line.dispose(); resources.rim.dispose(); resources.text.dispose();
  }, [resources]);

  useFrame((_, delta) => {
    const dx = actor.current.x - station.position[0];
    const dz = actor.current.z - station.position[2];
    nearby.current = enabled && isSkillStationNearby(dx * dx + dz * dz, nearby.current);
    activation.current += ((nearby.current ? 1 : 0) - activation.current) * (1 - Math.exp(-Math.min(delta, 0.1) * 5));
    const amount = activation.current;
    resources.wire.opacity = amount * 0.62;
    resources.line.opacity = amount * 0.8;
    resources.rim.opacity = 0.12 + amount * 0.68;
    resources.text.opacity = amount;
    if (visual.current) {
      visual.current.visible = amount > 0.01;
      visual.current.scale.y = Math.max(0.01, amount);
    }
    if (label.current) label.current.visible = amount > 0.01;
    if (symbol.current && amount > 0.01) symbol.current.rotation.y += Math.min(delta, 0.1) * 0.18 * amount;
  });

  return (
    <group position={station.position} userData={{ camExcludeCollision: true }}>
      <mesh material={baseMaterial} position={[0, 0.1, 0]}><cylinderGeometry args={[0.92, 1.02, 0.2, 24]} /></mesh>
      <mesh material={baseMaterial} position={[0, 0.24, 0]}><cylinderGeometry args={[0.77, 0.87, 0.1, 24]} /></mesh>
      <mesh material={resources.rim} position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.66, 0.72, 40]} /></mesh>
      <group ref={visual} position={[0, 0.36, 0]} visible={false}>
        <mesh material={resources.rim} position={[0, 0.1, 0]}><cylinderGeometry args={[0.45, 0.65, 0.2, 16, 1, true]} /></mesh>
        <group ref={symbol} position={[0, 1.15, 0]}>
          <SkillSymbol kind={station.kind} material={resources.wire} lineMaterial={resources.line} />
        </group>
      </group>
      <group ref={label} position={[0, 2.85, 0]} visible={false}>
        <mesh material={resources.text}><planeGeometry args={[2.1, 1.05]} /></mesh>
      </group>
    </group>
  );
}

/** No colliders, lights, extra render passes, or per-frame React state updates. */
export function SkillHolograms({ scrollProgressRef, enabled }: { scrollProgressRef: RefObject<number>; enabled: boolean }) {
  const actor = useRef(new Vector3(0, 0, 13.821));
  const baseMaterial = useMemo(() => new MeshStandardMaterial({ color: "#141c2b", metalness: 0.7, roughness: 0.4 }), []);
  useEffect(() => () => baseMaterial.dispose(), [baseMaterial]);
  useFrame(() => {
    const player = usePlayerPositionStore.getState().position;
    if (!usePauseStore.getState().isPaused && player) actor.current.set(player.x, player.y, player.z);
    else {
      const [x, y, z] = getSciFiControllerSpawnFromScroll(scrollProgressRef.current ?? 0);
      actor.current.set(x, y, z);
    }
  }, -0.5);
  return <>{skillStations.map((station) => <SkillStation key={station.id} station={station} actor={actor} enabled={enabled} baseMaterial={baseMaterial} />)}</>;
}
