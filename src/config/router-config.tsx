import AuthGuard from "@/components/auth/auth-guard";
import { AppRoute } from "@/types/route";
import { ChartSpline, LayoutDashboard } from "lucide-react";
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

const TaskAnalytics = lazy(
  () => import("../components/page-partials/pages/task-manager/pages/Analytics")
);

const Test = lazy(
  () => import("../components/page-partials/pages/experimental/test")
);
const BirdyBeats = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/bidry-beats/bidry-beats"
    )
);
const ThreePhysicsEngine = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/physics-engine/init"
    )
);

const ThreeStaging = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/staging/init"
    )
);

const ThreeViews = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/three-views/init"
    )
);

const ThreeCameraControls = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/camera-controls/init"
    )
);

const ThreeRenderTarget = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/render-target/init"
    )
);

const ThreePostProcessing = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/post-processing/init"
    )
);

const ThreeTheatreJs = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/theatre-js/init"
    )
);

const ThreeOptimization = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/optimization/init"
    )
);

const ThreeShaderIntro = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/shader-intro/init"
    )
);

const ThreeShaderShapingFunctions = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/shader-shaping-functions/init"
    )
);

const ThreeShaderImageSlider = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/shader-image-slider/init"
    )
);

const ThreeWaterShader = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/shader-water/init"
    )
);

const ThreeTransitionShader = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/shader-transition/init"
    )
);

const ThreeVFXParticles = lazy(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/vfx-particles/init"
    )
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
  TASK_ANALYTICS = "analytics/:id",
  LOGIN = "/login",
  EXPERIMENTAL_TEST = "test",
  EXPERIMENTAL_BIRDY_BEATS = "birdy-beats",
  EXPERIMENTAL_THREE_PHYSICS_ENGINE = "three-physics-engine",
  EXPERIMENTAL_THREE_STAGING = "three-staging",
  EXPERIMENTAL_THREE_VIEWS = "three-views",
  EXPERIMENTAL_THREE_CAMERA_CONTROLS = "three-camera-controls",
  EXPERIMENTAL_THREE_RENDER_TARGET = "three-render-target",
  EXPERIMENTAL_THREE_POST_PROCESSING = "three-post-processing",
  EXPERIMENTAL_THREE_THEATRE_JS = "three-theatre-js",
  EXPERIMENTAL_THREE_OPTIMIZATION = "three-optimization",
  EXPERIMENTAL_THREE_SHADER_INTRO = "three-shader-intro",
  EXPERIMENTAL_THREE_SHADER_SHAPING_FUNCTIONS = "three-shader-shaping-functions",
  EXPERIMENTAL_THREE_SHADER_IMAGE_SLIDER = "three-shader-image-slider",
  EXPERIMENTAL_THREE_SHADER_WATER = "three-shader-water",
  EXPERIMENTAL_THREE_SHADER_TRANSITION = "three-shader-transition",
  EXPERIMENTAL_VFX_PARTICLES = "three-vfx-particles",
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
  {
    path: RoutPath.TASK_ANALYTICS,
    Component: TaskAnalytics,
    id: "task-manager-analytics",
    isNav: false,
    icon: <ChartSpline />,
  },
];

export const EXPERIMENTAL_ROUTERS = [
  {
    path: RoutPath.EXPERIMENTAL_TEST,
    Component: Test,
    id: "experimental-test",
    icon: "🚀",
  },
  {
    path: RoutPath.EXPERIMENTAL_BIRDY_BEATS,
    Component: BirdyBeats,
    id: "experimental-birdy-beats",
    icon: "🐦",
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_PHYSICS_ENGINE,
    Component: ThreePhysicsEngine,
    id: "experimental-three-physics-engine",
    icon: "🌌",
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_STAGING,
    Component: ThreeStaging,
    id: "experimental-three-staging",
    icon: "🎭",
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_VIEWS,
    Component: ThreeViews,
    id: "experimental-three-views",
    icon: "👀",
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_CAMERA_CONTROLS,
    Component: ThreeCameraControls,
    id: "experimental-three-camera-controls",
    icon: "🎥",
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_RENDER_TARGET,
    Component: ThreeRenderTarget,
    id: "experimental-three-render-target",
    icon: "🎯",
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_POST_PROCESSING,
    Component: ThreePostProcessing,
    id: "experimental-three-post-processing",
    icon: "🖼️",
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_THEATRE_JS,
    Component: ThreeTheatreJs,
    id: "experimental-three-theatre-js",
    icon: "🎭",
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_OPTIMIZATION,
    Component: ThreeOptimization,
    id: "experimental-three-optimization",
    icon: "⚙️",
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_SHADER_INTRO,
    Component: ThreeShaderIntro,
    id: "experimental-three-shader-intro",
    icon: "🎨",
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_SHADER_SHAPING_FUNCTIONS,
    Component: ThreeShaderShapingFunctions,
    id: "experimental-three-shader-shaping-functions",
    icon: "🖌️",
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_SHADER_IMAGE_SLIDER,
    Component: ThreeShaderImageSlider,
    id: "experimental-three-shader-image-slider",
    icon: "🖼️",
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_SHADER_WATER,
    Component: ThreeWaterShader,
    id: "experimental-three-shader-water",
    icon: "💧",
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_SHADER_TRANSITION,
    Component: ThreeTransitionShader,
    id: "experimental-three-shader-transition",
    icon: "🔄",
  },
  {
    path: RoutPath.EXPERIMENTAL_VFX_PARTICLES,
    Component: ThreeVFXParticles,
    id: "experimental-three-vfx-particles",
    icon: "✨",
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
    isDev: false, // Set to true for development purposes
    children: [
      ...EXPERIMENTAL_ROUTERS,
      {
        path: "",
        Component: () => <Navigate to={RoutPath.EXPERIMENTAL_TEST} replace />,
        id: "experimental-redirect",
        isNav: false,
      },
    ],
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
