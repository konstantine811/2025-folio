import { CameraControls, CameraControlsImpl, Environment } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import GUI from "lil-gui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import { Plane, PlaneGeometry, Raycaster, Vector2, Vector3 } from "three";
import type { GrassGroundDataBinding } from "./ground-data";
import { DEFAULT_GRASS_GROUND_DATA_BINDING } from "./ground-data";
import {
  createGrassStreamSnap,
  updateGrassStreamSnap,
} from "./grass/grass-stream-snap";
import { GroundDataSystem } from "./ground-data-system";
import { InfiniteStylizedWorld } from "./infinite-stylized-world";
import {
  STYLIZED_CAR_GRASS_PUSH_RADIUS,
  StylizedCarController,
} from "./stylized-car-controller";
import { StylizedWorldGround } from "./stylized-world-ground";
import { StylizedWorldTestCourse } from "./stylized-world-test-course";
import { useWheelContactHistory } from "./use-wheel-contact-history";
import {
  addTerrainStroke,
  clearTerrainStrokes,
  sampleGroundTerrainHeight,
  type TerrainStroke,
  type TerrainProfile,
} from "./ground-terrain";

type StylizedWorldControls = {
  windStrength: number;
  windSpeed: number;
  bushesPerTile: number;
  viewRadius: number;
  showGridDebug: boolean;
  showTestCourse: boolean;
  showGrass: boolean;
  grassBladeHeight: number;
  grassClumpSize: number;
  grassClumpBlend: number;
  grassDensity: number;
  grassStraightness: number;
  grassHeightVariation: number;
  grassBladeRandomness: number;
  grassWidthRandomness: number;
  grassBendRandomness: number;
  grassWindFacing: number;
  grassWindDistanceStart: number;
  grassWindDistanceEnd: number;
  grassDebugLod: boolean;
  accelerateForce: number;
  brakeForce: number;
  steerAngleDeg: number;
  isDebug: boolean;
  showWheelTrackDebug: boolean;
  terrainSeed: number;
  terrainHeightScale: number;
  terrainNoiseScale: number;
  terrainHillCellSize: number;
  editBrushRadius: number;
  editBrushStrength: number;
};

const DEFAULT_CONTROLS: StylizedWorldControls = {
  windStrength: 1,
  windSpeed: 0.05,
  bushesPerTile: 1,
  viewRadius: 6,
  showGridDebug: false,
  showTestCourse: true,
  showGrass: true,
  grassBladeHeight: 0.52,
  grassClumpSize: 0.8,
  grassClumpBlend: 0.2,
  grassDensity: 1,
  grassStraightness: 1,
  grassHeightVariation: 0.85,
  grassBladeRandomness: 0.3,
  grassWidthRandomness: 0.3,
  grassBendRandomness: 0.2,
  grassWindFacing: 0.6,
  grassWindDistanceStart: 10,
  grassWindDistanceEnd: 30,
  grassDebugLod: false,
  accelerateForce: 8.5,
  brakeForce: 0.08,
  steerAngleDeg: 34,
  isDebug: false,
  showWheelTrackDebug: false,
  terrainSeed: 42,
  terrainHeightScale: 0.58,
  terrainNoiseScale: 0.11,
  terrainHillCellSize: 18,
  editBrushRadius: 1.2,
  editBrushStrength: 0.22,
};

function samplePendingSculptHeight(
  worldX: number,
  worldZ: number,
  strokes: TerrainStroke[],
) {
  let sum = 0;
  for (const stroke of strokes) {
    const dx = worldX - stroke.x;
    const dz = worldZ - stroke.z;
    const distance = Math.hypot(dx, dz);
    if (distance > stroke.radius) continue;
    const t = 1 - distance / stroke.radius;
    sum += stroke.strength * t * t;
  }
  return sum;
}

