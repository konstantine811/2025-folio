import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      },
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "favicon.ico", "robots.txt"],
      manifest: {
        name: "AbcFolio",
        short_name: "AbcFolio",
        description: "Abramov Constantin Abc Folio",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "browser",
        scope: "/",
        start_url: "/?source=pwa",
        icons: [
          {
            src: "logo-3d.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "logo-3d.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@config": path.resolve(__dirname, "src/config"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@storage": path.resolve(__dirname, "src/storage"),
      "@services": path.resolve(__dirname, "src/services"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@custom-types": path.resolve(__dirname, "src/types"),
    },
  },
  server: {
    fs: {
      strict: false,
    },
  },
  build: {
    rollupOptions: {
      input: "/index.html",
    },
  },
});
