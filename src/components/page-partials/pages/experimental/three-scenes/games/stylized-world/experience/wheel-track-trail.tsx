/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useMemo } from "react";
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
import { TRACK_SIMPLE_MODE } from "./track-simple-mode";

export const TRACK_HALF_WIDTH = 0.09;
export const TRACK_Y_OFFSET = 0.035;
const HIDDEN_Y = -10000;

const WHEEL_TRACK_COLORS = [
  "#e8a0c4",
  "#d48bb8",
  "#a6dce8",
  "#8fd4e8",
] as const;

export function createTrailGeometry() {
  const geometry = new THREE.PlaneGeometry(1, 1, WHEEL_CONTACT_HISTORY_SIZE, 1);
  geometry.translate(0.5, 0, 0);
  return geometry;
}

type WheelTrackTrailMaterialProps = {
  entry: WheelContactHistoryEntry;
  color: string;
  variant: "debug" | "groundData";
};

function WheelTrackTrailMaterial({
  entry,
  color,
  variant,
}: WheelTrackTrailMaterialProps) {
  const nodes = useMemo(() => {
    const trailData = varying(vec4(0));
    const pixelSize = float(1).div(WHEEL_CONTACT_HISTORY_SIZE);
    const halfPixel = pixelSize.mul(0.5);
    const maxPixelCenter = float(1).sub(halfPixel);
    const sideSign = sign(positionGeometry.y).mul(-1);
    const isGroundData = variant === "groundData";

    const tangentStep = TRACK_SIMPLE_MODE.groundDataTrailRender && isGroundData
      ? float(4)
      : float(1);

    const positionNode = Fn(() => {
      const sampleU = clamp(uv().x.sub(halfPixel), halfPixel, maxPixelCenter);
      const previousU = clamp(
        sampleU.add(pixelSize.mul(tangentStep)),
        halfPixel,
        maxPixelCenter,
      );
      const current = texture(entry.texture, vec2(sampleU, 0.5));
      const previous = texture(entry.texture, vec2(previousU, 0.5));
      const tangentX = current.x.sub(previous.x);
      const tangentZ = current.z.sub(previous.z);
      const angle = atan(tangentZ, tangentX);
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
        .greaterThan(float(0.02))
        .select(worldPosition, hiddenPosition);
    })();

    const opacityNode = Fn(() => {
      const contactAlpha = trailData.w;

      if (isGroundData) {
        return contactAlpha;
      }

      if (TRACK_SIMPLE_MODE.debugOpacityMinimal) {
        return contactAlpha;
      }

      const trailEndFade = uv()
        .x.oneMinus()
        .remapClamp(float(0), float(0.18), float(0), float(1));

      return contactAlpha.mul(trailEndFade);
    })();

    const colorNode = isGroundData
      ? Fn(() => vec3(float(1), float(1), float(1)))()
      : tslColor(new THREE.Color(color));

    return {
      colorNode,
      opacityNode,
      positionNode,
    };
  }, [color, entry, variant]);

  const isGroundData = variant === "groundData";

  return (
    <meshBasicNodeMaterial
      {...nodes}
      transparent
      alphaTest={isGroundData ? 0.01 : 0.5}
      side={THREE.DoubleSide}
      depthTest={false}
      depthWrite={false}
      toneMapped={false}
      wireframe={variant === "debug"}
    />
  );
}

type WheelTrackTrailProps = {
  entry: WheelContactHistoryEntry;
  index: number;
  variant?: "debug" | "groundData";
};

export function WheelTrackTrail({
  entry,
  index,
  variant = "debug",
}: WheelTrackTrailProps) {
  const geometry = useMemo(() => createTrailGeometry(), []);
  const color = WHEEL_TRACK_COLORS[index] ?? "#ffffff";

  return (
    <mesh
      geometry={geometry}
      frustumCulled={false}
      renderOrder={variant === "groundData" ? 1 : 900 + index}
    >
      <WheelTrackTrailMaterial entry={entry} color={color} variant={variant} />
    </mesh>
  );
}
