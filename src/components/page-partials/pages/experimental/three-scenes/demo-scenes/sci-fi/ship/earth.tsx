import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import {
  BackSide,
  Color,
  DataTexture,
  Group,
  ImageBitmapLoader,
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  RGBAFormat,
  ShaderMaterial,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Uniform,
  UnsignedByteType,
  Vector3,
} from "three";
import { earthConfig, earthShaderDefaults } from "./earth.config";
import { prefersLightweightTextures } from "@/utils/device-capabilities";

const earthTextures = {
  dayPreview: "/images/textures/earth/three-journey/day-1k.jpg",
  nightPreview: "/images/textures/earth/three-journey/night-1k.jpg",
  dayHigh: "/images/textures/earth/NASA/earth_color_8K.jpg",
  nightHigh: "/images/textures/earth/NASA/earth_nightlights_8K.jpg",
  specularClouds: "/images/textures/earth/three-journey/specularClouds-1k.jpg",
  specularCloudsHigh: "/images/textures/earth/three-journey/specularClouds.jpg",
};

const camExcludeCollision = { camExcludeCollision: true } as const;

const earthPosition = earthConfig.position;
const earthRadius = earthConfig.radius;
const cloudLayerScale = earthConfig.cloudLayerScale;

const cloudMaskGlsl = /* glsl */ `
  float sharpenCloudMask(float rawCloud, float sharpness)
  {
      float contrasted = clamp((rawCloud - 0.5) * sharpness + 0.5, 0.0, 1.0);
      float edge = fwidth(contrasted) * 0.55;
      return smoothstep(0.44 - edge, 0.58 + edge, contrasted);
  }
`;

const cloudDensityGlsl = /* glsl */ `
  float cloudDensity(vec2 uv, sampler2D cloudTexture)
  {
      float base = texture2D(cloudTexture, uv).g;
      return smoothstep(0.34, 0.72, base);
  }
`;

const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main()
  {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * viewMatrix * modelPosition;

      vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

      vUv = uv;
      vNormal = modelNormal;
      vPosition = modelPosition.xyz;
  }
`;

const earthFragmentShader = /* glsl */ `
  ${cloudMaskGlsl}
  ${cloudDensityGlsl}
  uniform sampler2D uDayTexture;
  uniform sampler2D uNightTexture;
  uniform sampler2D uDayHighTexture;
  uniform sampler2D uNightHighTexture;
  uniform sampler2D uSpecularCloudsTexture;
  uniform float uTextureBlend;
  uniform vec3 uSunDirection;
  uniform vec3 uAtmosphereDayColor;
  uniform vec3 uAtmosphereTwilightColor;
  uniform vec3 uBakedTint;
  uniform float uCloudLayerAngle;
  uniform float uCloudShadowStrength;
  uniform float uCloudSharpness;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main()
  {
      vec3 viewDirection = normalize(vPosition - cameraPosition);
      vec3 normal = normalize(vNormal);
      vec3 color = vec3(0.0);

      float sunOrientation = dot(uSunDirection, normal);

      float dayMix = smoothstep(- 0.25, 0.5, sunOrientation);
      vec3 dayPreviewColor = texture2D(uDayTexture, vUv).rgb;
      vec3 nightPreviewColor = texture2D(uNightTexture, vUv).rgb;
      vec3 dayHighColor = texture2D(uDayHighTexture, vUv).rgb;
      vec3 nightHighColor = texture2D(uNightHighTexture, vUv).rgb;
      vec3 dayColor = mix(dayPreviewColor, dayHighColor, uTextureBlend);
      vec3 nightColor = mix(nightPreviewColor, nightHighColor, uTextureBlend);
      color = mix(nightColor, dayColor, dayMix);

      vec2 specularCloudsColor = texture2D(uSpecularCloudsTexture, vUv).rg;

      vec3 sunDir = normalize(uSunDirection);
      vec3 upReference = abs(normal.y) < 0.999 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
      vec3 tangent = normalize(cross(upReference, normal));
      vec3 bitangent = cross(normal, tangent);

      vec2 cloudUv = vUv;
      cloudUv.x = fract(cloudUv.x - uCloudLayerAngle / 6.2831853);

      vec2 sunTangentUv = vec2(dot(tangent, sunDir), dot(bitangent, sunDir));
      float sunTangentLen = max(length(sunTangentUv), 0.0001);
      vec2 shadowUv = cloudUv - (sunTangentUv / sunTangentLen) * 0.065;
      shadowUv.x = fract(shadowUv.x);

      float cloudShadowSample = cloudDensity(
          shadowUv,
          uSpecularCloudsTexture
      );
      float cloudShadow = sharpenCloudMask(cloudShadowSample, uCloudSharpness) * dayMix;
      color *= 1.0 - cloudShadow * uCloudShadowStrength;

      float fresnel = dot(viewDirection, normal) + 1.0;
      fresnel = pow(fresnel, 2.0);

      float atmosphereDayMix = smoothstep(- 0.5, 1.0, sunOrientation);
      vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
      color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);

      vec3 reflection = reflect(- uSunDirection, normal);
      float specular = - dot(reflection, viewDirection);
      specular = max(specular, 0.0);
      specular = pow(specular, 32.0);
      specular *= specularCloudsColor.r;

      vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
      color += specular * specularColor;
      color *= uBakedTint;

      gl_FragColor = vec4(color, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
  }
