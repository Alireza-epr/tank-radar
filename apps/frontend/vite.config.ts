import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";

const emitMaplibreWorker = (): Plugin => ({
  name: "emit-maplibre-gl-worker",
  apply: "build",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "assets/maplibre-gl-worker.mjs",
      source: readFileSync(fileURLToPath(import.meta.resolve("maplibre-gl/dist/maplibre-gl-worker.mjs"))),
    });
  },
});

export default defineConfig({
  plugins: [vue(), emitMaplibreWorker()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ["maplibre-gl"],
  },
});
