import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { simCityRenderConfig } from "../../sim-city.config";
import { MapTile } from "../utils/generateMap";
import {
  createDisplacedWaterGeometry,
  createSmoothedWaterMaskTexture,
  MountainHeightData,
} from "./createMapTextures";

const WATER_NORMALS_URL = "/textures/waternormals.jpg";

const vertexShader = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_vertex>

  varying vec4 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec2 vGridUv;

  uniform vec2 uMapSize;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vGridUv = vec2(
      (position.x + uMapSize.x * 0.5) / uMapSize.x,
      (uMapSize.y * 0.5 - position.z) / uMapSize.y
    );

    vec4 mvPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * mvPosition;
    #include <logdepthbuf_vertex>
  }
`;

const fragmentShader = /* glsl */ `
  #include <common>
  #include <logdepthbuf_pars_fragment>

  uniform float uTime;
  uniform float uSize;
  uniform sampler2D uNormalSampler;
  uniform sampler2D uMask;
  uniform vec3 uSunColor;
  uniform vec3 uSunDirection;
  uniform vec3 uWaterColor;
  uniform vec3 uEye;

  varying vec4 vWorldPosition;
  varying vec3 vWorldNormal;
  varying vec2 vGridUv;

  float sampleWaterMask(vec2 tileUv) {
    if (
      tileUv.x < 0.0 || tileUv.x > 1.0 ||
      tileUv.y < 0.0 || tileUv.y > 1.0
    ) {
      return 0.0;
    }

    return texture2D(uMask, tileUv).r;
  }

  vec4 getNoise(vec2 uv) {
    vec2 uv0 = (uv / 103.0) + vec2(uTime / 17.0, uTime / 29.0);
    vec2 uv1 = uv / 107.0 - vec2(uTime / -19.0, uTime / 31.0);
    vec2 uv2 = uv / vec2(8907.0, 9803.0) + vec2(uTime / 101.0, uTime / 97.0);
    vec2 uv3 = uv / vec2(1091.0, 1027.0) - vec2(uTime / 109.0, uTime / -113.0);

    vec4 noise =
      texture2D(uNormalSampler, uv0) +
      texture2D(uNormalSampler, uv1) +
      texture2D(uNormalSampler, uv2) +
      texture2D(uNormalSampler, uv3);

    return noise * 0.5 - 1.0;
  }

  void sunLight(
    vec3 surfaceNormal,
    vec3 eyeDirection,
    float shiny,
    float spec,
    float diffuse,
    inout vec3 diffuseColor,
    inout vec3 specularColor
  ) {
    vec3 reflection = normalize(reflect(-uSunDirection, surfaceNormal));
    float direction = max(0.0, dot(eyeDirection, reflection));
    specularColor += pow(direction, shiny) * uSunColor * spec;
    diffuseColor += max(dot(uSunDirection, surfaceNormal), 0.0) * uSunColor * diffuse;
  }

  void main() {
    float waterMask = sampleWaterMask(vGridUv);
    float waterAlpha = smoothstep(0.08, 0.72, waterMask);

    if (waterAlpha < 0.04) {
      discard;
    }

    vec4 noise = getNoise(vWorldPosition.xz * uSize);
    vec3 rippleNormal = normalize(noise.xzy * vec3(1.5, 1.0, 1.5));
    vec3 surfaceNormal = normalize(vWorldNormal + rippleNormal * 0.35);

    vec3 diffuseLight = vec3(0.0);
    vec3 specularLight = vec3(0.0);

    vec3 worldToEye = uEye - vWorldPosition.xyz;
    vec3 eyeDirection = normalize(worldToEye);
    sunLight(surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight);

    vec3 scatter = max(0.0, dot(surfaceNormal, eyeDirection)) * uWaterColor;
    vec3 baseColor = uSunColor * diffuseLight * 0.35 + scatter * 1.6 + specularLight;

    float shore = 1.0 - smoothstep(0.05, 0.55, waterMask);
    vec3 foam = vec3(0.78, 0.9, 0.96);
    vec3 color = mix(baseColor, foam, shore * 0.5);

    float fresnel = pow(
      1.0 - max(dot(eyeDirection, surfaceNormal), 0.0),
      3.0
    );
    color = mix(color, vec3(0.12, 0.35, 0.55), fresnel * 0.2);

    gl_FragColor = vec4(color, waterAlpha * 0.95);
    #include <logdepthbuf_fragment>
  }
`;

type WaterSurfaceProps = {
  heightData: MountainHeightData;
  mapData: MapTile[][];
  mapSize: { width: number; height: number };
};

export function WaterSurface({
  heightData,
  mapData,
  mapSize,
}: WaterSurfaceProps) {
  const hasWater = useMemo(
    () => mapData.flat().some((tile) => tile.type === "water"),
    [mapData],
  );

  const normalMap = useLoader(THREE.TextureLoader, WATER_NORMALS_URL);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;

  const maskTexture = useMemo(
    () =>
      createSmoothedWaterMaskTexture(
        mapData,
        simCityRenderConfig.waterMaskBlurRadius,
      ),
    [mapData],
  );

  const mapSizeVector = useMemo(
    () => new THREE.Vector2(mapSize.width, mapSize.height),
    [mapSize.height, mapSize.width],
  );

  const geometry = useMemo(
    () =>
      createDisplacedWaterGeometry(
        mapSize,
        heightData.field,
        heightData.width,
        heightData.height,
        simCityRenderConfig.terrainSegments,
        simCityRenderConfig.waterSurfaceOffset,
      ),
    [heightData, mapSize],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 1.6 },
          uNormalSampler: { value: normalMap },
          uMask: { value: maskTexture },
          uMapSize: { value: mapSizeVector },
          uSunColor: { value: new THREE.Color(0xffffff) },
          uSunDirection: {
            value: new THREE.Vector3(0.35, 0.85, 0.25).normalize(),
          },
          uWaterColor: { value: new THREE.Color(0x004466) },
          uEye: { value: new THREE.Vector3() },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -4,
      }),
    [mapSizeVector, maskTexture, normalMap],
  );

  useFrame(({ clock, camera }) => {
    material.uniforms.uTime.value = clock.getElapsedTime();
    material.uniforms.uEye.value.copy(camera.position);
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      maskTexture.dispose();
    };
  }, [geometry, material, maskTexture]);

  if (!hasWater) return null;

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[
        mapSize.width / 2,
        simCityRenderConfig.terrainGroundY,
        mapSize.height / 2,
      ]}
      renderOrder={2}
      frustumCulled={false}
    />
  );
}