`;

const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main()
  {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * viewMatrix * modelPosition;

      vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

      vNormal = modelNormal;
      vPosition = modelPosition.xyz;
  }
`;

const cloudsVertexShader = /* glsl */ `
  uniform float uCloudDisplacement;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main()
  {
      vUv = uv;

      vec3 displaced = position + normal * uCloudDisplacement * 0.15;

      vec4 modelPosition = modelMatrix * vec4(displaced, 1.0);
      gl_Position = projectionMatrix * viewMatrix * modelPosition;

      vec3 modelNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      vNormal = modelNormal;
      vPosition = modelPosition.xyz;
  }
`;

const cloudsFragmentShader = /* glsl */ `
  uniform sampler2D uCloudsTexture;
  uniform vec3 uSunDirection;
  uniform float uCloudLayerAngle;
  uniform float uCloudOpacity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main()
  {
      vec3 normal = normalize(vNormal);
      vec3 sunDir = normalize(uSunDirection);
      vec3 viewDirection = normalize(vPosition - cameraPosition);
      float dayMix = smoothstep(- 0.25, 0.5, dot(sunDir, normal));
      float twilightMix = smoothstep(- 0.35, 0.15, dot(sunDir, normal));

      vec2 uv = vUv;
      uv.x = fract(uv.x - uCloudLayerAngle / 6.2831853);

      float density = texture2D(uCloudsTexture, uv).g;

      if (density < 0.04) {
          discard;
      }

      float light = max(dot(normal, sunDir), 0.0) * 0.75 + 0.25;
      vec3 cloudColor = mix(vec3(0.74, 0.78, 0.84), vec3(0.98, 0.99, 1.0), dayMix);
      cloudColor *= light;

      float rim = pow(1.0 - max(dot(viewDirection, normal), 0.0), 2.3);
      cloudColor += rim * vec3(0.9, 0.94, 1.0) * 0.24 * dayMix;

      float alpha = density * mix(0.38, 0.96, twilightMix) * uCloudOpacity;

      gl_FragColor = vec4(cloudColor, alpha);
  }
`;

