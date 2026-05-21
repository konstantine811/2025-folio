import { useTexture } from "@react-three/drei";
import { forwardRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  abs,
  clamp,
  color,
  dot,
  float,
  max,
  mix,
  normalize,
  normalLocal,
  positionLocal,
  texture,
  time,
  uniform,
  uv,
  vec3,
} from "three/tsl";
import {
  DEFAULT_BUSH_CONFIG,
  getPerlinTexture,
  LEAF_MASK_PATH,
  type BushConfig,
} from "./bush-core";

type BushNodeMaterialProps = BushConfig & {
  geometry?: THREE.BufferGeometry;
};

export function useBushMaterialNodes(config: BushConfig = {}) {
  const {
    bushRadius = DEFAULT_BUSH_CONFIG.bushRadius,
    windStrength = DEFAULT_BUSH_CONFIG.windStrength,
    windSpeed = DEFAULT_BUSH_CONFIG.windSpeed,
    debug = DEFAULT_BUSH_CONFIG.debug,
  } = config;

  const leafMask = useTexture(LEAF_MASK_PATH);
  const perlinTexture = getPerlinTexture();

  useEffect(() => {
    leafMask.colorSpace = THREE.NoColorSpace;
    leafMask.wrapS = THREE.ClampToEdgeWrapping;
    leafMask.wrapT = THREE.ClampToEdgeWrapping;
    leafMask.generateMipmaps = false;
    leafMask.minFilter = THREE.LinearFilter;
    leafMask.magFilter = THREE.LinearFilter;
    leafMask.needsUpdate = true;
  }, [leafMask]);

  const { nodes, uniforms } = useMemo(() => {
    const windStrengthUniform = uniform(DEFAULT_BUSH_CONFIG.windStrength);
    const windSpeedUniform = uniform(DEFAULT_BUSH_CONFIG.windSpeed);

    const leafAlpha = texture(leafMask, uv()).r;
    const perlinUv = positionLocal.xz
      .mul(0.12)
      .add(time.mul(windSpeedUniform));
    const windSample = clamp(
      texture(perlinTexture, perlinUv).sub(0.5),
      -0.35,
      0.35,
    );
    const perlinColor = windSample
      .mul(max(0, positionLocal.y))
      .mul(windStrengthUniform);

    const positionNode = positionLocal.add(
      vec3(perlinColor.r, 0, perlinColor.r),
    );

    if (debug) {
      return {
        nodes: {
          positionNode,
          colorNode: abs(normalize(positionLocal)),
          opacityNode: leafAlpha,
        },
        uniforms: {
          windStrength: windStrengthUniform,
          windSpeed: windSpeedUniform,
        },
      };
    }

    const baseColor = color(new THREE.Color(0.1, 0.32, 0.14));
    const topColor = color(new THREE.Color(0.62, 0.76, 0.22));
    const heightFactor = clamp(positionLocal.y.div(float(bushRadius)), 0, 1);
    const bushColor = mix(baseColor, topColor, heightFactor);

    const lightDirection = normalize(vec3(1.0, 1.5, 1.0));
    const lighting = dot(normalLocal, lightDirection).mul(0.45).add(0.55);
    const ao = mix(float(0.72), float(1.0), heightFactor);
    const colorNode = bushColor.mul(lighting).mul(ao);

    return {
      nodes: { positionNode, colorNode, opacityNode: leafAlpha },
      uniforms: {
        windStrength: windStrengthUniform,
        windSpeed: windSpeedUniform,
      },
    };
  }, [bushRadius, debug, leafMask, perlinTexture]);

  uniforms.windStrength.value = windStrength;
  uniforms.windSpeed.value = windSpeed;

  return nodes;
}

export const BushNodeMaterial = forwardRef<
  THREE.Material,
  BushNodeMaterialProps
>(function BushNodeMaterial({ geometry: _geometry, ...config }, ref) {
  const materialNodes = useBushMaterialNodes(config);

  return (
    <meshBasicNodeMaterial
      ref={ref}
      {...materialNodes}
      transparent
      alphaTest={0.5}
      side={THREE.DoubleSide}
      depthWrite
    />
  );
});

useTexture.preload(LEAF_MASK_PATH);
