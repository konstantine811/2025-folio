import {
  RenderMode,
  VFXEmitterSettings,
  VFXSettings,
} from "@/types/three/vfx-particles.model";
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  Color,
  DynamicDrawUsage,
  Euler,
  InstancedMesh,
  Matrix4,
  PlaneGeometry,
  Quaternion,
  ShaderMaterial,
  Texture,
  Vector3,
} from "three";
import { useVFXStore } from "./vfx-store";

const tmpPosition = new Vector3();
const tmpRotationEuler = new Euler();
const tmpRotation = new Quaternion();
const tmpScale = new Vector3(1, 1, 1);
const tmpMatrix = new Matrix4();
const tmpColor = new Color();

const VFXParticles = ({
  settings,
  name,
  alphaMap,
  geometry,
}: {
  settings: Partial<VFXSettings>;
  name: string;
  alphaMap?: Texture;
  geometry?: ReactNode;
}) => {
  const {
    nbParticles = 1000,
    intensity = 1,
    renderMode = RenderMode.mesh,
    fadeSize = [0.1, 0.9],
    fadeAlpha = [0, 1.0],
    gravity = [0, 0, 0],
  } = settings;
  const mesh = useRef<InstancedMesh>(null);
  const defaultGeometry = useMemo(() => new PlaneGeometry(0.5, 0.5), []);
  const registerEmitter = useVFXStore((state) => state.registerEmitter);
  const unRegisterEmitter = useVFXStore((state) => state.unRegisterEmitter);
  const [attributeArrays] = useState({
    instanceColor: new Float32Array(nbParticles * 3),
    instanceColorEnd: new Float32Array(nbParticles * 3),
    instanceDirection: new Float32Array(nbParticles * 3),
    instanceLifetime: new Float32Array(nbParticles * 2),
    instanceSpeed: new Float32Array(nbParticles * 1),
    instanceRotationSpeed: new Float32Array(nbParticles * 3),
  });
  const cursor = useRef(0);
  const lastCursor = useRef(0);
  const needsUpdate = useRef(false);

  const onBeforeRender = () => {
    if (!needsUpdate.current || !mesh.current) {
      return;
    }
    const meshCur = mesh.current;
    const meshCurGeometry = meshCur.geometry;
    const attributes = [
      meshCur.instanceMatrix,
      meshCurGeometry.getAttribute("instanceColor") as BufferAttribute,
      meshCurGeometry.getAttribute("instanceColorEnd") as BufferAttribute,
      meshCurGeometry.getAttribute("instanceDirection") as BufferAttribute,
      meshCurGeometry.getAttribute("instanceLifetime") as BufferAttribute,
      meshCurGeometry.getAttribute("instanceSpeed") as BufferAttribute,
      meshCurGeometry.getAttribute("instanceRotationSpeed") as BufferAttribute,
    ];
    attributes.forEach((attribute) => {
      attribute.clearUpdateRanges();
      if (lastCursor.current > cursor.current) {
        attribute.addUpdateRange(0, cursor.current * attribute.itemSize);
        attribute.addUpdateRange(
          lastCursor.current * attribute.itemSize,
          nbParticles * attribute.itemSize -
            lastCursor.current * attribute.itemSize
        );
      } else {
        attribute.addUpdateRange(
          lastCursor.current * attribute.itemSize,
          cursor.current * attribute.itemSize -
            lastCursor.current * attribute.itemSize
        );
      }
      attribute.needsUpdate = true;
    });
    lastCursor.current = cursor.current;
    needsUpdate.current = false;
  };
  const emit = useCallback(
    (count: number, setup: () => VFXEmitterSettings) => {
      if (mesh.current) {
        const instanceColor =
          mesh.current.geometry.getAttribute("instanceColor");
        const instanceColorEnd =
          mesh.current.geometry.getAttribute("instanceColorEnd");
        const instanceDirection =
          mesh.current.geometry.getAttribute("instanceDirection");
        const instanceLifetime =
          mesh.current.geometry.getAttribute("instanceLifetime");
        const instanceSpeed =
          mesh.current.geometry.getAttribute("instanceSpeed");
        const instanceRotationSpeed = mesh.current.geometry.getAttribute(
          "instanceRotationSpeed"
        );
        for (let i = 0; i < count; i++) {
          if (cursor.current >= nbParticles) {
            cursor.current = 0;
          }
          const {
            position,
            scale,
            rotation,
            direction,
            lifeTime,
            speed,
            rotationSpeed,
            colorEnd,
            colorStart,
          } = setup();

          tmpPosition.set(...position);
          tmpRotationEuler.set(...rotation);
          tmpRotation.setFromEuler(tmpRotationEuler);
          tmpScale.set(...scale);
          tmpMatrix.compose(tmpPosition, tmpRotation, tmpScale);
          mesh.current.setMatrixAt(cursor.current, tmpMatrix);
          tmpColor.set(colorStart);
          instanceColor.setXYZ(
            cursor.current,
            tmpColor.r,
            tmpColor.g,
            tmpColor.b
          );

          tmpColor.set(colorEnd);
          instanceColorEnd.setXYZ(
            cursor.current,
            tmpColor.r,
            tmpColor.g,
            tmpColor.b
          );
          instanceDirection.setXYZ(cursor.current, ...direction);
          instanceLifetime.setXY(cursor.current, ...lifeTime);
          instanceSpeed.setX(cursor.current, speed);
          instanceRotationSpeed.setXYZ(cursor.current, ...rotationSpeed);
          cursor.current++;
          cursor.current = cursor.current % nbParticles;
        }
        needsUpdate.current = true;
      }
    },
    [nbParticles]
  );

  useFrame(({ clock }) => {
    if (mesh.current) {
      const material = mesh.current.material as ShaderMaterial;
      material.uniforms.uTime.value = clock.elapsedTime;
      material.uniforms.uIntensity.value = intensity;
      material.uniforms.uFadeSize.value = fadeSize;
      material.uniforms.uFadeAlpha.value = fadeAlpha;
      material.uniforms.uGravity.value = gravity;
    }
  });

  useEffect(() => {
    //emit(nbParticles);
    registerEmitter(name, emit);
    return () => {
      unRegisterEmitter(name);
    };
  }, [nbParticles, emit, name, registerEmitter, unRegisterEmitter]);

  return (
    <>
      <instancedMesh
        args={[defaultGeometry, undefined, nbParticles]}
        ref={mesh}
        onBeforeRender={onBeforeRender}
      >
        {geometry}
        <particlesMaterial
          blending={AdditiveBlending}
          transparent
          alphaMap={alphaMap}
          defines={{
            BILLBOARD_MODE: renderMode === RenderMode.billboard,
            MESH_MODE: renderMode === RenderMode.mesh,
          }}
          depthWrite={false}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceColor"}
          args={[attributeArrays.instanceColor, 3]}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceColorEnd"}
          args={[attributeArrays.instanceColorEnd, 3]}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceDirection"}
          args={[attributeArrays.instanceDirection, 3]}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceLifetime"}
          args={[attributeArrays.instanceLifetime, 2]}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceSpeed"}
          args={[attributeArrays.instanceSpeed, 1]}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
        <instancedBufferAttribute
          attach={"geometry-attributes-instanceRotationSpeed"}
          args={[attributeArrays.instanceRotationSpeed, 3]}
          count={nbParticles}
          usage={DynamicDrawUsage}
        />
      </instancedMesh>
    </>
  );
};

