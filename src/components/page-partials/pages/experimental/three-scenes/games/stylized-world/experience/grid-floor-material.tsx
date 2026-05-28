import { useMemo } from "react";
import * as THREE from "three";
import {
  abs,
  color as tslColor,
  float,
  fract,
  max,
  min,
  mix,
  positionWorld,
  step,
  sub,
  uniform,
  vec2,
} from "three/tsl";

export type GridFloorShaderParams = {
  /** Major grid cell size in meters (column boundaries). */
  tileSize: number;
  /** Small crosses per column edge (~12 in reference image). */
  crossesPerTile?: number;
  /** X stroke half-width in meters. */
  crossStrokeMeters?: number;
  /** X arm reach from center in meters (along diagonal). */
  crossReachMeters?: number;
  baseColor?: string;
  crossColor?: string;
  lineColor?: string;
  /** Tile border line half-width in tile UV space (0–0.5). */
  lineHalf?: number;
  /** Transparent overlay on terrain (grid lines only). */
  overlay?: boolean;
};

export function createGridFloorShaderNodes({
  tileSize,
  crossesPerTile = 12,
  crossStrokeMeters = 0.014,
  crossReachMeters = 0.2,
  baseColor = "#4a5d4a",
  crossColor = "#b898ff",
  lineColor = "#e8ecf4",
  lineHalf = 0.008,
  overlay = false,
}: GridFloorShaderParams) {
  const uTileSize = uniform(tileSize);
  const uCrossesPerTile = uniform(crossesPerTile);
  const uSubCellSize = uTileSize.div(uCrossesPerTile);
  const uCrossStroke = uniform(crossStrokeMeters).div(uSubCellSize);
  const uCrossReach = uniform(crossReachMeters).div(uSubCellSize);
  const uLineHalf = uniform(lineHalf);
  const uBase = tslColor(new THREE.Color(baseColor));
  const uCross = tslColor(new THREE.Color(crossColor));
  const uLine = tslColor(new THREE.Color(lineColor));

  const worldXZ = vec2(positionWorld.x, positionWorld.z);

  // Major column grid — lines only on tile borders.
  const tileCell = fract(worldXZ.div(uTileSize));
  const tileEdge = min(
    min(tileCell.x, sub(float(1), tileCell.x)),
    min(tileCell.y, sub(float(1), tileCell.y)),
  );
  const lineMask = step(tileEdge, uLineHalf);

  // Small "x" marks (diagonals), not "+" — centered in each sub-cell.
  const subCell = fract(worldXZ.div(uSubCellSize));
  const p = sub(subCell, vec2(0.5, 0.5));
  const diagA = abs(sub(p.x, p.y));
  const diagB = abs(p.x.add(p.y));
  const strokeA = step(diagA, uCrossStroke);
  const strokeB = step(diagB, uCrossStroke);
  const inReach = step(max(abs(p.x), abs(p.y)), uCrossReach);
  const crossMask = max(strokeA, strokeB).mul(inReach);

  const gridMask = max(crossMask, lineMask);
  const gridColor = mix(uCross, uLine, lineMask);
  const colorNode = overlay ? gridColor : mix(uBase, gridColor, gridMask);
  const opacityNode = overlay ? gridMask.mul(float(0.9)) : undefined;

  return {
    colorNode,
    opacityNode,
    uniforms: {
      uTileSize,
      uCrossesPerTile,
      uCrossStroke,
      uCrossReach,
      uLineHalf,
    },
  };
}

type GridFloorMaterialProps = GridFloorShaderParams & {
  roughness?: number;
  metalness?: number;
};

/** Procedural tile grid + crosses in world XZ (one material, no instancing). */
export function GridFloorMaterial({
  tileSize,
  crossesPerTile,
  crossStrokeMeters,
  crossReachMeters,
  baseColor,
  crossColor,
  lineColor,
  lineHalf,
  overlay = false,
  roughness = 0.94,
  metalness = 0,
}: GridFloorMaterialProps) {
  const nodes = useMemo(
    () =>
      createGridFloorShaderNodes({
        tileSize,
        crossesPerTile,
        crossStrokeMeters,
        crossReachMeters,
        baseColor,
        crossColor,
        lineColor,
        lineHalf,
        overlay,
      }),
    [
      tileSize,
      crossesPerTile,
      crossStrokeMeters,
      crossReachMeters,
      baseColor,
      crossColor,
      lineColor,
      lineHalf,
      overlay,
    ],
  );

  return (
    <meshStandardNodeMaterial
      {...nodes}
      transparent={overlay}
      depthWrite={!overlay}
      roughness={roughness}
      metalness={metalness}
    />
  );
}
