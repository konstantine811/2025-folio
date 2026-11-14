import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RapierRigidBody, RigidBody, interactionGroups, useBeforePhysicsStep, useRapier } from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import { Euler, Group, MathUtils, Quaternion, Vector3 } from "three";
import { useControlStore } from "@/components/common/game-controller/store/control-game-store";
import { CAPACITY, PLACES, STOPS, cargoCount } from "./economy/simulation";
import { actorPosition, closestPlace, distance2D, useBusinessStore, vehicleRuntime } from "./economy/store";

export function DeliveryVan() {
  const body = useRef<RapierRigidBody>(null);
  const visual = useRef<Group>(null);
  const initialPose = useMemo(() => ({ position: [...vehicleRuntime.position] as [number, number, number], yaw: vehicleRuntime.yaw }), []);
  const yaw = useRef(initialPose.yaw);
  const speed = useRef(0);
  const wait = useRef(0);
  const shift = useRef(0);
  const rest = useRef(0);
  const cameraLook = useRef({ yaw: 0, pitch: 0.15 });
  const { world } = useRapier();
  const [quaternion, position, target, rotation] = useMemo(() => [new Quaternion(), new Vector3(), new Vector3(), new Euler(0, 0, 0, "YXZ")], []);
  const load = useBusinessStore(s => cargoCount(s.state));
  const driving = useBusinessStore(s => s.driving);
  const autoDriver = useBusinessStore(s => s.state.autoDriver);
  const parked = useRef({ camExcludeCollision: true });

  useEffect(() => {
    const look = (event: MouseEvent) => {
      if (!useBusinessStore.getState().driving || useBusinessStore.getState().phoneOpen || !document.pointerLockElement) return;
      cameraLook.current.yaw -= event.movementX * 0.002;
      cameraLook.current.pitch = MathUtils.clamp(cameraLook.current.pitch + event.movementY * 0.002, -0.6, 1);
    };
    document.addEventListener("mousemove", look);
    return () => document.removeEventListener("mousemove", look);
  }, []);
  useEffect(() => { cameraLook.current = { yaw: 0, pitch: 0.15 }; }, [driving]);

  useBeforePhysicsStep(() => {
    const rb = body.current;
    if (!rb) return;
    const store = useBusinessStore.getState();
    const dt = world.timestep;
    const p = rb.translation();
    let desiredSpeed = 0;
    if (store.driving && !store.phoneOpen) {
      const input = useControlStore.getState();
      desiredSpeed = input.jump ? 0 : input.forward ? input.run ? 18 : 13 : input.backward ? -6 : 0;
      const steering = Number(input.leftward) - Number(input.rightward);
      yaw.current += steering * Math.min(Math.abs(speed.current) / 3, 1) * Math.sign(speed.current || 1) * dt * 1.6;
    } else if (store.state.autoDriver && !store.phoneOpen) {
      rest.current = Math.max(0, rest.current - dt);
      if (rest.current === 0) {
        shift.current += dt;
        if (shift.current >= 240) {
          shift.current = 0; rest.current = 30;
          store.dispatch({ type: "message", text: "Водій на 30-секундній перерві. Після відпочинку повернеться на маршрут." });
        } else if (wait.current > 0) wait.current -= dt;
        else {
          const [x, z] = PLACES[STOPS[store.state.driverStop]].point;
          const dx = x - p.x, dz = z - p.z;
          const distance = Math.hypot(dx, dz);
          if (distance < 1.5) {
            store.dispatch({ type: "arrive" }); wait.current = 2;
          } else {
            const angle = Math.atan2(dx, dz);
            yaw.current = angle;
            desiredSpeed = Math.min(9, distance * 2);
          }
        }
      }
    }
    speed.current = MathUtils.damp(speed.current, desiredSpeed, desiredSpeed ? 2.8 : 8, dt);
    if (Math.abs(speed.current) < 0.05) speed.current = 0;
    quaternion.setFromAxisAngle(new Vector3(0, 1, 0), yaw.current);
    rb.setRotation(quaternion, true);
    rb.setLinvel({ x: Math.sin(yaw.current) * speed.current, y: rb.linvel().y, z: Math.cos(yaw.current) * speed.current }, true);
    if (p.y < -3) {
      rb.setTranslation({ x: 0, y: 1.1, z: -20 }, true); speed.current = 0;
      store.dispatch({ type: "message", text: "Фургон повернуто до гаража після виїзду за межі району." });
    }
  });

  const probe = useRef(0);
  useFrame(({ camera }, dt) => {
    const rb = body.current;
    if (!rb) return;
    const p = rb.translation();
    vehicleRuntime.position = [p.x, p.y, p.z];
    vehicleRuntime.yaw = yaw.current;
    vehicleRuntime.speed = speed.current;
    const store = useBusinessStore.getState();
    if (store.driving && !store.phoneOpen) {
      if (visual.current) visual.current.getWorldPosition(position);
      else position.set(p.x, p.y, p.z);
      const viewYaw = yaw.current + cameraLook.current.yaw;
      if (store.cameraMode === "first-person") {
        target.set(0, 0.9, 1.2).applyAxisAngle(new Vector3(0, 1, 0), yaw.current).add(position);
        camera.position.copy(target);
        camera.rotation.copy(rotation.set(-cameraLook.current.pitch, viewYaw + Math.PI, 0, "YXZ"));
      } else {
        target.set(-Math.sin(viewYaw) * 9, 4 + cameraLook.current.pitch * 5, -Math.cos(viewYaw) * 9).add(position);
        camera.position.lerp(target, 1 - Math.exp(-8 * dt));
        camera.lookAt(position.x, position.y + 1, position.z);
      }
    }
    probe.current += dt;
    if (probe.current > 0.15) {
      probe.current = 0;
      const nearby = closestPlace();
      const nearVan = !store.driving && distance2D(actorPosition(), vehicleRuntime.position) < 5;
      if (nearby !== store.nearby || nearVan !== store.nearVan) useBusinessStore.setState({ nearby, nearVan });
    }
  });

  return <RigidBody ref={body} position={initialPose.position} rotation={[0, initialPose.yaw, 0]} mass={500} colliders={false}
    enabledRotations={[false, false, false]} linearDamping={0.2} friction={0.6} restitution={0} ccd userData={parked.current}>
    <CuboidCollider args={[1.05, 1.08, 2.2]} collisionGroups={interactionGroups(2, [0, 1])} />
    <group ref={visual}>
      <mesh castShadow receiveShadow><boxGeometry args={[2.1, 1.7, 4.4]} /><meshStandardMaterial color="#ddc38a" roughness={0.7} /></mesh>
      <mesh position={[0, 0.7, 1.05]} castShadow><boxGeometry args={[2.05, 1.2, 1.9]} /><meshStandardMaterial color="#e7d4a9" /></mesh>
      <mesh position={[0, 0.95, 2.02]}><boxGeometry args={[1.75, 0.65, 0.04]} /><meshStandardMaterial color="#a4c5c1" transparent opacity={0.25} /></mesh>
      {[-1.04, 1.04].map(x => <mesh key={x} position={[x, 0.95, 1.1]}><boxGeometry args={[0.03, 0.65, 1.3]} /><meshStandardMaterial color="#90b3b0" transparent opacity={0.3} /></mesh>)}
      <mesh position={[0, 0.35, 2.22]}><boxGeometry args={[1.8, 0.3, 0.06]} /><meshStandardMaterial color="#334c45" /></mesh>
      {[-0.7, 0.7].map(x => <mesh key={x} position={[x, 0.65, 2.23]}><boxGeometry args={[0.35, 0.25, 0.08]} /><meshStandardMaterial color="#fff0bd" emissive="#ffe1a0" emissiveIntensity={0.3} /></mesh>)}
      {[-1.07, 1.07].flatMap(x => [-1.4, 1.4].map(z => <mesh key={`${x}-${z}`} position={[x, -0.58, z]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.5, 0.5, 0.25, 12]} /><meshStandardMaterial color="#303c37" /></mesh>))}
      {Array.from({ length: Math.ceil(load / (CAPACITY / 4)) }, (_, i) => <mesh key={i} position={[(i % 2 ? 1 : -1) * 0.45, 1, -0.4 - Math.floor(i / 2) * 0.9]} castShadow><boxGeometry args={[0.8, 0.65, 0.8]} /><meshStandardMaterial color="#9f7946" /></mesh>)}
      {(driving || autoDriver) && <mesh position={[-0.5, 0.65, 1.1]}><sphereGeometry args={[0.24, 10, 8]} /><meshStandardMaterial color="#dcb58c" /></mesh>}
      <mesh position={[0, 0.3, -2.22]}><boxGeometry args={[1.8, 0.2, 0.06]} /><meshStandardMaterial color="#40584e" /></mesh>
    </group>
  </RigidBody>;
}
