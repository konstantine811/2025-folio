import { init, exportNavMesh } from "recast-navigation";
import { generateSoloNavMesh } from "recast-navigation/generators";

export type SoloNavMeshConfig = {
  cs?: number;
  ch?: number;
  walkableSlopeAngle?: number;
  walkableHeight?: number;
  walkableClimb?: number;
  walkableRadius?: number;
};

type InMessage = {
  positions: Float32Array;
  indices: Uint32Array;
  config: SoloNavMeshConfig;
};

let ready = false;
const queue: MessageEvent<InMessage>[] = [];

function process(data: InMessage) {
  const { positions, indices, config } = data;
  const { success, navMesh } = generateSoloNavMesh(positions, indices, config);
  if (!success || !navMesh) {
    self.postMessage({ success: false });
    return;
  }
  const navMeshExport = exportNavMesh(navMesh);
  navMesh.destroy();
  self.postMessage(
    { success: true, navMeshExport },
    { transfer: [navMeshExport.buffer] },
  );
}

self.onmessage = (event: MessageEvent<InMessage>) => {
  if (ready) {
    process(event.data);
  } else {
    queue.push(event);
  }
};

init().then(() => {
  ready = true;
  queue.forEach((e) => process(e.data));
});
