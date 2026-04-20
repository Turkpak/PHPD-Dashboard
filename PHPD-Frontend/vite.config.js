import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "node:url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images.js";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Conditionally load Replit plugins only if in Replit environment
const getReplitPlugins = () => {
  if (process.env.NODE_ENV === "production" || !process.env.REPL_ID) {
    return [];
  }

  // These will be loaded dynamically in server/vite.ts if needed
  // For now, return empty array to avoid top-level await issues
  return [];
};

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    metaImagesPlugin(),
    ...getReplitPlugins(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
      "@assets": path.resolve(rootDir, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  build: {
    outDir: path.resolve(rootDir, "dist"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    fs: {
      strict: false,
      deny: ["**/.*"],
    },
    // Proxy /api to Django so requests are same-origin and response comes back (no CORS)
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});

