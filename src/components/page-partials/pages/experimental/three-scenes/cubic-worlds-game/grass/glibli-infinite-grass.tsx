import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Mesh,
  ShaderMaterial,
  Side,
  Texture,
  Vector2,
  Vector3,
} from "three";
// import { MeshSurfaceSampler } from "three/examples/jsm/Addons.js";
import { mapLinear, randFloat } from "three/src/math/MathUtils.js";
import { useGameDataStore } from "../physic-world/character-controller/stores/game-data-store";

const GlibliGrassMaterial = shaderMaterial(
  {
    uTime: 0,
    uNoiseTexture: null,
    uDiffuseMap: null,
    uPlayerPosition: new Vector3(),
    uHeightMap: null,
    uBoundingBoxMin: new Vector3(),
    uBoundingBoxMax: new Vector3(),
    uPatchSize: 20, // необов’язково, але лишаю для сумісності
    uBladeWidth: 0.08,
    uWindDirection: Math.PI * 0.25,
    uWindSpeed: 0.3,
    uWindNoiseScale: 0.9,
    uBaldPatchModifier: 2.5,
    uFalloffSharpness: 0.35,
    uHeightNoiseFrequency: 12,
    uHeightNoiseAmplitude: 3,
    uMaxBendAngle: 22,
    uMaxBladeHeight: 0.35,
    uRandomHeightAmount: 0.25,
  },
  /*glsl*/ `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec2 vHeightUv;
    uniform float uBladeWidth;
    uniform float uPatchSize;
    uniform vec3 uPlayerPosition;
    uniform vec3 uBoundingBoxMin;
    uniform vec3 uBoundingBoxMax;
    uniform sampler2D uHeightMap;

    attribute vec3 aBladeOrigin;
    attribute vec3 color;
    attribute vec3 aYaw; 

    float map(float value, float inMin, float inMax, float outMin, float outMax) {
        return mix(outMin, outMax, (value - inMin) / (inMax - inMin));
    }

    void main() {
        vUv = uv;
            // Start with the original position of the vertex
        vec3 transformed = position;
        vec3 origin = aBladeOrigin;

        // Reposition Blades for Infinite Sliding Window

        float halfPatchSize = uPatchSize * 0.5;
        origin.x = mod(origin.x - uPlayerPosition.x + halfPatchSize, uPatchSize) - halfPatchSize;
        origin.z = mod(origin.z - uPlayerPosition.z + halfPatchSize, uPatchSize) - halfPatchSize;

        vec3 worldPos = uPlayerPosition + origin;

        vec2 bboxSize = max(uBoundingBoxMax.xz - uBoundingBoxMin.xz, vec2(1e-6));
        vec2 heightUv = (worldPos.xz - uBoundingBoxMin.xz) / bboxSize; // 0..1 всередині боксу

        vec2 uv = vec2(
            map(uPlayerPosition.x + origin.x, uBoundingBoxMin.x, uBoundingBoxMax.x, 0.0, 1.0),
            map(uPlayerPosition.z + origin.z, uBoundingBoxMin.z, uBoundingBoxMax.z, 0.0, 1.0)
        );

         vHeightUv = clamp(heightUv, 0.0, 1.0);
       vec3 c = texture2D(uHeightMap, vHeightUv).rgb;

        // sRGB -> linear (точно)
        vec3 lin = mix(c/12.92,
                    pow((c+0.055)/1.055, vec3(2.4)),
                    step(0.04045, c));

        // висота: 0 на чисто червоному, 1 на чисто зеленому, 0.5 на жовтому
        float sumRG = lin.r + lin.g;
        float height = (sumRG > 1e-6) ? (lin.g / sumRG) : 0.0; // захист від ділення на 0

        // Далі використовуй height як треба:
        transformed.y += color.g * height;
        transformed.x = origin.x;
        transformed.z = origin.z;

        // Determine a factor based on the red and blue channels of the color
        // If red is 0.1, factor is 1.0
        // If blue is 0.1, factor is -1.0
        // Otherwise, factor is 0.0
        float factor = (color.r == 0.1) ? 1.0 : (color.b == 0.1) ? -1.0 : 0.0;

        // Calculate the width of the blade based on a uniform variable
        float width = uBladeWidth * .1;

        // Offset the position based on the calculated width and factor
        transformed += aYaw * (width / 2.0) * factor;


        vec4 modelPosition = modelMatrix * vec4(transformed, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        gl_Position = projectedPosition;
    }
  `,
  /*glsl*/ `
    uniform sampler2D uHeightMap;
    varying vec2 vUv;
    varying vec2 vHeightUv;
    void main() {
        // gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
         vec3 h = texture2D(uHeightMap, vHeightUv).rgb;
        gl_FragColor = vec4(h, 1.0);
    }
  `
);

