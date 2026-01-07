import { shaderMaterial, useGLTF } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import {
  Mesh,
  Vector2,
  Float32BufferAttribute,
  BufferGeometry,
  SphereGeometry,
  ShaderMaterial,
  Color,
  Texture,
} from "three";
import { RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import simplexNoise3dShader from "../particle-morphing/shaders/simplexNoise3d.glsl?raw";
import { animate, useMotionValue } from "framer-motion";
import { useRaycastGeometryStore } from "@/components/common/three/raycast-geometry/storage/raycast-storage";
import { useThemeStore } from "@/storage/themeStore";
import { ThemePalette } from "@/config/theme-colors.config";
import { useIsAdoptive } from "@/hooks/useIsAdoptive";
import { useModelLoading } from "./useModelLoading";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

const vertexShader = /* glsl */ `
    ${simplexNoise3dShader}
    uniform vec2 uResolution;
    uniform float uSize;
    uniform float uProgress;
    attribute vec3 aPositionTarget;
    varying vec3 vColor;
    attribute float aIntensity;
    attribute float aAngle;
    uniform sampler2D uDisplacementTexture;
    attribute float aSize;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    varying vec2 vScreenUv;

    uniform float uTime;
    uniform float uJitterAmp;
    uniform float uJitterFreq;
    attribute vec3 aRandom;
    void main()
    {
       
        // Mixed position
        float noiseOrigin = snoise(position * 0.2);
        float noiseTarget = snoise(aPositionTarget * 0.2);
        float noise = mix(noiseOrigin, noiseTarget, uProgress);
        noise = smoothstep(-1.0, 1.0, noiseOrigin);

        float duration = 0.8;
        float delay = (1.0 - duration) * noise;
        float end = delay + duration;
        float progress = smoothstep(delay, end, uProgress);
        // Varyings
        vColor = mix(uColorA, uColorB, noise);
        vec3 mixedPosition = mix(position, aPositionTarget, progress);

        float t = uTime * uJitterFreq;

        // м’яке тремтіння через шум (стабільніше ніж "рандомні" стрибки)
        float n = snoise(mixedPosition * 10.1 + vec3(t * 0.01));
        float wobble = sin(t + n * 6.2831); // 2π

        vec3 jitter = aRandom * uJitterAmp * wobble;


        mixedPosition += jitter ;
     

        // Final position
        vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        gl_Position = projectedPosition;

        vec4 clipPosition  = projectionMatrix * viewPosition;

        // NDC -> 0..1
        vec2 ndc = clipPosition.xy / clipPosition.w;
        vScreenUv = ndc * 0.5 + 0.5;
      
        // семпл по екрану
        vec2 texUv = vec2(vScreenUv.x, vScreenUv.y);
        float displacementIntensity = texture2D(uDisplacementTexture, texUv).r;
        displacementIntensity = smoothstep(0.1, 1.0, displacementIntensity);
        vec3 displacement = vec3(sin(aAngle), cos(aAngle), 0.0);
        displacement = normalize(displacement);
        displacement *= displacementIntensity;
        displacement *= 0.8;
        displacement *= aIntensity;
        mixedPosition += displacement;
      
        // фінальна позиція
        modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
        viewPosition  = viewMatrix * modelPosition;
        gl_Position   = projectionMatrix * viewPosition;

        // Point size
        gl_PointSize = aSize *uSize * uResolution.y;
        gl_PointSize *= (1.0 / - viewPosition.z);
    }`;

const fragmentShader = /* glsl */ `
    varying vec3 vColor;
    void main()
        {
            vec2 uv = gl_PointCoord;
            float distanceToCenter = length(uv - 0.5);
            // Збільшуємо альфа для кращої видимості на білому фоні
            float alpha = 0.3 / (distanceToCenter + 0.1) - 0.5;
            alpha = clamp(alpha, 0.0, 1.0);
            gl_FragColor = vec4(vColor, alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
        }
    `;

const ShaderCustomMaterial = shaderMaterial(
  {
    uSize: 0.2,
    uResolution: new Vector2(
      sizes.width * sizes.pixelRatio,
      sizes.height * sizes.pixelRatio
    ),
    depthWrite: false,
    uDisplacementTexture: null as Texture | null,
    uProgress: 0,

    uTime: 0,
    uJitterAmp: 1.05, // амплітуда дрібного тремтіння (підбирай)
    uJitterFreq: 1.0, // частота (підбирай)
    uColorA: new Color("#00c3ff"),
    uColorB: new Color("#ff8a00"),
  },
  vertexShader,
  fragmentShader
);

extend({ ShaderCustomMaterial });

const ParticleMorphing = ({
  pathModel = "/3d-models/models.glb",
  uSectionProgressRef,
  uPageIndexRef,
}: {
  uSectionProgressRef: RefObject<number>;
  pathModel: string;
  uPageIndexRef: RefObject<number>;
}) => {
  const { setIsModelLoaded } = useModelLoading();
  const { isAdoptiveSize: isMdSize } = useIsAdoptive();

  const theme = useThemeStore((state) => state.selectedTheme);
  const shaderCustomMaterialRef = useRef<ShaderMaterial>(null);
  const displacementTexture = useRaycastGeometryStore(
    (s) => s.displacementTexture
  );
  const currentSectionRef = useRef(0);
  const isModelLoadedRef = useRef(false);
  // 1) MotionValue для прогресу
  const uJitterAmpMV = useMotionValue(1.05);
  const uJitterFreqMV = useMotionValue(1.0);
  const geometryRef = useRef<BufferGeometry>(new SphereGeometry(200, 64, 64));

  // Попереднє завантаження моделі
  useEffect(() => {
    useGLTF.preload(pathModel);
  }, [pathModel]);

  const { scene } = useGLTF(pathModel);

  const particles = useMemo(() => {
    return {
      maxCount: 0,
      positions: [] as Float32BufferAttribute[],
      geometry: new BufferGeometry(),
      intensities: [] as Float32BufferAttribute[],
      angles: [] as Float32BufferAttribute[],
    };
  }, []);

  const onMorphing = useCallback(
    (prevIndex: number, nextIndex: number) => {
      // Перевірка, чи geometryRef готовий
      if (!geometryRef.current) {
        console.warn("onMorphing: geometryRef.current is null");
        return;
      }

      // Перевірка, чи індекси в межах масиву
      if (
        !particles.positions ||
        particles.positions.length === 0 ||
        prevIndex < 0 ||
        nextIndex < 0 ||
        prevIndex >= particles.positions.length ||
        nextIndex >= particles.positions.length
      ) {
        console.warn("onMorphing: invalid indices", {
          prevIndex,
          nextIndex,
          positionsLength: particles.positions?.length || 0,
        });
        return;
      }

      const prevPosition = particles.positions[prevIndex];
      const nextPosition = particles.positions[nextIndex];

      // Перевірка, чи атрибути не undefined
      if (!prevPosition || !nextPosition) {
        console.warn("onMorphing: position attributes are undefined");
        return;
      }

      geometryRef.current.setAttribute("position", prevPosition);
      geometryRef.current.setAttribute("aPositionTarget", nextPosition);
    },
    [particles]
  );

  useEffect(() => {
    animate(uJitterAmpMV, 0.1, {
      duration: 5,
      ease: [0.22, 1, 0.36, 1], // приємний ease-out (можеш змінити)
    });
    animate(uJitterFreqMV, 0.1, {
      duration: 7,
      ease: [0.22, 1, 0.36, 1], // приємний ease-out (можеш змінити)
    });
    uJitterAmpMV.on("change", (v) => {
      const mat = shaderCustomMaterialRef.current;
      if (!mat) return;
      mat.uniforms.uJitterAmp.value = v;
    });
    uJitterFreqMV.on("change", (v) => {
      const mat = shaderCustomMaterialRef.current;
      if (!mat) return;
      mat.uniforms.uJitterFreq.value = v;
    });
  }, [uJitterAmpMV, uJitterFreqMV]);

  // Оновлення геометрії коли модель завантажиться

  const updateGeometry = useCallback(() => {
    if (!scene || scene.children.length === 0) {
      return;
    }

    const positions = scene.children
      .map((child) => {
        if (child instanceof Mesh) {
          return child.geometry.attributes.position;
        }
      })
      .filter((position) => position !== undefined);

    if (positions.length === 0) {
      return;
    }

    particles.maxCount = Math.max(
      ...positions.map((position) => position.count)
    );

    // Очищаємо попередні позиції
    particles.positions = [];

    positions.forEach((position) => {
      const originalArray = position.array;
      const newArray = new Float32Array(particles.maxCount * 3);

      for (let i = 0; i < particles.maxCount; i++) {
        const i3 = i * 3;
        if (i3 < originalArray.length) {
          newArray[i3] = originalArray[i3 + 0];
          newArray[i3 + 1] = originalArray[i3 + 1];
          newArray[i3 + 2] = originalArray[i3 + 2];
        } else {
          const randomIndex = Math.floor(position.count * Math.random()) * 3;
          newArray[i3 + 0] = originalArray[randomIndex + 0];
          newArray[i3 + 1] = originalArray[randomIndex + 1];
          newArray[i3 + 2] = originalArray[randomIndex + 2];
        }
      }
      particles.positions.push(new Float32BufferAttribute(newArray, 3));
    });

    const randomArray = new Float32Array(particles.maxCount * 3);
    const sizesArray = new Float32Array(particles.maxCount);
    const intensities = new Float32Array(particles.maxCount);
    const angles = new Float32Array(particles.maxCount);
    for (let i = 0; i < particles.maxCount; i++) {
      const i3 = i * 3;
      randomArray[i3 + 0] = Math.random() * 2 - 1;
      randomArray[i3 + 1] = Math.random() * 2 - 1;
      randomArray[i3 + 2] = Math.random() * 2 - 1;
      sizesArray[i] = Math.random();
      intensities[i] = Math.random() + 1.5;
      angles[i] = Math.random() * Math.PI * 2;
    }

    geometryRef.current.setIndex(null);
    geometryRef.current.deleteAttribute("normal");
    geometryRef.current.setAttribute(
      "aRandom",
      new Float32BufferAttribute(randomArray, 3)
    );
    geometryRef.current.setAttribute(
      "aSize",
      new Float32BufferAttribute(sizesArray, 1)
    );
    geometryRef.current.setAttribute(
      "aIntensity",
      new Float32BufferAttribute(intensities, 1)
    );
    geometryRef.current.setAttribute(
      "aAngle",
      new Float32BufferAttribute(angles, 1)
    );

    // Встановлюємо позиції з моделі
    if (particles.positions.length > 0) {
      geometryRef.current.setAttribute("position", particles.positions[0]);
      if (particles.positions.length > 1) {
        geometryRef.current.setAttribute(
          "aPositionTarget",
          particles.positions[1]
        );
      } else {
        geometryRef.current.setAttribute(
          "aPositionTarget",
          particles.positions[0]
        );
      }
      isModelLoadedRef.current = true;
      setIsModelLoaded(true);
    }
  }, [scene, particles, setIsModelLoaded]);
  useEffect(() => {
    updateGeometry();
  }, [updateGeometry]);

  useFrame((state) => {
    const mat = shaderCustomMaterialRef.current;
    if (!mat) return;

    mat.uniforms.uTime.value = state.clock.elapsedTime;

    // Морфінг тільки після завантаження моделі
    if (isModelLoadedRef.current && particles.positions.length > 0) {
      const nextSection = uPageIndexRef.current ?? 0;

      // якщо змінилась секція — СИНХРОННО міняємо атрибути геометрії
      if (nextSection !== currentSectionRef.current) {
        const from = nextSection;
        const to = Math.min(from + 1, particles.positions.length - 1);

        // важливо: тільки якщо є позиції
        if (to >= 0) {
          onMorphing(from, to);
          currentSectionRef.current = nextSection;
        }
      }

      // тепер progress точно відповідає активному морфу в цьому ж кадрі
      mat.uniforms.uProgress.value = uSectionProgressRef.current;
    } else {
      // Поки модель завантажується, progress = 0 (показуємо сферу)
      mat.uniforms.uProgress.value = 0;
    }
  });

  return (
    <>
      <points
        frustumCulled={false}
        geometry={geometryRef.current}
        scale={isMdSize ? 9 : 18}
      >
        <shaderCustomMaterial
          ref={shaderCustomMaterialRef}
          uDisplacementTexture={displacementTexture}
          uColorA={ThemePalette[theme].accent}
          uColorB={ThemePalette[theme].foreground}
        />
      </points>
    </>
  );
};

export default ParticleMorphing;
