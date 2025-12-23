import { shaderMaterial, useGLTF } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import {
  AdditiveBlending,
  Mesh,
  Vector2,
  Float32BufferAttribute,
  BufferGeometry,
  SphereGeometry,
  ShaderMaterial,
} from "three";
import { useEffect, useMemo, useRef } from "react";
import { button, useControls } from "leva";
import simplexNoise3dShader from "./shaders/simplexNoise3d.glsl?raw";

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
    void main()
    {
        // Mixed position
        float noiseOrigin = simplexNoise3d(position * 0.2);
        float noiseTarget = simplexNoise3d(aPositionTarget * 0.2);
        float noise = mix(noiseOrigin, noiseTarget, uProgress);
        noise = smoothstep(-1.0, 1.0, noiseOrigin);

        float duration = 0.4;
        float delay = (1.0 - duration) * noise;
        float end = delay + duration;
        float progress = smoothstep(delay, end, uProgress);
        // Varyings
        vColor = vec3(noise);
        vec3 mixedPosition = mix(position, aPositionTarget, progress);
        // Final position
        vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        gl_Position = projectedPosition;

        // Point size
        gl_PointSize = uSize * uResolution.y;
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
    uSize: 0.1,
    uResolution: new Vector2(
      sizes.width * sizes.pixelRatio,
      sizes.height * sizes.pixelRatio
    ),
    blending: AdditiveBlending,
    depthWrite: false,
    uProgress: 0,
  },
  vertexShader,
  fragmentShader
);

extend({ ShaderCustomMaterial });

const ParticleMorphing = () => {
  const { scene } = useGLTF("/3d-models/models.glb");
  const geometryRef = useRef<BufferGeometry>(new SphereGeometry(30, 64, 64));
  const shaderCustomMaterialRef = useRef<ShaderMaterial>(null);
  const particleIndex = useRef(0);
  useControls({
    particleMorphFirst: button(() => {
      onMorphing(particleIndex.current, 0);
      particleIndex.current = 0;
    }),
    particleMorphSecond: button(() => {
      onMorphing(particleIndex.current, 1);
      particleIndex.current = 1;
    }),
    particleMorphThird: button(() => {
      onMorphing(particleIndex.current, 2);
      particleIndex.current = 2;
    }),
    particleMorphFourth: button(() => {
      onMorphing(particleIndex.current, 3);
      particleIndex.current = 3;
    }),
  });
  const particles = useMemo(() => {
    return {
      maxCount: 0,
      positions: [] as Float32BufferAttribute[],
      geometry: new BufferGeometry(),
    };
  }, []);

  const onMorphing = (prevIndex: number, nextIndex: number) => {
    geometryRef.current.setAttribute(
      "position",
      particles.positions[prevIndex]
    );
    geometryRef.current.setAttribute(
      "aPositionTarget",
      particles.positions[nextIndex]
    );
  };

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
      geometryRef.current.setAttribute(
        "position",
        particles.positions[particleIndex.current]
      );
    }
  }, [scene, particles]);
  return (
    <>
      <points geometry={geometryRef.current}>
        <shaderCustomMaterial ref={shaderCustomMaterialRef} />
      </points>
    </>
  );
};

export default ParticleMorphing;