export default VFXParticles;

const ParticlesMaterial = shaderMaterial(
  {
    uTime: 0,
    uIntensity: 1,
    uFadeSize: [0.1, 0.9],
    uFadeAlpha: [0, 1.0],
    uGravity: [0, 0, 0],
    alphaMap: null,
  },
  /*glsl*/ `
    uniform float uTime;
    uniform vec2 uFadeSize;
    uniform vec3 uGravity;

    varying vec2 vUv;
    varying vec3 vColor;
    varying vec3 vColorEnd;
    varying float vProgress;

    attribute float instanceSpeed;
    attribute vec3 instanceRotationSpeed;
    attribute vec3 instanceDirection;
    attribute vec3 instanceColor;
    attribute vec3 instanceColorEnd;
    attribute vec2 instanceLifetime; // x: startTime, y: endTime


    mat4 rotationX(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat4(
          1,  0,  0,  0,
          0,  c, -s,  0,
          0,  s,  c,  0,
          0,  0,  0,  1
      );
    }

    mat4 rotationY(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat4(
          c,  0,  s,  0,
          0,  1,  0,  0,
          -s,  0,  c,  0,
          0,  0,  0,  1
      );
    }

    mat4 rotationZ(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat4(
          c, -s,  0,  0,
          s,  c,  0,  0,
          0,  0,  1,  0,
          0,  0,  0,  1
      );
    }

    vec3 billboard(vec2 v, mat4 view) {
      vec3 up = vec3(view[0][1], view[1][1], view[2][1]);
      vec3 right = vec3(view[0][0], view[1][0], view[2][0]);
      vec3 p = right * v.x + up * v.y;
      return p;
    }

    void main() {
        float startTime = instanceLifetime.x;
        float duration = instanceLifetime.y;
        float age = uTime - startTime;
        vProgress =  age / duration;

        if(vProgress < 0.0 || vProgress > 1.0) {
          gl_Position = vec4(vec3(9999.0), 1.0);
          return;
        }

        float scale = smoothstep(0.0, uFadeSize.x, vProgress) * smoothstep(1.01, uFadeSize.y, vProgress);

        vec3 rotationSpeed = instanceRotationSpeed * age;

        mat4 rotX = rotationX(rotationSpeed.x);
        mat4 rotY = rotationY(rotationSpeed.y);
        mat4 rotZ = rotationZ(rotationSpeed.z);
        mat4 rotationMatrix = rotX * rotY * rotZ;

        vec3 normalizedDirection = length(instanceDirection) > 0.0 ? normalize(instanceDirection) : vec3(0.0);
        vec3 gravityForce = 0.5 * uGravity * (age * age);
        vec3 offset = normalizedDirection * age * instanceSpeed;
        offset += gravityForce;

       
        vec4 mvPosition;

        #ifdef MESH_MODE
        // Mesh mode
           vec4 startPosition = modelMatrix * instanceMatrix * rotationMatrix * vec4(position * scale, 1.0);
            
           vec3 instancePosition = startPosition.xyz;
           
           vec3 finalPosition = instancePosition + offset;
           mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
        #endif

        #ifdef BILLBOARD_MODE
        // Billboard mode
        vec4 localPos = vec4(position, 1.0);
        localPos.xyz = billboard(position.xy, viewMatrix) * scale;

        vec4 worldPos = modelMatrix * instanceMatrix * rotationMatrix * localPos;
        worldPos.xyz += offset; // Apply offset in world space
        mvPosition = modelViewMatrix * worldPos;
        #endif

        gl_Position = projectionMatrix * mvPosition;
        vUv = uv;
        vColor = instanceColor;
        vColorEnd = instanceColorEnd;
    }
    `,
  /*glsl*/ `
        varying vec2 vUv;
        varying vec3 vColor;
        varying vec3 vColorEnd;
        varying float vProgress;
        uniform float uIntensity;
        uniform vec2 uFadeAlpha;
        uniform sampler2D alphaMap;

        void main() {
          if(vProgress < 0.0 || vProgress > 1.0) {
            discard;
          }
          vec3 finalColor = mix(vColor, vColorEnd, vProgress);
          float alpha = smoothstep(0.0, uFadeAlpha.x, vProgress) * smoothstep(1.01, uFadeAlpha.y, vProgress);
          finalColor *= uIntensity;

          #ifdef USE_ALPHAMAP
            vec2 uv = vUv;
            vec4 tex = texture2D(alphaMap, uv);
            gl_FragColor = vec4(finalColor, tex.a * alpha);
          #else 
           gl_FragColor = vec4(finalColor, alpha);
          #endif
        }
    `
);

extend({ ParticlesMaterial });
