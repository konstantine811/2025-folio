import React, { useMemo } from "react";
import { createBushGeometry, DEFAULT_BUSH_CONFIG, type BushConfig } from "./bush-core";
import { BushNodeMaterial } from "./bush-material";

export type StylizedBushProps = BushConfig;

export const StylizedBush: React.FC<StylizedBushProps> = (props) => {
  const config = { ...DEFAULT_BUSH_CONFIG, ...props };
  const { leafCount, bushRadius, normalMix } = config;

  const mergedGeometry = useMemo(
    () => createBushGeometry(leafCount, bushRadius, normalMix),
    [leafCount, bushRadius, normalMix],
  );

  return (
    <mesh geometry={mergedGeometry} frustumCulled={false}>
      <BushNodeMaterial {...config} />
    </mesh>
  );
};