const atmosphereFragmentShader = /* glsl */ `
  uniform vec3 uSunDirection;
  uniform vec3 uAtmosphereDayColor;
  uniform vec3 uAtmosphereTwilightColor;

  varying vec3 vNormal;
  varying vec3 vPosition;

  void main()
  {
      vec3 viewDirection = normalize(vPosition - cameraPosition);
      vec3 normal = normalize(vNormal);
      vec3 color = vec3(0.0);

      float sunOrientation = dot(uSunDirection, normal);

      float atmosphereDayMix = smoothstep(- 0.5, 1.0, sunOrientation);
      vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
      color = mix(color, atmosphereColor, atmosphereDayMix);
      color += atmosphereColor;

      float edgeAlpha = dot(viewDirection, normal);
      edgeAlpha = smoothstep(0.0, 0.5, edgeAlpha);

      float dayAlpha = smoothstep(- 0.5, 0.0, sunOrientation);
      float alpha = edgeAlpha * dayAlpha;

      gl_FragColor = vec4(color, alpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
  }
`;

function configureTexture(
  texture: Texture,
  anisotropy: number,
  colorSpace?: Texture["colorSpace"],
  useMipmaps = false,
) {
  if (colorSpace) {
    texture.colorSpace = colorSpace;
  }

  texture.anisotropy = anisotropy;
  texture.generateMipmaps = useMipmaps;
  texture.minFilter = useMipmaps ? LinearMipmapLinearFilter : LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
}

