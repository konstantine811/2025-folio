import { shaderMaterial, useTexture } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Texture, BufferAttribute } from "three";
import { useMemo } from "react";
import { useRaycastGeometryStore } from "@/components/common/three/raycast-geometry/storage/raycast-storage";

const vertexShader = /* glsl */ `
    uniform vec2 uResolution;
    uniform sampler2D uTexture;
    uniform sampler2D uDisplacementTexture;
    varying vec3 vColor;
    attribute float aIntensity;
    attribute float aAngle;

    void main()
    {
        // Displacement
        vec3 newPosition = position;
        float displacementIntensity = texture2D(uDisplacementTexture, uv).r;
        displacementIntensity = smoothstep(0.1, 1.0, displacementIntensity);
        vec3 displacement = vec3(cos(aAngle) * 0.2, sin(aAngle) * 0.2, 1.0);
        displacement = normalize(displacement);
        displacement *= displacementIntensity;
        displacement *= 3.0;
        displacement *= aIntensity;
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
  const displacementTexture = useRaycastGeometryStore(
    (s) => s.displacementTexture
  );

  // Calculate vertex count: (widthSegments + 1) * (heightSegments + 1)
  const widthSegments = 1128;
  const heightSegments = 1128;
  const vertexCount = (widthSegments + 1) * (heightSegments + 1);

  // Create intensity array for the geometry
  const { intensities: intensitiesArray, angles: anglesArray } = useMemo(() => {
    const intensities = new Float32Array(vertexCount);
    const angles = new Float32Array(vertexCount);
    for (let i = 0; i < vertexCount; i++) {
      intensities[i] = Math.random();
      angles[i] = Math.random() * Math.PI * 2;
    }
    return { intensities, angles };
  }, [vertexCount]);

  return (
    <points>
      <planeGeometry
        args={[10, 10, widthSegments, heightSegments]}
        onUpdate={(geometry) => {
          // Remove indices (convert to non-indexed geometry)
          geometry.setIndex(null);

          // Delete normal attribute
          geometry.deleteAttribute("normal");

          // Add custom attributes
          if (!geometry.attributes.aIntensity) {
            geometry.setAttribute(
              "aIntensity",
              new BufferAttribute(intensitiesArray, 1)
            );
          }
          if (!geometry.attributes.aAngle) {
            geometry.setAttribute(
              "aAngle",
              new BufferAttribute(anglesArray, 1)
            );
          }
        }}
      />
      <particleMaterial
        uTexture={texture}
        uDisplacementTexture={displacementTexture}
      />
    </points>
  );
};

export default Particle;
