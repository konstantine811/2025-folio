import { ComponentType, LazyExoticComponent, ReactNode } from "react";

type Routable = ComponentType<object>; // ✅ будь-які об’єктні пропси (без any)

export type AppRoute = {
  path: string;
  Component: LazyExoticComponent<Routable> | Routable; // ✅
  isNav?: boolean;
  id: string;
  children?: AppRoute[];
  icon?: ReactNode; // краще ніж ReactElement | string
  isDev?: boolean;
  imageUrl?: string;
  description?: string;
  classes?: {
    linkCircle?: string;
  };
};
