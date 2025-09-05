import { createPortal } from "@react-three/fiber";
import { useGameDataStore } from "../controllers/stores/game-data-store";
import { Glasses } from "../staff/glasses";

const AttachCharacterStaff = () => {
  const nodes = useGameDataStore((s) => s.characterNodes);
  console.log("nodes in attach", nodes);
  return (
    <>
      {nodes.mixamorigHead &&
        createPortal(
          <Glasses position={[-0.001, 0.159, 0.103]} />,
          nodes.mixamorigHead
        )}
    </>
  );
};

export default AttachCharacterStaff;
