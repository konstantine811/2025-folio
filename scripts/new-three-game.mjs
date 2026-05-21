#!/usr/bin/env node
/**
 * Scaffold a Three.js game demo and register it in three-game-demos.registry.ts
 *
 * Usage:
 *   npm run new:three-game -- my-game "My Game" "Short description for labs card."
 *
 * Optional flags:
 *   --icon "🎮"
 *   --image my-game-preview
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const registryPath = path.join(
  root,
  "src/config/experimental/three-game-demos.registry.ts",
);

const gamesRoot = path.join(
  root,
  "src/components/page-partials/pages/experimental/three-scenes/games",
);

function parseArgs(argv) {
  const positional = [];
  const flags = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      flags[key] = argv[index + 1];
      index += 1;
      continue;
    }

    positional.push(arg);
  }

  return { positional, flags };
}

function toSlug(folder) {
  return `three-${folder}`;
}

function toId(folder) {
  return `experimental-three-${folder}`;
}

function assertKebabCase(folder) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(folder)) {
    throw new Error(
      `Folder name must be kebab-case (e.g. sim-city-game), got: "${folder}"`,
    );
  }
}

function createGameFolder(folder) {
  const gameDir = path.join(gamesRoot, folder);
  const experienceDir = path.join(gameDir, "experience");

  if (fs.existsSync(gameDir)) {
    console.log(`Folder already exists: ${gameDir}`);
    return;
  }

  fs.mkdirSync(experienceDir, { recursive: true });

  fs.writeFileSync(
    path.join(gameDir, "init.tsx"),
    `import MainWrapperOffset from "@/components/ui-abc/main-wrapper-offset";
import { Canvas } from "@react-three/fiber";
import ThreeLoader from "../../common/three-loader";
import Experience from "./experience/experience";

const Init = () => {
  return (
    <MainWrapperOffset isFullHeight className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        <ThreeLoader />
        <Canvas
          className="!absolute inset-0 touch-none"
          style={{ width: "100%", height: "100%" }}
          camera={{ position: [0, 4, 8], fov: 50 }}
        >
          <Experience />
        </Canvas>
      </div>
    </MainWrapperOffset>
  );
};

export default Init;
`,
  );

  fs.writeFileSync(
    path.join(experienceDir, "experience.tsx"),
    `const Experience = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 8, 2]} intensity={1.2} />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="#6ee7a8" />
      </mesh>
    </>
  );
};

export default Experience;
`,
  );

  console.log(`Created game scaffold: ${gameDir}`);
}

function appendRegistryEntry({ folder, description, icon, imageName }) {
  const registry = fs.readFileSync(registryPath, "utf8");

  if (registry.includes(`folder: "${folder}"`)) {
    console.log(`Registry already contains folder: ${folder}`);
    return;
  }

  const slug = toSlug(folder);
  const id = toId(folder);

  const loaderBlock = `  "${folder}": () =>
    import(
      "@/components/page-partials/pages/experimental/three-scenes/games/${folder}/init"
    ),`;

  const demoBlock = `  {
    slug: "${slug}",
    folder: "${folder}",
    id: "${id}",
    icon: "${icon}",
    description: "${description}",
    imageName: "${imageName}",
  },`;

  const loadersNeedle = "const gameLoaders";
  const demosNeedle = "export const THREE_GAME_DEMOS";

  const loadersStart = registry.indexOf("{", registry.indexOf(gameLoaders));
  const loadersEnd = registry.indexOf("};", loadersStart);

  const demosStart = registry.indexOf("[", registry.indexOf(demosNeedle));
  const demosEnd = registry.indexOf("];", demosStart);

  const nextRegistry =
    registry.slice(0, loadersEnd) +
    (registry[loadersEnd - 1] === "}" ? ",\n" : "\n") +
    loaderBlock +
    registry.slice(loadersEnd) ;

  const demosIndex = nextRegistry.indexOf("[", nextRegistry.indexOf(demosNeedle));
  const demosClose = nextRegistry.indexOf("];", demosIndex);

  const finalRegistry =
    nextRegistry.slice(0, demosClose) +
    demoBlock +
    "\n" +
    nextRegistry.slice(demosClose);

  fs.writeFileSync(registryPath, finalRegistry);
  console.log(`Updated registry: ${registryPath}`);
  console.log(`Route: /labs/${slug}`);
}

function main() {
  const { positional, flags } = parseArgs(process.argv.slice(2));
  const [folder, title, descriptionArg] = positional;

  if (!folder) {
    console.error(
      'Usage: npm run new:three-game -- <folder> "<title>" "<description>" [--icon "🎮"] [--image preview-name]',
    );
    process.exit(1);
  }

  assertKebabCase(folder);

  const description =
    descriptionArg ||
    `${title || folder} — Three.js game demo.` ||
    "Three.js game demo.";
  const icon = flags.icon || "🎮";
  const imageName = flags.image || folder;

  createGameFolder(folder);
  appendRegistryEntry({ folder, description, icon, imageName });

  console.log("\nNext steps:");
  console.log(`- Add preview image: public/images/three-views-scene/page_images/${imageName}.jpg`);
  console.log("- Implement scene in experience/experience.tsx");
  console.log("- Run npm run dev and open /labs/" + toSlug(folder));
}

main();
