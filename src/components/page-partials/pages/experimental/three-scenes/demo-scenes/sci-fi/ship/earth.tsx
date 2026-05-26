import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect, useMemo, useRef } from "react";
import {
  BackSide,
  Color,
  DataTexture,
  ImageBitmapLoader,
  LinearFilter,
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

const earthTextures = {
  dayPreview: "/images/textures/earth/three-journey/day-1k.jpg",
  nightPreview: "/images/textures/earth/three-journey/night-1k.jpg",
  dayHigh: "/images/textures/earth/NASA/earth_color_8K.jpg",
  nightHigh: "/images/textures/earth/NASA/earth_nightlights_8K.jpg",
  specularClouds: "/images/textures/earth/three-journey/specularClouds-1k.jpg",
};

const earthPosition: [number, number, number] = [-60, -70, -200];
const earthRadius = 100;
const earthShaderDefaults = {
  atmosphereDayColor: "#3e547c",
  atmosphereTwilightColor: "#4a6f4c",
  bakedTint: "#f7f7f7",
  sunPhi: 1.68,
  sunTheta: 1.93,
  rotationSpeed: 0.005,
};

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

      float cloudsMix = smoothstep(0.5, 1.0, specularCloudsColor.g);
      cloudsMix *= dayMix;
      color = mix(color, vec3(1.0), cloudsMix);

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
) {
  if (colorSpace) {
    texture.colorSpace = colorSpace;
  }

  texture.anisotropy = anisotropy;
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
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
) {
  let cancelled = false;
  const finish = (texture: Texture) => {
    if (cancelled) {
      texture.dispose();
      return;
    }

    configureTexture(texture, anisotropy, colorSpace);
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
  const earthRef = useRef<Mesh>(null);
  const earthMaterialRef = useRef<ShaderMaterial>(null);
  const atmosphereMaterialRef = useRef<ShaderMaterial>(null);
  const loadedTexturesRef = useRef<Texture[]>([]);
  const targetTextureBlendRef = useRef(0);
  const { gl } = useThree();
  const placeholderTextures = useMemo(
    () => ({
      day: createSolidTexture([25, 34, 46, 255], SRGBColorSpace),
      night: createSolidTexture([2, 3, 6, 255], SRGBColorSpace),
      specularClouds: createSolidTexture([0, 0, 0, 255]),
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
    disposers.push(scheduleIdle(loadHighTextures, 1300));

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
      placeholderTextures.specularClouds.dispose();
    },
    [placeholderTextures],
  );

  const sunDirection = useMemo(() => new Vector3(), []);

  useEffect(() => {
    sunDirection.setFromSphericalCoords(1, sunPhi, sunTheta);

    earthMaterialRef.current?.uniforms.uSunDirection.value.copy(sunDirection);
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
      uSpecularCloudsTexture: new Uniform(placeholderTextures.specularClouds),
      uTextureBlend: new Uniform(0),
      uSunDirection: new Uniform(sunDirection.clone()),
      uAtmosphereDayColor: new Uniform(
        new Color(earthShaderDefaults.atmosphereDayColor),
      ),
      uAtmosphereTwilightColor: new Uniform(
        new Color(earthShaderDefaults.atmosphereTwilightColor),
      ),
      uBakedTint: new Uniform(new Color(earthShaderDefaults.bakedTint)),
    }),
    [placeholderTextures, sunDirection],
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

  useFrame((state, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = state.clock.elapsedTime * rotationSpeed;
    }

    const material = earthMaterialRef.current;
    if (!material) return;

    const blendUniform = material.uniforms.uTextureBlend;
    blendUniform.value +=
      (targetTextureBlendRef.current - blendUniform.value) *
      (1 - Math.exp(-delta * 0.9));
  });

  return (
    <group position={earthPosition} rotation={[0.12, -Math.PI / 1.35, 0]}>
      <mesh ref={earthRef} name="Earth_Sphere">
        <sphereGeometry args={[earthRadius, 128, 96]} />
        <shaderMaterial
          ref={earthMaterialRef}
          vertexShader={earthVertexShader}
          fragmentShader={earthFragmentShader}
          uniforms={earthUniforms}
        />
      </mesh>

      <mesh name="Atmosphere" scale={1.03}>
        <sphereGeometry args={[earthRadius, 128, 96]} />
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
  );
}

export default Earth;
