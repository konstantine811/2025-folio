import { lazy } from "react";

const HomePage = lazy(() => import("@components/page-partials/pages/Home"));
const ExperimentalPage = lazy(
  () => import("@components/page-partials/pages/Experimental")
);
const BlogPage = lazy(
  () => import("@/components/page-partials/pages/blog/Blog")
);

export const router = [
  {
    path: "/",
    Component: HomePage,
    id: "home",
  },
  {
    path: "/experimental",
    Component: ExperimentalPage,
    id: "experimental",
  },
  {
    path: "/blog",
    Component: BlogPage,
    id: "blog",
  },
];
