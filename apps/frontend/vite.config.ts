import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import vue from "@vitejs/plugin-vue";

const emitMaplibreWorker = (): Plugin => ({
  name: "emit-maplibre-gl-worker",
  apply: "build",
  generateBundle() {
    // maplibre-gl-worker.mjs itself imports a sibling maplibre-gl-shared.mjs
    // (its own dist files are meant to be deployed together, unbundled) -
    // both need to be emitted or the worker's own import 404s.
    for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
      this.emitFile({
        type: "asset",
        fileName: `assets/${file}`,
        source: readFileSync(
          fileURLToPath(import.meta.resolve(`maplibre-gl/dist/${file}`)),
        ),
      });
    }
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
