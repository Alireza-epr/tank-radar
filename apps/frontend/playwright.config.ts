import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/e2e",
  // No reporter is configured by default, so nothing ever gets written to
  // disk for CI to upload - html writes playwright-report/ every run.
  reporter: [["html", { open: "never" }]],
  webServer: [
    {
      // Header syncs against a real backend, not a mock - start it too.
      command: "npm run dev",
      cwd: "../backend",
      url: "http://localhost:1370/v1/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "npm run dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
  use: {
    baseURL: "http://localhost:5173",
  },
});
