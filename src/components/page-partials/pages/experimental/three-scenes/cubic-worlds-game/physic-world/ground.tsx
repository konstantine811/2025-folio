import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import { Mesh, PlaneGeometry } from "three";
import { useGameDataStore } from "./character-controller/stores/game-data-store";
// import { ThreeEvent } from "@react-three/fiber";
// import { button, useControls } from "leva";
import useTouchTexture from "@/hooks/three-world/useTouchTexture";
// import { useTexture } from "@react-three/drei";
import { useEditModeStore } from "../store/useEditModeStore";

const Ground = () => {
  const { width, height } = { width: 100, height: 100 };
  // const [isDrawing, setIsDrawing] = useState(false);
  // const [cursorPos, setCurPos] = useState(new Vector3());
  // const textureMap = useTexture("/images/textures/grassTexture.jpg");
  const setTargetMesh = useEditModeStore((s) => s.setTargets);
  const floorRef = useRef<Mesh<PlaneGeometry>>(null!);
  const setCharacterGroundMesh = useGameDataStore(
    (s) => s.setCharacterGroundMesh
  );
  useEffect(() => {
    if (floorRef.current) {
      setCharacterGroundMesh(floorRef.current);
      setTargetMesh(floorRef.current);
    }
  }, [floorRef, setCharacterGroundMesh, setTargetMesh]);

  // // --- Leva ---
  // const [controls] = useControls("🎨 Paint", () => ({
  //   drawMode: { value: false, label: "Draw mode" },
  //   persist: { value: true, label: "Persist" },
  //   radius: {
  //     value: 0.005,
  //     min: 0.001,
  //     max: 0.05,
  //     step: 0.001,
  //     label: "Radius (UV)",
  //   },
  //   testCanvas: { value: false, label: "Show debug canvas" },
  //   saveNow: button(() => saveAsDataURL("touchTexture.png", true)),
  //   clear: button(() => clear()),
  // }));

  // const { onPointerMove, clear, saveAsDataURL } = useTouchTexture({
  //   size: 256,
  //   radius: controls.radius,
  //   persist: controls.persist,
  //   isTest: controls.testCanvas,
  // });

  // // Автозбереження при вимкненні режиму малювання
  // const prevDraw = useRef(controls.drawMode);
  // useEffect(() => {
  //   if (prevDraw.current && !controls.drawMode) {
  //     // Вийшли з режиму → зберегти
  //     saveAsDataURL("touchTexture.png", true);
  //   }
  //   prevDraw.current = controls.drawMode;
  // }, [controls.drawMode, saveAsDataURL]);

  // // Якщо змінюємо persist або radius в Leva — просто перерендер, хук уже бере нові значення

  // // Обчислення радіусу курсора у світових одиницях під площину (грубе узгодження з UV)
  // const worldCursorRadius = (width + height) * 0.5 * controls.radius; // припущення: UV (0..1) на ширину/висоту

  // const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
  //   if (!controls.drawMode) return;
  //   setIsDrawing(true);
  //   e.stopPropagation();
  // };

  // const handlePointerUpOrOut = (e?: ThreeEvent<PointerEvent>) => {
  //   if (!controls.drawMode) return;
  //   setIsDrawing(false);
  //   if (e) e.stopPropagation();
  // };

  // const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
  //   if (!controls.drawMode) return;
  //   if (e.point) setCurPos(new Vector3().copy(e.point));
  //   if (isDrawing) onPointerMove(e);
  // };
  return (
    <>
      <group>
        {/* ПІДЛОГА: обов'язково з UV (PlaneGeometry має їх за замовчуванням) */}
        <RigidBody userData={{ isGround: true }} type="fixed">
          <mesh
            ref={floorRef}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            castShadow
            // onPointerDown={handlePointerDown}
            // onPointerUp={handlePointerUpOrOut}
            // onPointerLeave={handlePointerUpOrOut}
            // onPointerMove={handlePointerMove}
          >
            <planeGeometry args={[width, height, 1, 1]} />
            {/* ДЕМО-матеріал: накладаємо карту як map, щоб бачити мазки.
У вашому проєкті, ймовірно, передаватимете texture як uniform у шейдер або як alphaMap. */}
            <meshStandardMaterial color="#FFBF74" />
          </mesh>
        </RigidBody>

        {/* КОЛО-КУРСОР, що слідує за мишею, коли drawMode=true */}
        {/* {controls.drawMode && (
          <mesh position={cursorPos} rotation-x={-Math.PI / 2}>
            <ringGeometry
              args={[
                Math.max(0.0001, worldCursorRadius * 0.6),
                Math.max(0.00015, worldCursorRadius),
                48,
              ]}
            />
            <meshBasicMaterial transparent opacity={0.6} />
          </mesh>
        )} */}
      </group>
    </>
  );
};

export default Ground;
