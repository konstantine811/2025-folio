import { lazy, type ComponentType, type LazyExoticComponent } from "react";

type Routable = ComponentType<object>;

export function lazyPage<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>,
): LazyExoticComponent<Routable> {
  return lazy(loader) as LazyExoticComponent<Routable>;
}
