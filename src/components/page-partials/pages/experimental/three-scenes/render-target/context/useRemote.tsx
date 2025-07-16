import { useContext } from "react";
import { RemoteContext } from "./remote-context";

const useRemote = () => {
  const context = useContext(RemoteContext);
  if (!context) {
    throw new Error("useRemote must be used within a RemoteProvider");
  }
  return context;
};

export default useRemote;
