import { createContext } from "react";

interface RemoteContextProps {
  mode: string;
  setMode: (mode: string) => void;
}
export const RemoteContext = createContext<RemoteContextProps | null>(null);
