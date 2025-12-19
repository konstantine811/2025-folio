import { shaderMaterial, useTexture } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Texture } from "three";
import { useParticleStore } from "./storage/particle-storage";

const vertexShader = /* glsl */ `
    uniform vec2 uResolution;
    uniform sampler2D uTexture;
    uniform sampler2D uDisplacementTexture;
    varying vec3 vColor;

    void main()
    {
        // Displacement
        vec3 newPosition = position;
        float displacementIntensity = texture2D(uDisplacementTexture, uv).r;
        vec3 displacement = vec3(0.0, 0.0, 1.0);
        displacement *= displacementIntensity;
        displacement *= 3.0;
        newPosition += displacement;
        // Final position
        vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        gl_Position = projectedPosition;
        // Picture
        float pictureIntensity = texture2D(uTexture, uv).r;
        vColor = vec3(pow(pictureIntensity, 2.0));
        // Point size
        gl_PointSize = 0.15 * uResolution.y * pictureIntensity;
        gl_PointSize *= (1.0 / - viewPosition.z);
    }`;

const fragmentShader = /* glsl */ `

    varying vec3 vColor;

    void main()
        {
            vec2 uv = gl_PointCoord;
            float distanceToCenter = length(uv - vec2(0.5));
            if (distanceToCenter > 0.5) {
                discard;
            }
            gl_FragColor = vec4(vColor, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
        }
    `;

const ParticleMaterial = shaderMaterial(
  {
    uResolution: [window.innerWidth, window.innerHeight],
    uTexture: null as Texture | null,
    uDisplacementTexture: null as Texture | null,
  },
  vertexShader,
  fragmentShader
);

extend({ ParticleMaterial });

const Particle = () => {
  const texture = useTexture("/images/textures/picture-2.png");
  const displacementTexture = useParticleStore((s) => s.displacementTexture);
  return (
    <points>
      <planeGeometry args={[10, 10, 128, 128]} />
      <particleMaterial
        wireframe
        uTexture={texture}
        uDisplacementTexture={displacementTexture}
      />
    </points>
  );
};

export default Particle;
