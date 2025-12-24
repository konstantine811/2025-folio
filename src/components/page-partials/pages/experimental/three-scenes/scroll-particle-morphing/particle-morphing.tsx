import { shaderMaterial, useGLTF } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Mesh,
  Vector2,
  Float32BufferAttribute,
  BufferGeometry,
  SphereGeometry,
  ShaderMaterial,
  Color,
} from "three";
import { useCallback, useEffect, useMemo, useRef } from "react";
import simplexNoise3dShader from "../particle-morphing/shaders/simplexNoise3d.glsl?raw";
import {
  animate,
  AnimationPlaybackControls,
  useMotionValue,
} from "framer-motion";

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
    attribute float aSize;
    uniform vec3 uColorA;
    uniform vec3 uColorB;

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

        float duration = 0.4;
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
            float alpha = 0.05 / distanceToCenter - 0.1;
            gl_FragColor = vec4(vColor, alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
        }
    `;

const ShaderCustomMaterial = shaderMaterial(
  {
    uSize: 0.8,
    uResolution: new Vector2(
      sizes.width * sizes.pixelRatio,
      sizes.height * sizes.pixelRatio
    ),
    blending: AdditiveBlending,
    depthWrite: false,
    uProgress: 0,

    uTime: 0,
    uJitterAmp: 10.05, // амплітуда дрібного тремтіння (підбирай)
    uJitterFreq: 100.0, // частота (підбирай)
    uColorA: new Color("#00c3ff"),
    uColorB: new Color("#ff8a00"),
  },
  vertexShader,
  fragmentShader
);

extend({ ShaderCustomMaterial });

const ParticleMorphing = ({
  showIndexModel = 0,
  pathModel = "/3d-models/models.glb",
}: {
  showIndexModel: number;
  pathModel: string;
}) => {
  const { scene } = useGLTF(pathModel);
  const geometryRef = useRef<BufferGeometry>(new SphereGeometry(200, 64, 64));
  const shaderCustomMaterialRef = useRef<ShaderMaterial>(null);
  const particleIndex = useRef(showIndexModel);
  // 1) MotionValue для прогресу
  const uProgressMV = useMotionValue(0);
  const uJitterAmpMV = useMotionValue(10.05);
  const uJitterFreqMV = useMotionValue(10.0);

  // 2) Контролер анімації (щоб зупиняти попередню)
  const animRef = useRef<AnimationPlaybackControls | null>(null);

  const particles = useMemo(() => {
    return {
      maxCount: 0,
      positions: [] as Float32BufferAttribute[],
      geometry: new BufferGeometry(),
    };
  }, []);

  const startProgressAnim = useCallback(() => {
    animRef.current?.stop();
    uProgressMV.set(0);

    animRef.current = animate(uProgressMV, 1, {
      duration: 5,
      ease: [0.22, 1, 0.36, 1], // приємний ease-out (можеш змінити)
    });
  }, [uProgressMV]);

  const onMorphing = useCallback(
    (prevIndex: number, nextIndex: number) => {
      // console.log("onMorphing", prevIndex, nextIndex);
      geometryRef.current.setAttribute(
        "position",
        particles.positions[prevIndex]
      ); // старт
      geometryRef.current.setAttribute(
        "aPositionTarget",
        particles.positions[nextIndex]
      );
      startProgressAnim();
      particleIndex.current = nextIndex;
    },
    [particles, startProgressAnim]
  );

  useEffect(() => {
    onMorphing(particleIndex.current, showIndexModel);
  }, [showIndexModel, onMorphing]);

  useEffect(() => {
    animate(uJitterAmpMV, 0.07, {
      duration: 5,
      ease: [0.22, 1, 0.36, 1], // приємний ease-out (можеш змінити)
    });
    animate(uJitterFreqMV, 4.3, {
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

  useEffect(() => {
    uProgressMV.on("change", (v) => {
      const mat = shaderCustomMaterialRef.current;
      if (!mat) return;
      mat.uniforms.uProgress.value = v;
    });
  }, [uProgressMV]);

  useEffect(() => {
    geometryRef.current.setIndex(null);
    if (scene) {
      const positions = scene.children
        .map((child) => {
          if (child instanceof Mesh) {
            return child.geometry.attributes.position;
          }
        })
        .filter((position) => position !== undefined);
      particles.maxCount = Math.max(
        ...positions.map((position) => position.count)
      );
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
      for (let i = 0; i < particles.maxCount; i++) {
        const i3 = i * 3;
        // випадковий напрямок (можна нормалізувати, але не обов'язково)
        randomArray[i3 + 0] = Math.random() * 2 - 1;
        randomArray[i3 + 1] = Math.random() * 2 - 1;
        randomArray[i3 + 2] = Math.random() * 2 - 1;
        sizesArray[i] = Math.random();
      }

      geometryRef.current.setAttribute(
        "aRandom",
        new Float32BufferAttribute(randomArray, 3)
      );
      geometryRef.current.setAttribute(
        "aSize",
        new Float32BufferAttribute(sizesArray, 1)
      );

      geometryRef.current.setAttribute(
        "position",
        particles.positions[particleIndex.current]
      );
    }
  }, [scene, particles]);

  useFrame((state) => {
    const mat = shaderCustomMaterialRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return (
    <>
      <points frustumCulled={false} geometry={geometryRef.current} scale={10}>
        <shaderCustomMaterial ref={shaderCustomMaterialRef} />
      </points>
    </>
  );
};

export default ParticleMorphing;
