import AuthGuard from "@/components/auth/auth-guard";
import { AppRoute } from "@/types/route";
import { ChartSpline, LayoutDashboard } from "lucide-react";
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { Navigate } from "react-router";

type Routable = ComponentType<object>;

export function lazyPage<P extends object>(
  loader: () => Promise<{ default: ComponentType<P> }>
): LazyExoticComponent<Routable> {
  return lazy(loader) as LazyExoticComponent<Routable>;
}

const HomePage = lazyPage(
  () => import("../components/page-partials/pages/Home")
);
const ExperimentalPage = lazyPage(
  () => import("../components/page-partials/pages/Experimental")
);
const BlogPage = lazyPage(
  () => import("../components/page-partials/pages/blog/Blog")
);

const ArticlePage = lazyPage(
  () => import("../components/page-partials/pages/blog/Article")
);

const TaskManager = lazyPage(
  () => import("../components/page-partials/pages/task-manager/TaskManager")
);
const TemplateTask = lazyPage(
  () =>
    import("../components/page-partials/pages/task-manager/pages/TemplateTask")
);
const DailyTask = lazyPage(
  () => import("../components/page-partials/pages/task-manager/pages/DailyTask")
);

const TaskAnalytics = lazyPage(
  () => import("../components/page-partials/pages/task-manager/pages/Analytics")
);

// const Test = lazyPage(
//   () => import("../components/page-partials/pages/experimental/test")
// );
// const BirdyBeats = lazyPage(
//   () =>
//     import(
//       "../components/page-partials/pages/experimental/bidry-beats/bidry-beats"
//     )
// );
const ThreePhysicsEngine = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/physics-engine/init"
    )
);

const ThreeStaging = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/staging/init"
    )
);

const ThreeViews = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/three-views/init"
    )
);

const ThreeCameraControls = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/camera-controls/init"
    )
);

const ThreeRenderTarget = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/render-target/init"
    )
);

const ThreePostProcessing = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/post-processing/init"
    )
);

const ThreeTheatreJs = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/theatre-js/init"
    )
);

const ThreeOptimization = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/optimization/init"
    )
);

const ThreeShaderIntro = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/shader-intro/init"
    )
);

const ThreeShaderShapingFunctions = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/shader-shaping-functions/init"
    )
);

const ThreeShaderImageSlider = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/shader-image-slider/init"
    )
);

const ThreeWaterShader = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/shader-water/init"
    )
);

const ThreeTransitionShader = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/shader-transition/init"
    )
);

const ThreeVFXParticles = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/vfx-particles/init"
    )
);

const ThreeVFXTrail = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/vfx-trail/init"
    )
);

const ThreeCubicWorldsGame = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/cubic-worlds-game/init"
    )
);

const ThreeVFXEngine = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/vfx-engine/init"
    )
);

const TwoCanvasFirstSimpleBall = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/2d-canvas/first-simple-ball/init"
    )
);

const ThreeVFXFireworks = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/vfx-fireworks/init"
    )
);

const TwoCanvasPhysicsTrain = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/2d-canvas/physics-train/wrap"
    )
);

const ThreeWizardGame = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/wizard-game/init"
    )
);

const ThreeWebGPU = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/webgpu/init"
    )
);

const ThreeHome3D = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/home-3d/init"
    )
);

const ThreeAi = lazyPage(
  () =>
    import(
      "../components/page-partials/pages/experimental/three-scenes/ai-three/init"
    )
);

const LoginPage = lazyPage(
  () => import("../components/page-partials/pages/Login")
);

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
  EXPERIMENTAL_VFX_TRAIL = "three-vfx-trail",
  EXPERIMENTAL_CUBIC_WORLDS_GAME = "three-cubic-worlds-game",
  EXPERIMENTAL_VFX_ENGINE = "three-vfx-engine",
  EXPERIMENTAL_2D_CANVAS_FIRST_SIMPLE_BALL = "two-canvas-first-simple-ball",
  EXPERIMENTAL_THREE_VFX_FIREWORKS = "three-vfx-fireworks",
  EXPERIMENTAL_2D_CANVAS_PHYSICS_TRAIN = "two-canvas-physics-train",
  EXPERIMENTAL_THREE_WIZARD_GAME = "three-wizard-game",
  EXPERIMENTAL_THREE_WEB_GPU = "three-web-gpu",
  EXPERIMENTAL_THREE_HOME_3D = "three-home-3d",
  EXPERIMENTAL_THREE_AI = "three-ai",
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

