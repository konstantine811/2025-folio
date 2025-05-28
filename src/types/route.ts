import { RoutPath } from "@/config/router-config";
import { ComponentType, LazyExoticComponent, ReactElement } from "react";

export type AppRoute = {
  path: RoutPath | string;
  Component: LazyExoticComponent<ComponentType> | (() => ReactElement);
  isNav: boolean;
  id: string;
  children?: AppRoute[];
  icon?: ReactElement | string;
};