extend({ GlibliGrassMaterial });

type Props = {
  landscapeMesh: Mesh;
  count?: number;
  patchSize?: number;
  bladeWidth?: number;
  bladeHeight?: number;
  materialSide?: Side;
  textures?: {
    noise?: Texture;
    diffuse?: Texture;
    heightMap?: Texture;
  };
};

const GlibliInfiniteGrass = ({
  bladeWidth = 0.8,
  bladeHeight = 1.25,
  count = 2000,
  landscapeMesh,
  patchSize = 10,
  textures,
}: Props) => {
  console.log("textures", textures);
  const matRef = useRef<ShaderMaterial>(null);
  const meshRef = useRef<Mesh>(null);
  const characterRef = useGameDataStore((s) => s.characterRigidBody);
  // гарантуємо bbox
  useMemo(() => {
    if (!landscapeMesh.geometry.boundingBox) {
      landscapeMesh.geometry.computeBoundingBox();
    }
  }, [landscapeMesh]);

  // семплер по поверхні ландшафту
  // const sampler = useMemo(
  //   () => new MeshSurfaceSampler(landscapeMesh).build(),
  //   [landscapeMesh]
  // );

  // генеруємо велику геометрію: по 3 вершини на травинку
  const geometry = useMemo(() => {
    const uv = new Vector2();
    const positions: number[] = [];
    const uvs: number[] = [];
    const colors: number[] = [];
    const yaws: number[] = [];
    const bladeOrigins: number[] = [];
    const yawUnitVec = new Vector3();
    const currentPosition = new Vector3();
    const indices: number[] = [];

    const bbox = landscapeMesh.geometry.boundingBox!;
    for (let i = 0; i < count; i++) {
      currentPosition.set(
        randFloat(-patchSize * 0.5, patchSize * 0.5),
        0,
        randFloat(-patchSize * 0.5, patchSize * 0.5)
      );

      uv.set(
        mapLinear(currentPosition.x, bbox.min.x, bbox.max.x, 0, 1),
        mapLinear(currentPosition.z, bbox.min.z, bbox.max.z, 0, 1)
      );

      const yaw = Math.random() * Math.PI * 2;
      yawUnitVec.set(Math.sin(yaw), 0, -Math.cos(yaw));

      const bl = currentPosition;
      const br = currentPosition;
      const tc = currentPosition;

      const verts = [
        { pos: bl.toArray(), color: [0.1, 0, 0] },
        { pos: br.toArray(), color: [0, 0, 0.1] },
        { pos: tc.toArray(), color: [1, 1, 1] },
      ];

      const vertexCount = verts.length;

      const vArrOffset = i * vertexCount;

      verts.forEach((vert) => {
        positions.push(...vert.pos);
        colors.push(...vert.color);
        uvs.push(...uv.toArray());
        yaws.push(...yawUnitVec);
        bladeOrigins.push(...currentPosition.toArray());
      });

      // Add indices
      indices.push(vArrOffset, vArrOffset + 1, vArrOffset + 2);
    }

    const geom = new BufferGeometry();
    geom.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(positions), 3)
    );
    geom.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
    geom.setAttribute(
      "color",
      new BufferAttribute(new Float32Array(colors), 3)
    );
    geom.setAttribute("aYaw", new BufferAttribute(new Float32Array(yaws), 3));
    geom.setAttribute(
      "aBladeOrigin",
      new BufferAttribute(new Float32Array(bladeOrigins), 3)
    );
    geom.computeVertexNormals();
    return geom;
  }, [count, landscapeMesh, patchSize]);

  useFrame(({ clock }) => {
    if (characterRef) {
      const t = characterRef.translation();
      if (matRef.current) {
        matRef.current.uniforms.uTime.value = clock.elapsedTime;
        matRef.current.uniforms.uPlayerPosition.value = t;
      }
      if (meshRef.current && characterRef) {
        meshRef.current.position.x = t.x;
        meshRef.current.position.z = t.z;
      }
    }
  });
  return (
    <mesh ref={meshRef} geometry={geometry} frustumCulled={false}>
      {/* тимчасовий простий матеріал, щоб упевнитись, що рендериться */}
      <glibliGrassMaterial
        side={DoubleSide}
        ref={matRef}
        attach="material"
        uPatchSize={patchSize}
        uBladeWidth={bladeWidth}
        uBladeHeight={bladeHeight}
        uBoundingBoxMax={landscapeMesh.geometry.boundingBox?.max.toArray()}
        uBoundingBoxMin={landscapeMesh.geometry.boundingBox?.min.toArray()}
        uHeightMap={textures?.heightMap}
        uNoiseTexture={textures?.noise}
        uDiffuseMap={textures?.diffuse}
      />
    </mesh>
  );
};

export default GlibliInfiniteGrass;