function createSolidTexture(
  color: [number, number, number, number],
  colorSpace?: Texture["colorSpace"],
) {
  const texture = new DataTexture(
    new Uint8Array(color),
    1,
    1,
    RGBAFormat,
    UnsignedByteType,
  );

  if (colorSpace) {
    texture.colorSpace = colorSpace;
  }

  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

function scheduleIdle(callback: () => void, delay = 240) {
  if (typeof window === "undefined") return () => {};

  if ("requestIdleCallback" in window && "cancelIdleCallback" in window) {
    const idleId = window.requestIdleCallback(callback, {
      timeout: delay + 800,
    });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = globalThis.setTimeout(callback, delay);
  return () => globalThis.clearTimeout(timeoutId);
}

function loadTextureInBackground(
  url: string,
  anisotropy: number,
  onLoad: (texture: Texture) => void,
  colorSpace?: Texture["colorSpace"],
  useMipmaps = false,
) {
  let cancelled = false;
  const finish = (texture: Texture) => {
    if (cancelled) {
      texture.dispose();
      return;
    }

    configureTexture(texture, anisotropy, colorSpace, useMipmaps);
    onLoad(texture);
  };

  if (typeof window !== "undefined" && "createImageBitmap" in window) {
    const loader = new ImageBitmapLoader();
    loader.setOptions({ imageOrientation: "flipY", premultiplyAlpha: "none" });
    loader.load(
      url,
      (imageBitmap) => finish(new Texture(imageBitmap)),
      undefined,
      () => {
        if (!cancelled) {
          new TextureLoader().load(url, finish);
        }
      },
    );
  } else {
    new TextureLoader().load(url, finish);
  }

  return () => {
    cancelled = true;
  };
}

function Earth() {
  const earthGroupRef = useRef<Group>(null);
  const earthMeshRef = useRef<Mesh>(null);
  const cloudsMeshRef = useRef<Mesh>(null);
  const earthMaterialRef = useRef<ShaderMaterial>(null);
  const cloudsMaterialRef = useRef<ShaderMaterial>(null);
  const atmosphereMaterialRef = useRef<ShaderMaterial>(null);
  const loadedTexturesRef = useRef<Texture[]>([]);
  const targetTextureBlendRef = useRef(0);
  const specularCloudsUniformRef = useRef<Uniform<Texture>>(
    new Uniform(createSolidTexture([0, 0, 0, 255])),
  );
  const { gl } = useThree();
  const placeholderTextures = useMemo(
    () => ({
      day: createSolidTexture([25, 34, 46, 255], SRGBColorSpace),
      night: createSolidTexture([2, 3, 6, 255], SRGBColorSpace),
    }),
    [],
  );

  const {
    atmosphereDayColor,
    atmosphereTwilightColor,
    bakedTint,
    sunPhi,
    sunTheta,
    rotationSpeed,
    cloudDriftRatio: cloudSpeedControl,
    cloudShadowStrength,
    cloudDisplacement,
    cloudSharpness,
    cloudOpacity,
  } = useControls("Earth shader", {
    atmosphereDayColor: {
      value: earthShaderDefaults.atmosphereDayColor,
      label: "Atmosphere day",
    },
    atmosphereTwilightColor: {
      value: earthShaderDefaults.atmosphereTwilightColor,
      label: "Atmosphere twilight",
    },
    sunPhi: {
      value: earthShaderDefaults.sunPhi,
      min: 0,
      max: Math.PI,
      step: 0.001,
    },
    sunTheta: {
      value: earthShaderDefaults.sunTheta,
      min: -Math.PI,
      max: Math.PI,
      step: 0.001,
    },
    rotationSpeed: {
      value: earthShaderDefaults.rotationSpeed,
      min: 0,
      max: 0.35,
      step: 0.001,
    },
    cloudDriftRatio: {
      value: earthConfig.shader.cloudSpeed,
      min: 0,
      max: 1.2,
      step: 0.001,
      label: "Cloud speed",
    },
    cloudShadowStrength: {
      value: earthShaderDefaults.cloudShadowStrength,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Cloud shadow",
    },
    cloudDisplacement: {
      value: earthShaderDefaults.cloudDisplacement,
      min: 0,
      max: 6,
      step: 0.05,
      label: "Cloud volume",
    },
    cloudSharpness: {
      value: earthShaderDefaults.cloudSharpness,
      min: 0.8,
      max: 2.5,
      step: 0.01,
      label: "Cloud sharpness",
    },
    cloudOpacity: {
      value: earthShaderDefaults.cloudOpacity,
      min: 0.05,
      max: 1,
      step: 0.01,
      label: "Cloud opacity",
    },
    bakedTint: {
      value: earthShaderDefaults.bakedTint,
      label: "Baked tint",
    },
  });

  useEffect(() => {
    const anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy());
    const disposers: Array<() => void> = [];
    let highTextureCount = 0;

    const assignTexture = (
      uniformName:
        | "uDayTexture"
        | "uNightTexture"
        | "uDayHighTexture"
        | "uNightHighTexture"
        | "uSpecularCloudsTexture",
      texture: Texture,
    ) => {
      loadedTexturesRef.current.push(texture);

      if (uniformName === "uSpecularCloudsTexture") {
        specularCloudsUniformRef.current.value = texture;
      }

      const material = earthMaterialRef.current;
      if (!material) return;

      material.uniforms[uniformName].value = texture;
      material.needsUpdate = true;
    };

    const loadPreviewTextures = () => {
      disposers.push(
        loadTextureInBackground(
          earthTextures.dayPreview,
          anisotropy,
          (texture) => assignTexture("uDayTexture", texture),
          SRGBColorSpace,
        ),
      );
      disposers.push(
        loadTextureInBackground(
          earthTextures.nightPreview,
          anisotropy,
          (texture) => assignTexture("uNightTexture", texture),
          SRGBColorSpace,
        ),
      );
      disposers.push(
        loadTextureInBackground(
          earthTextures.specularClouds,
          anisotropy,
          (texture) => assignTexture("uSpecularCloudsTexture", texture),
        ),
      );
      if (!prefersLightweightTextures) {
        disposers.push(
          scheduleIdle(() => {
            disposers.push(
              loadTextureInBackground(
                earthTextures.specularCloudsHigh,
                anisotropy,
                (texture) => assignTexture("uSpecularCloudsTexture", texture),
                undefined,
                true,
              ),
            );
          }, 500),
        );
      }
    };

    const assignHighTexture = (
      uniformName: "uDayHighTexture" | "uNightHighTexture",
      texture: Texture,
    ) => {
      highTextureCount += 1;
      assignTexture(uniformName, texture);

      if (highTextureCount === 2) {
        targetTextureBlendRef.current = 1;
      }
    };

    const loadHighTextures = () => {
      disposers.push(
        loadTextureInBackground(
          earthTextures.dayHigh,
          anisotropy,
          (texture) => assignHighTexture("uDayHighTexture", texture),
          SRGBColorSpace,
        ),
      );

      disposers.push(
        scheduleIdle(() => {
          disposers.push(
            loadTextureInBackground(
              earthTextures.nightHigh,
              anisotropy,
              (texture) => assignHighTexture("uNightHighTexture", texture),
              SRGBColorSpace,
            ),
          );
        }, 900),
      );
    };

    disposers.push(scheduleIdle(loadPreviewTextures, 80));
    if (!prefersLightweightTextures) {
      disposers.push(scheduleIdle(loadHighTextures, 1300));
    }

    return () => {
      disposers.forEach((dispose) => dispose());
      loadedTexturesRef.current.forEach((texture) => texture.dispose());
      loadedTexturesRef.current = [];
    };
  }, [gl]);

  useEffect(
    () => () => {
      placeholderTextures.day.dispose();
      placeholderTextures.night.dispose();
      const placeholderClouds = specularCloudsUniformRef.current.value;
      placeholderClouds.dispose();
    },
    [placeholderTextures],
  );

  const sunDirection = useMemo(() => new Vector3(), []);

  useEffect(() => {
    sunDirection.setFromSphericalCoords(1, sunPhi, sunTheta);

    earthMaterialRef.current?.uniforms.uSunDirection.value.copy(sunDirection);
    cloudsMaterialRef.current?.uniforms.uSunDirection.value.copy(sunDirection);
    atmosphereMaterialRef.current?.uniforms.uSunDirection.value.copy(
      sunDirection,
    );
  }, [sunDirection, sunPhi, sunTheta]);

  useEffect(() => {
    const dayColor = new Color(atmosphereDayColor);
    const twilightColor = new Color(atmosphereTwilightColor);
    const tintColor = new Color(bakedTint);

    earthMaterialRef.current?.uniforms.uAtmosphereDayColor.value.copy(dayColor);
    earthMaterialRef.current?.uniforms.uAtmosphereTwilightColor.value.copy(
      twilightColor,
    );
    earthMaterialRef.current?.uniforms.uBakedTint.value.copy(tintColor);
    atmosphereMaterialRef.current?.uniforms.uAtmosphereDayColor.value.copy(
      dayColor,
    );
    atmosphereMaterialRef.current?.uniforms.uAtmosphereTwilightColor.value.copy(
      twilightColor,
    );
  }, [atmosphereDayColor, atmosphereTwilightColor, bakedTint]);

  const earthUniforms = useMemo(
    () => ({
      uDayTexture: new Uniform(placeholderTextures.day),
      uNightTexture: new Uniform(placeholderTextures.night),
      uDayHighTexture: new Uniform(placeholderTextures.day),
      uNightHighTexture: new Uniform(placeholderTextures.night),
      uSpecularCloudsTexture: specularCloudsUniformRef.current,
      uTextureBlend: new Uniform(0),
      uSunDirection: new Uniform(sunDirection.clone()),
      uAtmosphereDayColor: new Uniform(
        new Color(earthShaderDefaults.atmosphereDayColor),
      ),
      uAtmosphereTwilightColor: new Uniform(
        new Color(earthShaderDefaults.atmosphereTwilightColor),
      ),
      uBakedTint: new Uniform(new Color(earthShaderDefaults.bakedTint)),
      uCloudLayerAngle: new Uniform(0),
      uCloudShadowStrength: new Uniform(
        earthShaderDefaults.cloudShadowStrength,
      ),
      uCloudSharpness: new Uniform(earthShaderDefaults.cloudSharpness),
    }),
    [placeholderTextures, sunDirection],
  );

  const cloudsUniforms = useMemo(
    () => ({
      uCloudsTexture: specularCloudsUniformRef.current,
      uSunDirection: new Uniform(sunDirection.clone()),
      uCloudDisplacement: new Uniform(earthShaderDefaults.cloudDisplacement),
      uCloudLayerAngle: new Uniform(0),
      uCloudOpacity: new Uniform(earthShaderDefaults.cloudOpacity),
    }),
    [sunDirection],
  );

  const atmosphereUniforms = useMemo(
    () => ({
      uSunDirection: new Uniform(sunDirection.clone()),
      uAtmosphereDayColor: new Uniform(
        new Color(earthShaderDefaults.atmosphereDayColor),
      ),
      uAtmosphereTwilightColor: new Uniform(
        new Color(earthShaderDefaults.atmosphereTwilightColor),
      ),
    }),
    [sunDirection],
  );

  useEffect(() => {
    const material = earthMaterialRef.current;
    if (material) {
      material.uniforms.uCloudShadowStrength.value = cloudShadowStrength;
    }
  }, [cloudShadowStrength]);

  useEffect(() => {
    const earthMaterial = earthMaterialRef.current;

    if (earthMaterial) {
      earthMaterial.uniforms.uCloudSharpness.value = cloudSharpness;
    }
  }, [cloudSharpness]);

  useEffect(() => {
    const material = cloudsMaterialRef.current;
    if (material) {
      material.uniforms.uCloudDisplacement.value = cloudDisplacement;
      material.uniforms.uCloudOpacity.value = cloudOpacity;
    }
  }, [cloudDisplacement, cloudOpacity]);

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime;
    const earthAngle = elapsed * rotationSpeed;
    const cloudLayerAngle = -earthAngle * (1 + cloudSpeedControl);

    const earthMaterial = earthMaterialRef.current;
    const cloudsMaterial = cloudsMaterialRef.current;

    if (cloudsMaterial) {
      cloudsMaterial.uniforms.uCloudLayerAngle.value = cloudLayerAngle;
    }

    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y = earthAngle;
    }

    if (earthMaterial) {
      earthMaterial.uniforms.uCloudLayerAngle.value = cloudLayerAngle;

      const blendUniform = earthMaterial.uniforms.uTextureBlend;
      blendUniform.value +=
        (targetTextureBlendRef.current - blendUniform.value) *
        (1 - Math.exp(-delta * 0.9));
    }
  });

  return (
    <group
      position={earthPosition}
      rotation={[0.12, -Math.PI / 1.35, 0]}
      userData={camExcludeCollision}
    >
      <group ref={earthGroupRef}>
        <mesh ref={earthMeshRef} name="Earth_Sphere">
          <sphereGeometry args={[earthRadius, 64, 46]} />
          <shaderMaterial
            ref={earthMaterialRef}
            vertexShader={earthVertexShader}
            fragmentShader={earthFragmentShader}
            uniforms={earthUniforms}
          />
        </mesh>

        <mesh
          ref={cloudsMeshRef}
          name="Clouds"
          scale={cloudLayerScale}
          renderOrder={2}
        >
          <sphereGeometry args={[earthRadius, 32, 32]} />
          <shaderMaterial
            ref={cloudsMaterialRef}
            transparent
            opacity={0.1}
            toneMapped={false}
            depthWrite={false}
            vertexShader={cloudsVertexShader}
            fragmentShader={cloudsFragmentShader}
            uniforms={cloudsUniforms}
          />
        </mesh>

        <mesh name="Atmosphere" scale={1.1}>
          <sphereGeometry args={[earthRadius, 32, 32]} />
          <shaderMaterial
            ref={atmosphereMaterialRef}
            side={BackSide}
            transparent
            depthWrite={false}
            vertexShader={atmosphereVertexShader}
            fragmentShader={atmosphereFragmentShader}
            uniforms={atmosphereUniforms}
          />
        </mesh>
      </group>
    </group>
  );
}

export default Earth;