function TerrainSketchSurface({
  focusRef,
  terrainSeed,
  terrainProfile,
  strokes,
}: {
  focusRef: MutableRefObject<Vector3>;
  terrainSeed: number;
  terrainProfile: TerrainProfile;
  strokes: TerrainStroke[];
}) {
  const geometry = useMemo(() => new PlaneGeometry(220, 220, 140, 140), []);

  useEffect(() => {
    const position = geometry.attributes.position;
    const centerX = focusRef.current.x;
    const centerZ = focusRef.current.z;

    for (let i = 0; i < position.count; i++) {
      const localX = position.getX(i);
      const localY = position.getY(i);
      const worldX = centerX + localX;
      const worldZ = centerZ - localY;
      const base = sampleGroundTerrainHeight({
        worldX,
        worldZ,
        seed: terrainSeed,
        profile: terrainProfile,
      });
      const sculpt = samplePendingSculptHeight(worldX, worldZ, strokes);
      position.setZ(i, base + sculpt + 0.01);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
  }, [geometry, focusRef, terrainSeed, terrainProfile, strokes]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      position={[focusRef.current.x, 0, focusRef.current.z]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial
        color="#8aa0a8"
        roughness={0.95}
        metalness={0}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

function TerrainEditMode({
  enabled,
  focusRef,
  brushRadius,
  brushStrength,
  terrainSeed,
  terrainProfile,
  strokes,
  spawnPosition,
  isSelectingSpawn,
  onStroke,
  onSelectSpawn,
}: {
  enabled: boolean;
  focusRef: MutableRefObject<Vector3>;
  brushRadius: number;
  brushStrength: number;
  terrainSeed: number;
  terrainProfile: TerrainProfile;
  strokes: TerrainStroke[];
  spawnPosition: [number, number, number];
  isSelectingSpawn: boolean;
  onStroke: (x: number, z: number, strength: number, radius: number) => void;
  onSelectSpawn: (x: number, z: number) => void;
}) {
  const { camera, gl } = useThree();
  const pointer = useMemo(() => new Vector2(), []);
  const raycaster = useMemo(() => new Raycaster(), []);
  const fallbackPlane = useMemo(
    () => new Plane(new Vector3(0, 1, 0), 0),
    [],
  );
  const fallbackPoint = useMemo(() => new Vector3(), []);
  const [cursor, setCursor] = useState<Vector3 | null>(null);
  const isDrawingRef = useRef(false);
  const lastStrokeRef = useRef<Vector3 | null>(null);
  const spacingRef = useRef(0.35);
  const cameraControlsRef = useRef<any>(null);
  const brushRadiusRef = useRef(brushRadius);
  const brushStrengthRef = useRef(brushStrength);
  const didInitCameraRef = useRef(false);

  useEffect(() => {
    brushRadiusRef.current = brushRadius;
    brushStrengthRef.current = brushStrength;
  }, [brushRadius, brushStrength]);

  useEffect(() => {
    if (!enabled) {
      setCursor(null);
      didInitCameraRef.current = false;
      return;
    }
    if (!didInitCameraRef.current) {
      // Enter from a convenient high angle once per editor session.
      cameraControlsRef.current?.setLookAt(
        focusRef.current.x + 10,
        22,
        focusRef.current.z + 10,
        focusRef.current.x,
        0,
        focusRef.current.z,
        true,
      );
      didInitCameraRef.current = true;
    }
    const controls = cameraControlsRef.current;
    if (controls) {
      controls.mouseButtons.left = CameraControlsImpl.ACTION.NONE;
      controls.mouseButtons.middle = CameraControlsImpl.ACTION.TRUCK;
      controls.mouseButtons.right = CameraControlsImpl.ACTION.ROTATE;
      controls.mouseButtons.wheel = CameraControlsImpl.ACTION.DOLLY;
    }

    const element = gl.domElement;

    const pickTerrainPoint = (clientX: number, clientY: number) => {
      const rect = element.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      // Cheap picking: use ground plane only (avoids expensive scene-wide raycast every move).
      if (raycaster.ray.intersectPlane(fallbackPlane, fallbackPoint)) {
        return fallbackPoint.clone();
      }

      return null;
    };

    const applyStrokeIfNeeded = (point: Vector3, shiftKey: boolean) => {
      const last = lastStrokeRef.current;
      if (last && last.distanceTo(point) < spacingRef.current) return;

      const signedStrength = shiftKey
        ? -brushStrengthRef.current
        : brushStrengthRef.current;
      onStroke(point.x, point.z, signedStrength, brushRadiusRef.current);
      lastStrokeRef.current = point.clone();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const point = pickTerrainPoint(event.clientX, event.clientY);
      if (!point) return;
      event.preventDefault();
      event.stopPropagation();
      if (isSelectingSpawn) {
        onSelectSpawn(point.x, point.z);
        setCursor(point);
        return;
      }
      isDrawingRef.current = true;
      setCursor(point);
      applyStrokeIfNeeded(point, event.shiftKey);
    };

    const onPointerMove = (event: PointerEvent) => {
      const point = pickTerrainPoint(event.clientX, event.clientY);
      if (!point) return;
      setCursor(point);
      if (!isDrawingRef.current || isSelectingSpawn) return;
      event.preventDefault();
      event.stopPropagation();
      applyStrokeIfNeeded(point, event.shiftKey);
    };

    const onPointerUp = () => {
      isDrawingRef.current = false;
      lastStrokeRef.current = null;
    };

    element.addEventListener("pointerdown", onPointerDown, { capture: true });
    element.addEventListener("pointermove", onPointerMove, { capture: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      element.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
      element.removeEventListener("pointermove", onPointerMove, {
        capture: true,
      });
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [enabled, gl, camera, onStroke, onSelectSpawn, isSelectingSpawn]);

  if (!enabled) return null;

  return (
    <>
      <CameraControls
        ref={cameraControlsRef}
        makeDefault
        enabled
        maxPolarAngle={Math.PI * 0.48}
        minDistance={3}
        maxDistance={180}
      />
      {cursor && (
        <mesh
          position={[cursor.x, cursor.y + 0.03, cursor.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={20}
        >
          <ringGeometry args={[Math.max(0.02, brushRadius - 0.03), brushRadius, 48]} />
          <meshBasicMaterial
            color="#7df6a5"
            transparent
            opacity={1}
            depthTest={false}
          />
        </mesh>
      )}
      <mesh
        position={[spawnPosition[0], spawnPosition[1] + 0.05, spawnPosition[2]]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={21}
      >
        <ringGeometry args={[0.42, 0.72, 4]} />
        <meshBasicMaterial
          color={isSelectingSpawn ? "#ffe27d" : "#7de2ff"}
          transparent
          opacity={1}
          depthTest={false}
        />
      </mesh>
      <TerrainSketchSurface
        focusRef={focusRef}
        terrainSeed={terrainSeed}
        terrainProfile={terrainProfile}
        strokes={strokes}
      />
    </>
  );
}

const Experience = () => {
  const [controls, setControls] =
    useState<StylizedWorldControls>(DEFAULT_CONTROLS);
  const [terrainRevision, setTerrainRevision] = useState(0);
  const [isTerrainEditMode, setIsTerrainEditMode] = useState(false);
  const [isSelectingSpawn, setIsSelectingSpawn] = useState(false);
  const [spawnPosition, setSpawnPosition] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [pendingTerrainStrokes, setPendingTerrainStrokes] = useState<TerrainStroke[]>([]);
  const pendingTerrainStrokesRef = useRef<TerrainStroke[]>([]);

  useEffect(() => {
    pendingTerrainStrokesRef.current = pendingTerrainStrokes;
  }, [pendingTerrainStrokes]);

  useEffect(() => {
    (window as Window & { __stylizedTerrainEditMode?: boolean }).__stylizedTerrainEditMode =
      isTerrainEditMode;
    if (isTerrainEditMode && document.pointerLockElement) {
      document.exitPointerLock();
    }
    return () => {
      (window as Window & { __stylizedTerrainEditMode?: boolean }).__stylizedTerrainEditMode =
        false;
    };
  }, [isTerrainEditMode]);

  const startLandscapeEditor = () => {
    setPendingTerrainStrokes([]);
    setIsTerrainEditMode(true);
    setIsSelectingSpawn(false);
  };

  const generateLandscapeFromSketch = useCallback(() => {
    clearTerrainStrokes();
    for (const stroke of pendingTerrainStrokesRef.current) {
      addTerrainStroke(stroke);
    }
    setTerrainRevision((v) => v + 1);
    setIsTerrainEditMode(false);
    setIsSelectingSpawn(false);
  }, []);

  const handleSketchStroke = useCallback(
    (x: number, z: number, strength: number, radius: number) => {
      setPendingTerrainStrokes((prev) => [...prev, { x, z, strength, radius }]);
    },
    [],
  );

  const handleSelectSpawn = useCallback((x: number, z: number) => {
    setSpawnPosition([x, 0, z]);
    setIsSelectingSpawn(false);
  }, []);

  useEffect(() => {
    const state = { ...DEFAULT_CONTROLS };
    const gui = new GUI({ title: "Stylized World" });

    const update = <K extends keyof StylizedWorldControls>(
      key: K,
      value: StylizedWorldControls[K],
    ) => {
      setControls((prev) => ({ ...prev, [key]: value }));
    };

    const worldFolder = gui.addFolder("World");
    worldFolder.add(state, "isDebug").name("Debug").onChange((v: boolean) => update("isDebug", v));
    worldFolder.add(state, "showTestCourse").name("Test course").onChange((v: boolean) => update("showTestCourse", v));
    worldFolder.add(state, "showGridDebug").name("Grid debug").onChange((v: boolean) => update("showGridDebug", v));
    worldFolder.add(state, "viewRadius", 3, 10, 1).name("View radius").onChange((v: number) => update("viewRadius", v));
    worldFolder.add(state, "bushesPerTile", 0, 16, 1).name("Bushes per tile").onChange((v: number) => update("bushesPerTile", v));

    const windFolder = gui.addFolder("Wind");
    windFolder.add(state, "windStrength", 0, 5, 0.05).name("Strength").onChange((v: number) => update("windStrength", v));
    windFolder.add(state, "windSpeed", 0, 0.2, 0.005).name("Speed").onChange((v: number) => update("windSpeed", v));

    const grassFolder = gui.addFolder("Grass");
    grassFolder.add(state, "showGrass").name("Visible").onChange((v: boolean) => update("showGrass", v));
    grassFolder.add(state, "grassDebugLod").name("LOD debug").onChange((v: boolean) => update("grassDebugLod", v));
    grassFolder.add(state, "grassBladeHeight", 0.2, 1.2, 0.02).name("Blade height").onChange((v: number) => update("grassBladeHeight", v));
    grassFolder.add(state, "grassClumpSize", 0.2, 2.5, 0.05).name("Clump size").onChange((v: number) => update("grassClumpSize", v));
    grassFolder.add(state, "grassClumpBlend", 0.05, 0.6, 0.01).name("Clump blend").onChange((v: number) => update("grassClumpBlend", v));
    grassFolder.add(state, "grassDensity", 0.1, 1, 0.01).name("Density").onChange((v: number) => update("grassDensity", v));
    grassFolder.add(state, "grassStraightness", 0, 1, 0.01).name("Straightness").onChange((v: number) => update("grassStraightness", v));
    grassFolder.add(state, "grassHeightVariation", 0, 1, 0.01).name("Height variation").onChange((v: number) => update("grassHeightVariation", v));
    grassFolder.add(state, "grassBladeRandomness", 0, 0.6, 0.01).name("Blade random X").onChange((v: number) => update("grassBladeRandomness", v));
    grassFolder.add(state, "grassWidthRandomness", 0, 0.6, 0.01).name("Blade random Y").onChange((v: number) => update("grassWidthRandomness", v));
    grassFolder.add(state, "grassBendRandomness", 0, 0.6, 0.01).name("Blade random Z").onChange((v: number) => update("grassBendRandomness", v));
    grassFolder.add(state, "grassWindFacing", 0, 1, 0.01).name("Wind facing").onChange((v: number) => update("grassWindFacing", v));
    grassFolder.add(state, "grassWindDistanceStart", 0, 80, 1).name("Wind fade start").onChange((v: number) => update("grassWindDistanceStart", v));
    grassFolder.add(state, "grassWindDistanceEnd", 1, 120, 1).name("Wind fade end").onChange((v: number) => update("grassWindDistanceEnd", v));

    const carFolder = gui.addFolder("Car");
    carFolder.add(state, "accelerateForce", 0.5, 10, 0.1).name("Accelerate force").onChange((v: number) => update("accelerateForce", v));
    carFolder.add(state, "brakeForce", 0.01, 0.5, 0.01).name("Brake force").onChange((v: number) => update("brakeForce", v));
    carFolder.add(state, "steerAngleDeg", 3, 62, 0.5).name("Steer angle").onChange((v: number) => update("steerAngleDeg", v));
    carFolder.add(state, "showWheelTrackDebug").name("Wheel track debug").onChange((v: boolean) => update("showWheelTrackDebug", v));

    const terrainFolder = gui.addFolder("Landscape generator");
    terrainFolder.add(state, "terrainSeed", 1, 9999, 1).name("Seed").onChange((v: number) => update("terrainSeed", Math.round(v)));
    terrainFolder.add(state, "terrainHeightScale", 0.05, 2.5, 0.01).name("Height strength").onChange((v: number) => update("terrainHeightScale", v));
    terrainFolder.add(state, "terrainNoiseScale", 0.01, 0.6, 0.005).name("Noise scale").onChange((v: number) => update("terrainNoiseScale", v));
    terrainFolder.add(state, "terrainHillCellSize", 4, 60, 1).name("Hill cell size").onChange((v: number) => update("terrainHillCellSize", Math.round(v)));
    terrainFolder.add(state, "editBrushRadius", 0.2, 20, 0.05).name("Brush radius").onChange((v: number) => update("editBrushRadius", v));
    terrainFolder.add(state, "editBrushStrength", 0.02, 1.2, 0.01).name("Brush strength").onChange((v: number) => update("editBrushStrength", v));
    terrainFolder
      .add(
        {
          startLandscapeEditor: () => {
            startLandscapeEditor();
          },
        },
        "startLandscapeEditor",
      )
      .name("Start landscape editor");
    terrainFolder
      .add(
        {
          pickSpawnPosition: () => {
            setIsTerrainEditMode(true);
            setIsSelectingSpawn(true);
          },
        },
        "pickSpawnPosition",
      )
      .name("Pick spawn position");
    terrainFolder
      .add(
        {
          generateLandscape: () => {
            generateLandscapeFromSketch();
          },
        },
        "generateLandscape",
      )
      .name("Generate landscape");
    terrainFolder
      .add(
        {
          exitLandscapeEditor: () => {
            setIsTerrainEditMode(false);
            setIsSelectingSpawn(false);
          },
        },
        "exitLandscapeEditor",
      )
      .name("Exit landscape editor");

    worldFolder.open();
    terrainFolder.open();

    return () => gui.destroy();
  }, []);

  const bush = useMemo(
    () => ({ windStrength: controls.windStrength, windSpeed: controls.windSpeed }),
    [controls.windStrength, controls.windSpeed],
  );

  const grass = useMemo(
    () => ({
      bladeHeightMin: controls.grassBladeHeight * 0.35,
      bladeHeightMax: controls.grassBladeHeight * 1.45,
      windSwayStrength: controls.windStrength * 0.85,
      windScale: 0.25,
      windSpeed: controls.windSpeed * 12,
      windStrength: controls.windStrength * 2.8,
      windFacing: controls.grassWindFacing,
      windDistanceStart: controls.grassWindDistanceStart,
      windDistanceEnd: Math.max(
        controls.grassWindDistanceStart + 1,
        controls.grassWindDistanceEnd,
      ),
      windDirX: 0.85,
      windDirZ: 0.35,
      pushRadius: STYLIZED_CAR_GRASS_PUSH_RADIUS,
      // Perimeter-based chassis interaction (not radial): edge bends, inside sags.
      pushAmount: 0,
      flattenAmount: 0,
      // Closer to physical chassis bounds so footprint is not overly wide.
      chassisHalfWidth: 0.62,
      chassisHalfLength: 1.06,
      chassisEdgeBand: 0.34,
      clumpSize: controls.grassClumpSize,
      clumpBlend: controls.grassClumpBlend,
      density: controls.grassDensity,
      straightness: controls.grassStraightness,
      // Keep grass anchored to terrain surface; random height variation causes visual float.
      heightVariation: 0,
      bladeRandomnessX: controls.grassBladeRandomness,
      bladeRandomnessY: controls.grassWidthRandomness,
      bladeRandomnessZ: controls.grassBendRandomness,
      terrainSeed: controls.terrainSeed,
      terrainRevision,
      terrainHeightScale: controls.terrainHeightScale,
      terrainNoiseScale: controls.terrainNoiseScale,
      terrainHillCellSize: controls.terrainHillCellSize,
      debugLod: controls.grassDebugLod,
    }),
    [
      controls.grassBladeHeight,
      controls.windStrength,
      controls.windSpeed,
      controls.grassClumpSize,
      controls.grassClumpBlend,
      controls.grassDensity,
      controls.grassStraightness,
      controls.grassBladeRandomness,
      controls.grassWidthRandomness,
      controls.grassBendRandomness,
      controls.grassWindFacing,
      controls.grassWindDistanceStart,
      controls.grassWindDistanceEnd,
      controls.grassDebugLod,
      controls.terrainSeed,
      terrainRevision,
      controls.terrainHeightScale,
      controls.terrainNoiseScale,
      controls.terrainHillCellSize,
    ],
  );

  const terrainProfile = useMemo<TerrainProfile>(
    () => ({
      heightScale: controls.terrainHeightScale,
      noiseScale: controls.terrainNoiseScale,
      hillCellSize: controls.terrainHillCellSize,
    }),
    [
      controls.terrainHeightScale,
      controls.terrainNoiseScale,
      controls.terrainHillCellSize,
    ],
  );

  const focusRef = useRef(new Vector3());
  const grassStreamSnapRef = useRef(createGrassStreamSnap());
  const grassInteractionRef = useRef(new Vector3(9999, 0, 9999));
  const grassGroundDataRef = useRef<GrassGroundDataBinding>({
    ...DEFAULT_GRASS_GROUND_DATA_BINDING,
  });
  const { historiesRef: wheelContactHistoriesRef } = useWheelContactHistory(4);
  const physicsRadius = controls.viewRadius + 4;
  const visualRadius = physicsRadius + 3;

  useFrame(() => {
    const focus = focusRef.current;
    updateGrassStreamSnap(grassStreamSnapRef.current, focus.x, focus.z);
  }, -1);

  return (
    <>
      <Environment preset="park" environmentIntensity={0.45} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 8, 3]} intensity={1.1} />

      <InfiniteStylizedWorld
        tileSize={8}
        radius={visualRadius}
        showGround={!isTerrainEditMode}
        bushesPerTile={isTerrainEditMode ? 0 : controls.bushesPerTile}
        bush={bush}
        grass={grass}
        showGrass={isTerrainEditMode ? false : controls.showGrass}
        showGridDebug={isTerrainEditMode ? false : controls.showGridDebug}
        focusRef={focusRef}
        streamSnapRef={grassStreamSnapRef}
        grassInteractionRef={grassInteractionRef}
        grassGroundDataRef={grassGroundDataRef}
        worldSeed={controls.terrainSeed}
        terrainProfile={terrainProfile}
        terrainRevision={terrainRevision}
      />

      {isTerrainEditMode ? (
        <TerrainEditMode
          enabled
          focusRef={focusRef}
          brushRadius={controls.editBrushRadius}
          brushStrength={controls.editBrushStrength}
          terrainSeed={controls.terrainSeed}
          terrainProfile={terrainProfile}
          strokes={pendingTerrainStrokes}
          spawnPosition={spawnPosition}
          isSelectingSpawn={isSelectingSpawn}
          onStroke={handleSketchStroke}
          onSelectSpawn={handleSelectSpawn}
        />
      ) : (
        <Physics
          debug={controls.isDebug}
          gravity={[0, -9.81, 0]}
          timeStep={1 / 60}
          interpolate
        >
          <GroundDataSystem
            streamSnapRef={grassStreamSnapRef}
            contactHistoriesRef={wheelContactHistoriesRef}
            grassGroundDataRef={grassGroundDataRef}
          />
          <StylizedWorldGround
            focusRef={focusRef}
            tileSize={8}
            radius={physicsRadius}
            worldSeed={controls.terrainSeed}
            terrainProfile={terrainProfile}
            terrainRevision={terrainRevision}
          />
          {controls.showTestCourse && <StylizedWorldTestCourse />}
          <StylizedCarController
            focusRef={focusRef}
            startPosition={spawnPosition}
            worldSeed={controls.terrainSeed}
            terrainProfile={terrainProfile}
            accelerateForce={controls.accelerateForce}
            brakeForce={controls.brakeForce}
            steerAngle={(controls.steerAngleDeg * Math.PI) / 180}
            showWheelTrackDebug={controls.showWheelTrackDebug}
            contactHistoriesRef={wheelContactHistoriesRef}
            grassInteractionRef={grassInteractionRef}
          />
        </Physics>
      )}
    </>
  );
};

export default Experience;
