import { buildTile, BuildTileMeshProps } from "@/lib/three/tile/build-tile";
import { init } from "recast-navigation";

let ready = false;

const inbox: BuildTileMeshProps[] = [];

self.onmessage = (msg) => {
  if (ready) {
    process(msg.data);
  } else {
    inbox.push(msg.data);
  }
};

const process = (props: BuildTileMeshProps) => {
  const result = buildTile(props);

  if (!result.success || !result.data) return;

  const navMeshData = result.data.toTypedArray();

  result.data.destroy();

  self.postMessage(
    { tileX: props.tileX, tileY: props.tileY, navMeshData: navMeshData },
    [navMeshData.buffer] as never
  ); // todo: type woes
};

init().then(() => {
  ready = true;

  for (const job of inbox) {
    process(job);
  }
});
