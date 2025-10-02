import CubicWorldFolio from "@components/page-partials/pages/experimental/three-scenes/cubic-worlds-game/init";
const Home = () => {
  const uid = import.meta.env.VITE_CONSTANTINE_UID;
  return <CubicWorldFolio uid={uid} isEditMode={false} isGameStarted={false} />;
};

export default Home;
