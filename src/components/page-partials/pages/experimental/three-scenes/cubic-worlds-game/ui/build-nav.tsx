import { Html } from "@react-three/drei";
import { useNav } from "../nav-mesh/useNavMesh";

function Panel() {
  const meshesCount = useNav((s) => s.meshes.length);
  const isBuilt = useNav((s) => s.isBuilt);
  const build = useNav((s) => s.buildStable);

  return (
    <Html position={[0, 2, 0]} center wrapperClass="pointer-events-none">
      <div className="pointer-events-auto text-xs bg-white/80 backdrop-blur rounded-xl shadow px-3 py-2">
        <div className="font-semibold mb-1">NavMesh Builder</div>
        <div>Meshes: {meshesCount}</div>
        <div>Status: {isBuilt ? "built" : "idle"}</div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => {
              build();
            }}
            className="px-2 py-1 rounded bg-black text-white"
          >
            Build
          </button>
          {/* <button
            onClick={() => dispose()}
            className="px-2 py-1 rounded bg-neutral-200"
          >
            Reset
          </button> */}
        </div>
      </div>
    </Html>
  );
}

export default Panel;
