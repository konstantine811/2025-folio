import { VFXSettings } from "@/types/three/vfx-particles.model";
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  Color,
  DynamicDrawUsage,
  Euler,
  InstancedMesh,
  Matrix4,
  PlaneGeometry,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from "three";
import { randFloat, randFloatSpread } from "three/src/math/MathUtils.js";
import { useVFXStore } from "./vfx-store";

const tmpPosition = new Vector3();
const tmpRotationEuler = new Euler();
const tmpRotation = new Quaternion();
const tmpScale = new Vector3(1, 1, 1);
const tmpMatrix = new Matrix4();
const tmpColor = new Color();

const ParticlesMaterial = shaderMaterial(
  {
    uTime: 0,
  },
  /*glsl*/ `
    uniform float uTime;

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

    void main() {
        float startTime = instanceLifetime.x;
        float duration = instanceLifetime.y;
        float age = uTime - startTime;
        vProgress =  age / duration;

        vec3 rotationSpeed = instanceRotationSpeed * age;

        mat4 rotX = rotationX(rotationSpeed.x);
        mat4 rotY = rotationY(rotationSpeed.y);
        mat4 rotZ = rotationZ(rotationSpeed.z);
        mat4 rotationMatrix = rotX * rotY * rotZ;

        vec3 normalizedDirection = length(instanceDirection) > 0.0 ? normalize(instanceDirection) : vec3(0.0);
        vec3 offset = normalizedDirection * age * instanceSpeed;

        vec4 startPosition = modelMatrix * instanceMatrix * rotationMatrix * vec4(position, 1.0);
        vec3 instancePosition = startPosition.xyz;
        vec3 finalPosition = instancePosition + offset;
        vec4 mvPosition = modelViewMatrix * vec4(finalPosition, 1.0);
        

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

        void main() {
          if(vProgress < 0.0 || vProgress > 1.0) {
            discard;
          }
          vec3 finalColor = mix(vColor, vColorEnd, vProgress);
          gl_FragColor = vec4(finalColor, 1.0);
        }
    `
);

extend({ ParticlesMaterial });

const VFXParticles = ({
  settings,
  name,
}: {
  settings: VFXSettings;
  name: string;
}) => {
  const { nbParticles = 1000 } = settings;
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

  const emit = useCallback(
    ({ nbParticles: count }: VFXSettings) => {
      if (mesh.current && count) {
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
          const position = [
            randFloatSpread(0.1),
            randFloatSpread(0.1),
            randFloatSpread(0.1),
          ] as [number, number, number];
          const scale = [
            randFloatSpread(1),
            randFloatSpread(1),
            randFloatSpread(1),
          ] as [number, number, number];
          const rotation = [
            randFloatSpread(Math.PI),
            randFloatSpread(Math.PI),
            randFloatSpread(Math.PI),
          ] as [number, number, number];
          tmpColor.setRGB(1, 1, 1);
          instanceColor.setXYZ(
            cursor.current * 3,
            tmpColor.r,
            tmpColor.g,
            tmpColor.b
          );

          tmpColor.setRGB(0, 0, 0);
          instanceColorEnd.setXYZ(
            cursor.current * 3,
            tmpColor.r,
            tmpColor.g,
            tmpColor.b
          );

          const direction = [randFloatSpread(0.5), 1, randFloatSpread(0.5)] as [
            number,
            number,
            number
          ];
          instanceDirection.setXYZ(cursor.current * 3, ...direction);

          const lifetime = [randFloat(0, 5), randFloat(0.1, 5)] as [
            number,
            number
          ];
          instanceLifetime.setXY(cursor.current * 2, ...lifetime);

          const speed = randFloat(1, 5);
          instanceSpeed.setX(cursor.current * 1, speed);

          const rotationSpeed = [
            randFloatSpread(1),
            randFloatSpread(1),
            randFloatSpread(1),
          ] as [number, number, number];
          instanceRotationSpeed.setXYZ(cursor.current * 3, ...rotationSpeed);

          tmpPosition.set(...position);
          tmpRotationEuler.set(...rotation);
          tmpRotation.setFromEuler(tmpRotationEuler);
          tmpScale.set(...scale);
          tmpMatrix.compose(tmpPosition, tmpRotation, tmpScale);
          if (mesh.current) {
            mesh.current.setMatrixAt(cursor.current, tmpMatrix);
          }
          cursor.current++;
          cursor.current = cursor.current % nbParticles;
        }
        mesh.current.instanceMatrix.needsUpdate = true;
        instanceColor.needsUpdate = true;
        instanceColorEnd.needsUpdate = true;
        instanceDirection.needsUpdate = true;
        instanceLifetime.needsUpdate = true;
        instanceSpeed.needsUpdate = true;
        instanceRotationSpeed.needsUpdate = true;
      }
    },
    [nbParticles]
  );

  useFrame(({ clock }) => {
    if (mesh.current) {
      const material = mesh.current.material as ShaderMaterial;
      material.uniforms.uTime.value = clock.elapsedTime;
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
      >
        <particlesMaterial
          blending={AdditiveBlending}
          transparent
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
