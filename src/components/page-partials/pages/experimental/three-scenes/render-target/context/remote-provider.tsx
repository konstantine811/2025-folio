import { useState } from "react";
import { RemoteContext } from "./remote-context";

const RemoteProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState("tv");
  return (
    <RemoteContext.Provider value={{ mode, setMode }}>
      {children}
    </RemoteContext.Provider>
  );
};

export default RemoteProvider;
