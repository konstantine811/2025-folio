import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Group, Matrix4, Object3D, Vector3 } from "three";
import * as Yuka from "yuka";

const points = [
  new Vector3(-5, 0, -5),
  new Vector3(-10, 0, 10),
  new Vector3(0, 0, 2.5),
  new Vector3(20, 0, 20),
  new Vector3(-5, 0, -5),
];

const sync = (entity: Yuka.GameEntity, renderComponent: Object3D) => {
  console.log(entity.worldMatrix);
  renderComponent.matrix.copy(entity.worldMatrix as unknown as Matrix4);
  renderComponent.matrixAutoUpdate = false;
};

const Experience = () => {
  const vehicleMeshRef = useRef<Group>(null);

  const { entityManager, vehicle, yDelta } = useMemo(() => {
    const entityManager = new Yuka.EntityManager();

    const vehicle = new Yuka.Vehicle();
    vehicle.maxSpeed = 10;

    const path = new Yuka.Path();
    points.forEach((point) =>
      path.add(new Yuka.Vector3(point.x, point.y, point.z))
    );
    path.loop = true;
    vehicle.position.copy(path.current());
    const followBehavior = new Yuka.FollowPathBehavior(path, 5.5);
    vehicle.steering.add(followBehavior);

    const onPathBehavior = new Yuka.OnPathBehavior(path);
    onPathBehavior.radius = 0.1;
    vehicle.steering.add(onPathBehavior);

    entityManager.add(vehicle);
    const yDelta = new Yuka.Time();

    return { entityManager, vehicle, yDelta };
  }, []);

  // Привʼязуємо Mesh-и до Yuka-сутностей
  useEffect(() => {
    if (vehicleMeshRef.current) {
      vehicle.setRenderComponent(vehicleMeshRef.current, sync);
    }
  }, [vehicle, entityManager]);

  useFrame(() => {
    if (entityManager) {
      const yukaDelta = yDelta.update().getDelta();
      entityManager.update(yukaDelta);
    }
  });
  return (
    <group>
      <group ref={vehicleMeshRef} position={points[0]}>
        <mesh rotation-x={Math.PI / 2}>
          <coneGeometry args={[0.7, 1.5, 8]} />
          <meshNormalMaterial />
        </mesh>
      </group>
      <Line
        points={points}
        lineWidth={2} // у більшості браузерів працює “як є”, інколи обмежено
        dashed={false}
      />
    </group>
  );
};

export default Experience;
