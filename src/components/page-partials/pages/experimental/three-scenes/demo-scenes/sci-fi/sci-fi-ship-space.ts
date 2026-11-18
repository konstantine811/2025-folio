import { createContext } from "react";
import type { Group } from "three";

/** World-space cable geometry belongs to the same presentation root as the room. */
export const SciFiShipSpace = createContext<Group | null>(null);
