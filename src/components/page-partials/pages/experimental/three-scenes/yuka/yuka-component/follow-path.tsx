import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { Group, Matrix4, Object3D, Vector3 } from "three";
import * as Yuka from "yuka";

const sync = (entity: Yuka.GameEntity, renderComponent: Object3D) => {
  renderComponent.matrix.copy(entity.worldMatrix as unknown as Matrix4);
  renderComponent.matrixAutoUpdate = false;
};

const FollowPath = ({
  points,
  maxSpeed = 10,
  nextWaypointDistance = 5.5,
  pathRadius = 0.1,
  isDebug = false,
  children,
}: {
  points: Vector3[];
  maxSpeed?: number;
  isDebug?: boolean;
  nextWaypointDistance?: number;
  pathRadius?: number;
  children: React.ReactNode;
}) => {
  const vehicleMeshRef = useRef<Group>(null);

  const { entityManager, vehicle, yDelta, path } = useMemo(() => {
    const entityManager = new Yuka.EntityManager();

    const vehicle = new Yuka.Vehicle();
    vehicle.maxSpeed = maxSpeed;

    const path = new Yuka.Path();
    points.forEach((point) =>
      path.add(new Yuka.Vector3(point.x, point.y, point.z))
    );
    path.loop = true;
    vehicle.position.copy(path.current());
    const followBehavior = new Yuka.FollowPathBehavior(
      path,
      nextWaypointDistance
    );
    vehicle.steering.add(followBehavior);

    const onPathBehavior = new Yuka.OnPathBehavior(path);
    onPathBehavior.radius = pathRadius;
    vehicle.steering.add(onPathBehavior);

    entityManager.add(vehicle);
    const yDelta = new Yuka.Time();

    return { entityManager, vehicle, yDelta, path };
  }, [points, maxSpeed, nextWaypointDistance, pathRadius]);

  // Привʼязуємо Mesh-и до Yuka-сутностей
  useEffect(() => {
    if (vehicleMeshRef.current) {
      // Встановлюємо render component
      vehicle.setRenderComponent(vehicleMeshRef.current, sync);
      yDelta.reset();
    }
  }, [vehicle, entityManager, path, yDelta]);

  useFrame(() => {
    if (entityManager) {
      const yukaDelta = yDelta.update().getDelta();
      entityManager.update(yukaDelta);
    }
  });
  return (
    <group>
      <group ref={vehicleMeshRef}>{children}</group>
      {isDebug && (
        <Line
          points={points}
          lineWidth={2} // у більшості браузерів працює “як є”, інколи обмежено
          dashed={false}
        />
      )}
    </group>
  );
};

export default FollowPath;
