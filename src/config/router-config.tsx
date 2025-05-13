import { lazy } from "react";

const HomePage = lazy(() => import("../components/page-partials/pages/Home"));
const ExperimentalPage = lazy(
  () => import("../components/page-partials/pages/Experimental")
);
const BlogPage = lazy(
  () => import("../components/page-partials/pages/blog/Blog")
);

const ArticlePage = lazy(
  () => import("../components/page-partials/pages/blog/Article")
);

export enum RoutPath {
  HOME = "/",
  EXPERIMENTAL = "/experimental",
  BLOG = "/blog",
  ARTICLE = "/blog/:id",
}

export const DEFAULT_LOCALE_PLUG = "https://custom.local";
export const DEFAULT_OBSIDIAN_VAULT = {
  blogVault: "Blog",
};

export const router = [
  {
    path: RoutPath.HOME,
    Component: HomePage,
    isNav: true,
    id: "home",
  },
  {
    path: RoutPath.EXPERIMENTAL,
    Component: ExperimentalPage,
    isNav: true,
    id: "experimental",
  },
  {
    path: RoutPath.BLOG,
    Component: BlogPage,
    isNav: true,
    id: "blog",
  },
  {
    path: RoutPath.ARTICLE,
    Component: ArticlePage,
    isNav: false,
    id: "article",
  },
  {
    path: "*",
    Component: HomePage,
    isNav: false,
    id: "not-found",
  },
];
