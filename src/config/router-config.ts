import { lazy } from "react";

const HomePage = lazy(() => import("@components/page-partials/pages/Home"));
const ExperimentalPage = lazy(
  () => import("@components/page-partials/pages/Experimental")
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
];
