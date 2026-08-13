import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  optimizeDeps: {
    // Vite's dep pre-bundling mishandles maplibre-gl's internal Web
    // Worker - confirmed empirically: the worker request 404s in dev and
    // no vector tiles ever load as a result. Excluding it lets the
    // browser load its real ESM module graph directly instead.
    exclude: ["maplibre-gl"],
  },
});
