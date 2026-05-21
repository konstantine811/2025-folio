/**
 * Three.js game demos — add new entries here (or run `npm run new:three-game`).
 * Routes are merged into EXPERIMENTAL_ROUTERS automatically.
 */
import { lazyPage } from "@/config/lazy-page";
import { AppRoute } from "@/types/route";
import { ComponentType } from "react";
import { ExperimentalTypes } from "./experimental-types";

export type ThreeGameDemoDefinition = {
  /** URL segment under /labs/ */
  slug: string;
  /** Folder name under three-scenes/games/ */
  folder: string;
  /** Unique route id */
  id: string;
  description: string;
  icon: string;
  /** File name under images/three-views-scene/page_images/ (without extension) */
  imageName: string;
  imageFormat?: "jpg" | "png" | "webp";
};

/** Static loaders — Vite must see full import paths. */
const gameLoaders: Record<
  string,
  () => Promise<{ default: ComponentType<object> }>
> = {
  "sim-city-game": () =>
    import(
      "@/components/page-partials/pages/experimental/three-scenes/games/sim-city-game/init"
    ),
  "stylized-world": () =>
    import(
      "@/components/page-partials/pages/experimental/three-scenes/games/stylized-world/init"
    ),
};

export const THREE_GAME_DEMOS: ThreeGameDemoDefinition[] = [
  {
    slug: "three-sim-city-game",
    folder: "sim-city-game",
    id: "experimental-three-sim-city-game",
    icon: "🎥",
    description: "A sim city game scene created with Three.js.",
    imageName: "sim-city-game",
  },
  {
    slug: "three-stylized-world",
    folder: "stylized-world",
    id: "experimental-three-stylized-world",
    icon: "🌿",
    description: "Stylized procedural bush scene with custom shaders.",
    imageName: "stylized-world",
  },
];

const pageImage = (imageName: string, format: ThreeGameDemoDefinition["imageFormat"] = "jpg") =>
  `images/three-views-scene/page_images/${imageName}.${format}`;

export function buildThreeGameDemoRoutes(): AppRoute[] {
  return THREE_GAME_DEMOS.map((demo) => {
    const loader = gameLoaders[demo.folder];

    if (!loader) {
      throw new Error(
        `Missing game loader for folder "${demo.folder}". Add it to gameLoaders in three-game-demos.registry.ts`,
      );
    }

    return {
      path: demo.slug,
      Component: lazyPage(loader),
      id: demo.id,
      icon: demo.icon,
      description: demo.description,
      imageUrl: pageImage(demo.imageName, demo.imageFormat),
      type: ExperimentalTypes.games,
    };
  });
}

export const THREE_GAME_DEMO_ROUTES = buildThreeGameDemoRoutes();