const imagePath = (imageName: string, format = "jpg") => {
  return `images/three-views-scene/page_images/${imageName}.${format}`;
};

export const EXPERIMENTAL_ROUTERS: AppRoute[] = [
  // {
  //   path: RoutPath.EXPERIMENTAL_TEST,
  //   Component: Test,
  //   id: "experimental-test",
  //   icon: "🚀",
  // },
  // {
  //   path: RoutPath.EXPERIMENTAL_BIRDY_BEATS,
  //   Component: BirdyBeats,
  //   id: "experimental-birdy-beats",
  //   icon: "🐦",
  // },
  {
    path: RoutPath.EXPERIMENTAL_THREE_PHYSICS_ENGINE,
    Component: ThreePhysicsEngine,
    id: "experimental-three-physics-engine",
    imageUrl: imagePath("three-physics-engine"),
    description:
      "A simple physics engine simulation using Three.js and Rapier.js.",
    icon: "🌌",
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_STAGING,
    Component: ThreeStaging,
    id: "experimental-three-staging",
    icon: "🎭",
    description:
      "Demonstration of scene staging and management in Three.js applications.",
    imageUrl: imagePath("three-staging"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_VIEWS,
    Component: ThreeViews,
    id: "experimental-three-views",
    icon: "👀",
    description:
      "A Three.js scene showcasing multiple camera views and perspectives.",
    imageUrl: imagePath("three-views"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_CAMERA_CONTROLS,
    Component: ThreeCameraControls,
    id: "experimental-three-camera-controls",
    icon: "🎥",
    description:
      "Exploring various camera controls and interactions in Three.js.",
    imageUrl: imagePath("three-camera-controls"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_RENDER_TARGET,
    Component: ThreeRenderTarget,
    id: "experimental-three-render-target",
    icon: "🎯",
    description:
      "Using render targets in Three.js for advanced rendering techniques.",
    imageUrl: imagePath("three-render-target"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_POST_PROCESSING,
    Component: ThreePostProcessing,
    id: "experimental-three-post-processing",
    icon: "🖼️",
    description: "Post-processing effects and techniques in Three.js.",
    imageUrl: imagePath("three-post-processing"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_THEATRE_JS,
    Component: ThreeTheatreJs,
    id: "experimental-three-theatre-js",
    icon: "🎭",
    description:
      "Integrating Theatre.js for animation and scene management in Three.js.",
    imageUrl: imagePath("three-theatre-js"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_OPTIMIZATION,
    Component: ThreeOptimization,
    id: "experimental-three-optimization",
    icon: "⚙️",
    description:
      "Techniques and strategies for optimizing Three.js applications.",
    imageUrl: imagePath("three-optimization"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_SHADER_INTRO,
    Component: ThreeShaderIntro,
    id: "experimental-three-shader-intro",
    icon: "🎨",
    description: "An introduction to shaders and GLSL in Three.js.",
    imageUrl: imagePath("three-shader-intro"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_SHADER_SHAPING_FUNCTIONS,
    Component: ThreeShaderShapingFunctions,
    id: "experimental-three-shader-shaping-functions",
    icon: "🖌️",
    description: "Exploring shaping functions in GLSL shaders with Three.js.",
    imageUrl: imagePath("three-shader-shaping-functions"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_SHADER_IMAGE_SLIDER,
    Component: ThreeShaderImageSlider,
    id: "experimental-three-shader-image-slider",
    icon: "🖼️",
    description: "Creating an image slider using shaders in Three.js.",
    imageUrl: imagePath("three-shader-image-slider"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_SHADER_WATER,
    Component: ThreeWaterShader,
    id: "experimental-three-shader-water",
    icon: "💧",
    description: "A realistic water shader implementation in Three.js.",
    imageUrl: imagePath("three-shader-water"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_SHADER_TRANSITION,
    Component: ThreeTransitionShader,
    id: "experimental-three-shader-transition",
    icon: "🔄",
    description: "Shader-based transitions and effects in Three.js.",
    imageUrl: imagePath("three-shader-transition"),
  },
  {
    path: RoutPath.EXPERIMENTAL_VFX_PARTICLES,
    Component: ThreeVFXParticles,
    id: "experimental-three-vfx-particles",
    icon: "✨",
    description: "Creating stunning particle effects using Three.js.",
    imageUrl: imagePath("three-vfx-particles"),
  },
  {
    path: RoutPath.EXPERIMENTAL_VFX_TRAIL,
    Component: ThreeVFXTrail,
    id: "experimental-three-vfx-trail",
    icon: "🌠",
    description: "Implementing trail effects in Three.js for dynamic visuals.",
    imageUrl: imagePath("three-vfx-trail"),
  },
  {
    path: RoutPath.EXPERIMENTAL_CUBIC_WORLDS_GAME,
    Component: ThreeCubicWorldsGame,
    id: "experimental-three-cubic-worlds-game",
    icon: "🕹️",
    description: "A simple cubic worlds game built with Three.js.",
    imageUrl: imagePath("three-cubic-worlds-game"),
  },
  {
    path: RoutPath.EXPERIMENTAL_VFX_ENGINE,
    Component: ThreeVFXEngine,
    id: "experimental-three-vfx-engine",
    icon: "⚙️",
    description:
      "A visual effects engine using Three.js for real-time graphics.",
    imageUrl: imagePath("three-vfx-engine"),
  },
  {
    path: RoutPath.EXPERIMENTAL_2D_CANVAS_FIRST_SIMPLE_BALL,
    Component: TwoCanvasFirstSimpleBall,
    id: "experimental-two-canvas-first-simple-ball",
    icon: "🎨",
    description: "A simple 2D canvas example drawing and animating a ball.",
    imageUrl: imagePath("two-canvas-first-simple-ball"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_VFX_FIREWORKS,
    Component: ThreeVFXFireworks,
    id: "experimental-three-vfx-fireworks",
    icon: "🎆",
    description: "Creating fireworks effects using Three.js for celebrations.",
    imageUrl: imagePath("three-vfx-fireworks"),
  },
  {
    path: RoutPath.EXPERIMENTAL_2D_CANVAS_PHYSICS_TRAIN,
    Component: TwoCanvasPhysicsTrain,
    id: "experimental-two-canvas-physics-train",
    icon: "🚂",
    description: "A 2D canvas simulation of a physics-based train system.",
    imageUrl: imagePath("two-canvas-physics-train"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_WIZARD_GAME,
    Component: ThreeWizardGame,
    id: "experimental-three-wizard-game",
    icon: "🧙‍♂️",
    description: "A magical wizard game created with Three.js.",
    imageUrl: imagePath("three-wizard-game"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_WEB_GPU,
    Component: ThreeWebGPU,
    id: "experimental-three-web-gpu",
    icon: "🌐",
    description:
      "Exploring WebGPU capabilities with Three.js for next-gen graphics.",
    imageUrl: imagePath("three-web-gpu"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_HOME_3D,
    Component: ThreeHome3D,
    id: "experimental-three-home-3d",
    icon: "🏠",
    description: "A 3D home scene created with Three.js.",
    imageUrl: imagePath("home_earth"),
  },
  {
    path: RoutPath.EXPERIMENTAL_THREE_AI,
    Component: ThreeAi,
    id: "experimental-three-ai",
    icon: "🤖",
    description: "A 3D AI scene created with Three.js.",
    imageUrl: imagePath("three-ai"),
  },
];

export const router: AppRoute[] = [
  {
    path: RoutPath.HOME,
    Component: HomePage,
    isNav: true,
    id: "home",
    isDev: false, // Set to true for development purposes
  },
  {
    path: RoutPath.EXPERIMENTAL,
    Component: ExperimentalPage,
    isNav: true,
    id: "experimental",
    isDev: false, // Set to true for development purposes
  },
  ...EXPERIMENTAL_ROUTERS,
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
