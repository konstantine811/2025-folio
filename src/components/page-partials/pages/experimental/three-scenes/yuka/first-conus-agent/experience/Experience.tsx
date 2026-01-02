import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Matrix4, Mesh, Object3D, Vector3 } from "three";
import * as Yuka from "yuka";

const points = [
  new Vector3(-5, 0, -5),
  new Vector3(-10, 0, 10),
  new Vector3(0, 0, 2.5),
  new Vector3(20, 0, 20),
];

const Experience = () => {
  const vehicleMeshRef = useRef<Mesh>(null);

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

  // Sync-функція: копіюємо worldMatrix Yuka → matrix Three
  const sync = useMemo(
    () => (entity: Yuka.GameEntity, renderComponent: Object3D) => {
      renderComponent.matrix.copy(entity.worldMatrix as unknown as Matrix4);
      renderComponent.matrixAutoUpdate = false;
    },
    []
  );

  // Привʼязуємо Mesh-и до Yuka-сутностей
  useEffect(() => {
    if (vehicleMeshRef.current) {
      vehicleMeshRef.current.matrixAutoUpdate = true;

      vehicle.setRenderComponent(vehicleMeshRef.current, sync);
      vehicle.position.copy(
        new Yuka.Vector3(points[0].x, points[0].y, points[0].z)
      );
    }
  }, [sync, vehicle, entityManager]);

  useFrame(() => {
    if (entityManager) {
      const yukaDelta = yDelta.update().getDelta();
      entityManager.update(yukaDelta);
    }
  });
  return (
    <group>
      <group ref={vehicleMeshRef}>
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
