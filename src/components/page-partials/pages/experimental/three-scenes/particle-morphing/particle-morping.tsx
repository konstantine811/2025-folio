import { shaderMaterial, useGLTF } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import {
  AdditiveBlending,
  Mesh,
  Vector2,
  Float32BufferAttribute,
  BufferGeometry,
  SphereGeometry,
} from "three";
import { useEffect, useRef } from "react";

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
};

const vertexShader = /* glsl */ `
    uniform vec2 uResolution;
    uniform float uSize;

    void main()
    {
        // Final position
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        gl_Position = projectedPosition;

        // Point size
        gl_PointSize = uSize * uResolution.y;
        gl_PointSize *= (1.0 / - viewPosition.z);
    }`;

const fragmentShader = /* glsl */ `
    void main()
        {
            vec2 uv = gl_PointCoord;
            float distanceToCenter = length(uv - 0.5);
            float alpha = 0.05 / distanceToCenter - 0.1;
            gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
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
  },
  vertexShader,
  fragmentShader
);

extend({ ShaderCustomMaterial });

const ParticleMorphing = () => {
  const { scene } = useGLTF("/3d-models/models.glb");
  const geometryRef = useRef<BufferGeometry>(new SphereGeometry(30, 64, 64));
  useEffect(() => {
    geometryRef.current.setIndex(null);
    if (scene) {
      const particles = {
        maxCount: 0,
        positions: [] as Float32BufferAttribute[],
        geometry: new BufferGeometry(),
      };
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
      particles.geometry.setAttribute("position", particles.positions[0]);
      geometryRef.current.setAttribute("position", particles.positions[1]);
      console.log("particles", particles);
    }
  }, [scene]);
  return (
    <>
      <points geometry={geometryRef.current}>
        <shaderCustomMaterial />
      </points>
    </>
  );
};

export default ParticleMorphing;
