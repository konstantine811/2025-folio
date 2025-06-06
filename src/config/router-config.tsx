import AuthGuard from "@/components/auth/auth-guard";
import { AppRoute } from "@/types/route";
import { LayoutDashboard } from "lucide-react";
import { lazy } from "react";
import { Navigate } from "react-router";

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

const TaskManager = lazy(
  () => import("../components/page-partials/pages/task-manager/TaskManager")
);
const TemplateTask = lazy(
  () =>
    import("../components/page-partials/pages/task-manager/pages/TemplateTask")
);
const DailyTask = lazy(
  () => import("../components/page-partials/pages/task-manager/pages/DailyTask")
);

const LoginPage = lazy(() => import("../components/page-partials/pages/Login"));

export enum RoutPath {
  HOME = "/",
  EXPERIMENTAL = "/experimental",
  BLOG = "/blog",
  ARTICLE = "/blog/:id",
  TASK_MANAGER = "/task-manager",
  TASK_MANAGER_TEMPLATE = "template",
  TASK_MANAGER_DAILY = "daily/:id",
  LOGIN = "/login",
}

export const DEFAULT_LOCALE_PLUG = "https://custom.local";
export const DEFAULT_OBSIDIAN_VAULT = {
  blogVault: "Blog",
};

export const TASK_MANAGER_ROUTERS = [
  {
    path: RoutPath.TASK_MANAGER_TEMPLATE,
    Component: TemplateTask,
    id: "task-manager-template",
    isNav: false,
    icon: <LayoutDashboard />,
  },
  {
    path: RoutPath.TASK_MANAGER_DAILY,
    Component: DailyTask,
    id: "task-manager-daily",
    isNav: false,
    icon: "🚶",
  },
];

export const router: AppRoute[] = [
  {
    path: RoutPath.HOME,
    Component: HomePage,
    isNav: true,
    id: "home",
    isDev: true, // Set to true for development purposes
  },
  {
    path: RoutPath.EXPERIMENTAL,
    Component: ExperimentalPage,
    isNav: true,
    id: "experimental",
    isDev: true, // Set to true for development purposes
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
    path: RoutPath.TASK_MANAGER,
    Component: () => (
      <AuthGuard>
        <TaskManager />
      </AuthGuard>
    ),
    isNav: true,
    id: "task-manager",
    children: [
      ...TASK_MANAGER_ROUTERS,
      {
        path: "",
        Component: () => (
          <Navigate to={RoutPath.TASK_MANAGER_TEMPLATE} replace />
        ),
        id: "task-manager-redirect",
        isNav: false,
      },
    ],
  },
  {
    path: RoutPath.LOGIN,
    Component: LoginPage,
    isNav: false,
    id: "login",
  },
  {
    path: "*",
    Component: HomePage,
    isNav: false,
    id: "not-found",
  },
];
