import { useMemo } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import {
  atan,
  clamp,
  color as tslColor,
  cos,
  float,
  Fn,
  positionGeometry,
  sign,
  sin,
  texture,
  uv,
  varying,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import type { WheelContactHistoryEntry } from "./wheel-contact-history";
import { WHEEL_CONTACT_HISTORY_SIZE } from "./wheel-contact-history";

const TRACK_HALF_WIDTH = 0.18;
const TRACK_Y_OFFSET = 0.035;
const HIDDEN_Y = -10000;

const WHEEL_TRACK_COLORS = [
  "#e8a0c4",
  "#d48bb8",
  "#a6dce8",
  "#8fd4e8",
] as const;

function createTrailGeometry() {
  const geometry = new THREE.PlaneGeometry(1, 1, WHEEL_CONTACT_HISTORY_SIZE, 1);
  geometry.translate(0.5, 0, 0);
  return geometry;
}

function WheelContactTrailMaterial({
  entry,
  color,
}: {
  entry: WheelContactHistoryEntry;
  color: string;
}) {
  const nodes = useMemo(() => {
    const trailData = varying(vec4(0));
    const pixelSize = float(1).div(WHEEL_CONTACT_HISTORY_SIZE);
    const halfPixel = pixelSize.mul(0.5);
    const maxPixelCenter = float(1).sub(halfPixel);
    const sideSign = sign(positionGeometry.y).mul(-1);

    const positionNode = Fn(() => {
      const sampleU = clamp(uv().x.sub(halfPixel), halfPixel, maxPixelCenter);
      const previousU = clamp(
        sampleU.add(pixelSize),
        halfPixel,
        maxPixelCenter,
      );
      const current = texture(entry.texture, vec2(sampleU, 0.5));
      const previous = texture(entry.texture, vec2(previousU, 0.5));
      const angle = atan(current.z.sub(previous.z), current.x.sub(previous.x));
      const perpendicularAngle = angle.add(sideSign.mul(Math.PI * 0.5));
      const sideOffset = vec2(
        cos(perpendicularAngle),
        sin(perpendicularAngle),
      ).mul(TRACK_HALF_WIDTH);
      const worldPosition = vec3(
        current.x.add(sideOffset.x),
        current.y.add(TRACK_Y_OFFSET),
        current.z.add(sideOffset.y),
      );
      const hiddenPosition = vec3(current.x, HIDDEN_Y, current.z);

      trailData.assign(current);

      return current.w
        .greaterThan(float(0.5))
        .select(worldPosition, hiddenPosition);
    })();

    return {
      colorNode: tslColor(new THREE.Color(color)),
      opacityNode: trailData.w,
      positionNode,
    };
  }, [color, entry]);

  return (
    <meshBasicNodeMaterial
      {...nodes}
      transparent
      alphaTest={0.5}
      side={THREE.DoubleSide}
      depthTest={false}
      depthWrite={false}
      toneMapped={false}
      wireframe={true}
    />
  );
}

function WheelContactTrail({
  entry,
  index,
}: {
  entry: WheelContactHistoryEntry;
  index: number;
}) {
  const geometry = useMemo(() => createTrailGeometry(), []);
  const color = WHEEL_TRACK_COLORS[index] ?? "#ffffff";

  return (
    <mesh geometry={geometry} frustumCulled={false} renderOrder={900 + index}>
      <WheelContactTrailMaterial entry={entry} color={color} />
    </mesh>
  );
}

type WheelContactHistoryDebugRackProps = {
  historiesRef: RefObject<WheelContactHistoryEntry[]>;
};

export function WheelContactHistoryDebugRack({
  historiesRef,
}: WheelContactHistoryDebugRackProps) {
  return (
    <>
      {historiesRef.current.map((entry, index) => (
        <WheelContactTrail key={index} entry={entry} index={index} />
      ))}
    </>
  );
}
